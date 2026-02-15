import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { json } from "@codemirror/lang-json";
import CodeMirror from "@uiw/react-codemirror";
import { useId, useState } from "react";
import {
	Button,
	Canvas,
	FieldGroup,
	FieldWrapper,
	Form,
	Section,
	TextField,
} from "datocms-react-ui";
import s from "./styles.module.css";

type Props = {
	ctx: RenderConfigScreenCtx;
};

const GLOBAL_CONFIG_EXAMPLE = JSON.stringify(
	{
		BASE_URL: "https://example.com",
	},
	null,
	2,
);

function JsonExample() {
	return (
		<code className={s.codeBlock}>
			<span className={s.jsonBrace}>{"{"}</span>
			{"\n  "}
			<span className={s.jsonKey}>"BASE_URL"</span>
			<span className={s.jsonBrace}>: </span>
			<span className={s.jsonString}>"https://example.com"</span>
			{"\n"}
			<span className={s.jsonBrace}>{"}"}</span>
		</code>
	);
}

export default function ConfigScreen({ ctx }: Props) {
	const parameters = ctx.plugin.attributes.parameters as Record<
		string,
		unknown
	>;
	const apiKeyId = useId();
	const globalConfigId = useId();
	const [apiKey, setApiKey] = useState((parameters.apiKey as string) ?? "");
	const [globalConfig, setGlobalConfig] = useState(
		(parameters.globalConfig as string) ?? "",
	);
	const [apiKeyError, setApiKeyError] = useState<string>();
	const [globalConfigError, setGlobalConfigError] = useState<string>();

	const validateApiKey = (value: string): string | undefined => {
		if (!value.trim()) {
			return "API key is required.";
		}
		if (!/^[a-f0-9]+$/i.test(value.trim())) {
			return "This doesn't look like a valid DatoCMS API token.";
		}
		return undefined;
	};

	const validateGlobalConfig = (value: string): string | undefined => {
		if (!value.trim()) {
			return undefined;
		}
		try {
			const parsed = JSON.parse(value);
			if (
				typeof parsed !== "object" ||
				parsed === null ||
				Array.isArray(parsed)
			) {
				return 'Must be a JSON object (e.g. { "key": "value" }).';
			}
		} catch {
			return "Invalid JSON.";
		}
		return undefined;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const newApiKeyError = validateApiKey(apiKey);
		const newGlobalConfigError = validateGlobalConfig(globalConfig);
		setApiKeyError(newApiKeyError);
		setGlobalConfigError(newGlobalConfigError);

		if (newApiKeyError || newGlobalConfigError) {
			return;
		}

		await ctx.updatePluginParameters({
			...parameters,
			apiKey: apiKey.trim(),
			globalConfig: globalConfig.trim(),
		});
		ctx.notice("Settings saved!");
	};

	const hasChanges =
		parameters.apiKey !== apiKey || parameters.globalConfig !== globalConfig;

	return (
		<Canvas ctx={ctx}>
			<Section title="API Configuration">
				<p>
					This plugin uses the DatoCMS Content Delivery API to query your
					content and dynamically generate slug prefixes. A read-only API token
					is required to perform these queries.
				</p>
			</Section>
			<Form onSubmit={handleSubmit}>
				<FieldGroup>
					<TextField
						id={apiKeyId}
						name="apiKey"
						label="Read-only API Key"
						hint="Found in your DatoCMS project under Settings &gt; API tokens."
						value={apiKey}
						onChange={(value) => {
							setApiKey(value);
							if (apiKeyError) setApiKeyError(validateApiKey(value));
						}}
						error={apiKeyError}
						required
					/>
					<FieldWrapper
						id={globalConfigId}
						label="Global Configuration"
						hint={
							<>
								A JSON object of values available to all field-level instances of
								this plugin. For example:
								<JsonExample />
							</>
						}
						error={globalConfigError}
					>
						<CodeMirror
							value={globalConfig}
							onChange={(value) => {
								setGlobalConfig(value);
								if (globalConfigError)
									setGlobalConfigError(validateGlobalConfig(value));
							}}
							extensions={[json()]}
							placeholder={GLOBAL_CONFIG_EXAMPLE}
							theme="dark"
							minHeight="120px"
							basicSetup={{
								lineNumbers: false,
								foldGutter: false,
							}}
						/>
					</FieldWrapper>
					<Button
						type="submit"
						buttonType="primary"
						fullWidth
						disabled={!hasChanges}
					>
						Save
					</Button>
				</FieldGroup>
			</Form>
		</Canvas>
	);
}
