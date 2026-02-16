import type { RenderManualFieldExtensionConfigScreenCtx } from "datocms-plugin-sdk";
import { Canvas, FieldGroup, Section } from "datocms-react-ui";
import { useMemo, useState } from "react";
import JsonEditorField from "../components/JsonEditorField";
import PatternField from "../components/PatternField";
import { useQueryConfig } from "../hooks/useQueryConfig";
import { hasUnresolvedKeys, interpolate } from "../utils/interpolate";
import { parseGlobalConfig } from "../utils/parseGlobalConfig";
import s from "./styles.module.css";

type Props = {
	ctx: RenderManualFieldExtensionConfigScreenCtx;
};

export default function FieldConfigScreen({ ctx }: Props) {
	const prefixPattern = (ctx.parameters.prefixPattern as string | undefined) ?? "";
	const queryConfig = (ctx.parameters.queryConfig as string | undefined) ?? "";

	const [localPattern, setLocalPattern] = useState(prefixPattern);
	const [localQueryConfig, setLocalQueryConfig] = useState(queryConfig);
	const [sectionOpen, setSectionOpen] = useState(false);

	const pluginParams = ctx.plugin.attributes.parameters as Record<string, unknown>;
	const apiKey = (pluginParams.apiKey as string | undefined) ?? "";
	const globalConfigRaw = (pluginParams.globalConfig as string | undefined) ?? "";
	const globalConfig = useMemo(() => parseGlobalConfig(globalConfigRaw), [globalConfigRaw]);
	const globalEntries = Object.entries(globalConfig);

	const { values: queriedValues, error: queryError } = useQueryConfig(localQueryConfig, apiKey);
	const allValues = useMemo(
		() => ({ ...globalConfig, ...queriedValues }),
		[globalConfig, queriedValues],
	);

	const resolved = interpolate(localPattern, allValues);
	const hasUnresolved = hasUnresolvedKeys(localPattern, allValues);

	const setParams = (pattern: string, qConfig: string) => {
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
			{queryError && (
				<p className={s.queryError}>
					Query error: {queryError}{" "}
					<button
						type="button"
						className={s.settingsLink}
						onClick={() => ctx.navigateTo(`/admin/plugins/${ctx.plugin.id}/edit`)}
					>
						Open plugin settings
					</button>
				</p>
			)}
			<FieldGroup>
				<PatternField
					label="Prefix Pattern"
					hint={
						<>
							The prefix displayed before slugs. Use <code>{"{{KEY}}"}</code> tokens to insert
							values from the global config or queries below.
							{localPattern && (
								<>
									<br />
									Preview: <strong>{resolved}</strong>
									{hasUnresolved && (
										<>
											{" "}
											— <em>some tokens are not yet defined</em>
										</>
									)}
								</>
							)}
						</>
					}
					value={localPattern}
					onChange={handlePatternChange}
					placeholder="{{BLOG_SLUG}}/"
					values={allValues}
				/>

				<JsonEditorField
					label="Query Config"
					info={
						<>
							A JSON object mapping keys to dot-notation DatoCMS query paths. Each path is converted
							to a GraphQL query against the Content Delivery API.
							<br />
							<br />
							Example: <code>{'{"BLOG_SLUG": "siteSettingsModel.blogPage.slug"}'}</code>
						</>
					}
					error={queryError ?? undefined}
					value={localQueryConfig}
					onChange={handleQueryConfigChange}
					placeholder={'{"BLOG_SLUG": "siteSettingsModel.blogPage.slug"}'}
				/>

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
			</FieldGroup>
		</Canvas>
	);
}
