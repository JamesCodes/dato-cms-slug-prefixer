import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Canvas, TextInput } from "datocms-react-ui";
import { useQueryConfig } from "../hooks/useQueryConfig";
import { interpolate } from "../utils/interpolate";
import { parseGlobalConfig } from "../utils/parseGlobalConfig";
import { slugify } from "../utils/slugify";
import s from "./styles.module.css";

type Props = {
	ctx: RenderFieldExtensionCtx;
};

function getFieldValue(
	formValues: Record<string, unknown>,
	apiKey: string,
	locale: string,
	localized: boolean,
): string {
	const raw = formValues[apiKey];
	if (!localized) return (raw as string) ?? "";
	if (raw && typeof raw === "object") {
		return ((raw as Record<string, unknown>)[locale] as string) ?? "";
	}
	return "";
}

export default function SlugFieldEditor({ ctx }: Props) {
	const slugValue =
		(ctx.formValues[ctx.fieldPath] as string | null | undefined) ?? "";

	// Resolve prefix (display-only — not stored in the field value)
	const prefixPattern =
		(ctx.parameters.prefixPattern as string | undefined) ?? "";
	const queryConfigJson =
		(ctx.parameters.queryConfig as string | undefined) ?? "";
	const pluginParams = ctx.plugin.attributes.parameters as Record<
		string,
		unknown
	>;
	const apiKey = (pluginParams.apiKey as string | undefined) ?? "";
	const globalConfig = useMemo(
		() => parseGlobalConfig(pluginParams),
		[pluginParams],
	);
	const { values: queriedValues } = useQueryConfig(queryConfigJson, apiKey);
	const allValues = useMemo(
		() => ({ ...globalConfig, ...queriedValues }),
		[globalConfig, queriedValues],
	);
	const resolvedPrefix = prefixPattern
		? interpolate(prefixPattern, allValues)
		: "";

	// Resolve the title field linked via slug_title_field validator
	const titleFieldId = (
		ctx.field.attributes.validators as Record<string, unknown>
	).slug_title_field
		? (
				(ctx.field.attributes.validators as Record<string, unknown>)
					.slug_title_field as { title_field_id: string }
			).title_field_id
		: null;

	const titleField = titleFieldId ? ctx.fields[titleFieldId] : null;

	const titleValue = titleField
		? getFieldValue(
				ctx.formValues,
				titleField.attributes.api_key,
				ctx.locale,
				titleField.attributes.localized,
			)
		: "";

	const [localValue, setLocalValue] = useState(slugValue);
	const hasBeenGenerated = useRef(!!slugValue);
	const lastGeneratedFrom = useRef<string | null>(null);

	// Sync local value when the slug changes externally
	useEffect(() => {
		setLocalValue(slugValue);
	}, [slugValue]);

	// Auto-generate slug from title when slug is still empty
	useEffect(() => {
		if (!hasBeenGenerated.current && titleValue) {
			const generated = slugify(titleValue);
			if (generated) {
				ctx.setFieldValue(ctx.fieldPath, generated);
				hasBeenGenerated.current = true;
				lastGeneratedFrom.current = titleValue;
			}
		}
	}, [titleValue, ctx]);

	const handleBlur = () => {
		const slugified = slugify(localValue);
		if (slugified !== slugValue) {
			ctx.setFieldValue(ctx.fieldPath, slugified);
			hasBeenGenerated.current = true;
		}
	};

	const handleRegenerate = () => {
		const generated = slugify(titleValue);
		ctx.setFieldValue(ctx.fieldPath, generated);
		lastGeneratedFrom.current = titleValue;
		setLocalValue(generated);
	};

	const showRegenerate =
		titleField &&
		hasBeenGenerated.current &&
		titleValue &&
		slugify(titleValue) !== slugValue;

	return (
		<Canvas ctx={ctx}>
			<div className={s.slugEditor}>
				{resolvedPrefix && (
					<span className={s.prefixLabel}>{resolvedPrefix}</span>
				)}
				<TextInput
					value={localValue}
					onChange={(value) => setLocalValue(value)}
					onBlur={handleBlur}
					placeholder="enter-a-slug"
					disabled={ctx.disabled}
				/>
				{showRegenerate && (
					<Button
						type="button"
						buttonType="muted"
						buttonSize="xs"
						onClick={handleRegenerate}
					>
						Regenerate
					</Button>
				)}
			</div>
		</Canvas>
	);
}
