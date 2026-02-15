import type { RenderManualFieldExtensionConfigScreenCtx } from "datocms-plugin-sdk";
import { useId, useMemo, useState } from "react";
import { Canvas, Section, TextareaField, TextField } from "datocms-react-ui";
import { useQueryConfig } from "../hooks/useQueryConfig";
import { hasUnresolvedKeys, interpolate } from "../utils/interpolate";
import { parseGlobalConfig } from "../utils/parseGlobalConfig";

type Props = {
	ctx: RenderManualFieldExtensionConfigScreenCtx;
};

export default function FieldConfigScreen({ ctx }: Props) {
	const prefixPattern =
		(ctx.parameters.prefixPattern as string | undefined) ?? "";
	const queryConfig =
		(ctx.parameters.queryConfig as string | undefined) ?? "";

	const [localPattern, setLocalPattern] = useState(prefixPattern);
	const [localQueryConfig, setLocalQueryConfig] = useState(queryConfig);
	const [sectionOpen, setSectionOpen] = useState(false);
	const prefixPatternId = useId();
	const queryConfigId = useId();

	const pluginParams = ctx.plugin.attributes.parameters as Record<
		string,
		unknown
	>;
	const apiKey = (pluginParams.apiKey as string | undefined) ?? "";
	const globalConfig = useMemo(
		() => parseGlobalConfig(pluginParams),
		[pluginParams],
	);
	const globalEntries = Object.entries(globalConfig);

	const { values: queriedValues, error: queryError } = useQueryConfig(
		localQueryConfig,
		apiKey,
	);
	const allValues = useMemo(
		() => ({ ...globalConfig, ...queriedValues }),
		[globalConfig, queriedValues],
	);

	const resolved = interpolate(localPattern, allValues);
	const hasUnresolved = hasUnresolvedKeys(localPattern, allValues);

	const setParams = (
		pattern: string,
		qConfig: string,
	) => {
		ctx.setParameters({ prefixPattern: pattern, queryConfig: qConfig });
	};

	const handlePatternChange = (value: string) => {
		setLocalPattern(value);
		setParams(value, localQueryConfig);
	};

	const handleQueryConfigChange = (value: string) => {
		setLocalQueryConfig(value);
		setParams(localPattern, value);
	};

	return (
		<Canvas ctx={ctx}>
			<TextField
				id={prefixPatternId}
				name="prefixPattern"
				label="Prefix Pattern"
				hint={
					<>
						The prefix displayed before slugs. Use <code>{"{{KEY}}"}</code>{" "}
						tokens to insert values from the global config or queries below.
					</>
				}
				value={localPattern}
				onChange={handlePatternChange}
				placeholder="{{BLOG_SLUG}}/"
			/>

			<TextareaField
				id={queryConfigId}
				name="queryConfig"
				label="Query Config"
				hint={
					<>
						A JSON object mapping keys to dot-notation DatoCMS query paths. Each
						path is converted to a GraphQL query against the Content Delivery
						API. Example:{" "}
						<code>
							{'{"BLOG_SLUG": "siteSettingsModel.blogPage.slug"}'}
						</code>
					</>
				}
				error={queryError ?? undefined}
				value={localQueryConfig}
				onChange={handleQueryConfigChange}
				placeholder={'{"BLOG_SLUG": "siteSettingsModel.blogPage.slug"}'}
			/>

			{localPattern && (
				<p>
					Preview:{" "}
					<strong>{resolved}</strong>
					{hasUnresolved && (
						<>
							{" "}
							— <em>Warning: some keys are not defined</em>
						</>
					)}
				</p>
			)}

			{globalEntries.length > 0 && (
				<Section
					title="Global Config Reference"
					collapsible={{
						isOpen: sectionOpen,
						onToggle: () => setSectionOpen((o) => !o),
					}}
				>
					<ul>
						{globalEntries.map(([key, value]) => (
							<li key={key}>
								<code>{`{{${key}}}`}</code> → <code>{value}</code>
							</li>
						))}
					</ul>
				</Section>
			)}
		</Canvas>
	);
}
