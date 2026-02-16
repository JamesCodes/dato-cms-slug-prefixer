import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, FieldGroup, Form, Section, TextField } from "datocms-react-ui";
import { useId, useRef, useState } from "react";
import JsonEditorField from "../components/JsonEditorField";
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
	const parameters = ctx.plugin.attributes.parameters as Record<string, unknown>;
	const apiKeyId = useId();
	const [apiKey, setApiKey] = useState((parameters.apiKey as string) ?? "");
	const [globalConfig, setGlobalConfig] = useState((parameters.globalConfig as string) ?? "");
	const [apiKeyError, setApiKeyError] = useState<string>();
	const [apiKeyValid, setApiKeyValid] = useState(false);
	const verifyId = useRef(0);

	const TOKEN_LENGTH = 30;

	const isTokenFormat = (value: string): boolean => /^[a-f0-9]+$/i.test(value.trim());

	const verifyApiKey = async (key: string) => {
		const trimmed = key.trim();
		if (!trimmed || !isTokenFormat(trimmed)) {
			setApiKeyValid(false);
			return;
		}
		const id = ++verifyId.current;
		try {
			const res = await fetch("https://graphql.datocms.com/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${trimmed}`,
				},
				body: JSON.stringify({ query: "{ __typename }" }),
			});
			if (id !== verifyId.current) return;
			if (res.status === 401) {
				setApiKeyError("This API token is not valid.");
				setApiKeyValid(false);
			} else if (res.status === 403) {
				setApiKeyError("This API token does not have read access.");
				setApiKeyValid(false);
			} else if (!res.ok) {
				setApiKeyError(`API returned ${res.status}.`);
				setApiKeyValid(false);
			} else {
				setApiKeyError(undefined);
				setApiKeyValid(true);
			}
		} catch {
			if (id !== verifyId.current) return;
			setApiKeyError("Could not reach the DatoCMS API.");
			setApiKeyValid(false);
		}
	};

	const handleApiKeyChange = (value: string) => {
		setApiKey(value);
		setApiKeyValid(false);
		setApiKeyError(undefined);

		const trimmed = value.trim();
		if (trimmed.length === TOKEN_LENGTH && isTokenFormat(trimmed)) {
			verifyApiKey(value);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!apiKey.trim()) {
			setApiKeyError("API key is required.");
			return;
		}

		await ctx.updatePluginParameters({
			...parameters,
			apiKey: apiKey.trim(),
			globalConfig: globalConfig.trim(),
		});
		ctx.notice("Settings saved!");
	};

	const hasChanges = parameters.apiKey !== apiKey || parameters.globalConfig !== globalConfig;

	return (
		<Canvas ctx={ctx}>
			<Section title="How it works">
				<p>
					Slug Prefixer displays a dynamic prefix before slug fields, built from static values and
					live queries against your DatoCMS content. Assign the editor to any slug field, define a
					prefix pattern using <code>{"{{KEY}}"}</code> tokens, and the plugin resolves them at edit
					time.
				</p>
				<p>
					<strong>Global config</strong> values defined below are available to all slug fields. For
					field-specific values, add a <strong>query config</strong> in the field settings to fetch
					content from the Content Delivery API using dot-notation paths.
				</p>
			</Section>
			<Form onSubmit={handleSubmit}>
				<FieldGroup>
					<Section title="API Token">
						<p>
							The plugin queries the Content Delivery API to resolve prefix values at edit time.
							Provide a read-only API token so these queries can be made on behalf of the plugin.
						</p>
					</Section>
					<div className={apiKeyValid ? s.tokenValid : apiKeyError ? s.tokenInvalid : ""}>
						<TextField
							id={apiKeyId}
							name="apiKey"
							label="Read-only API Key"
							hint={
								apiKeyValid ? (
									<span className={s.tokenHintValid}>{"\u2713"} Token verified</span>
								) : apiKeyError ? (
									<span className={s.tokenHintInvalid}>
										{"\u2717"} {apiKeyError}
									</span>
								) : (
									"Found under Settings > API tokens in your DatoCMS project."
								)
							}
							value={apiKey}
							onChange={handleApiKeyChange}
							required
						/>
					</div>
					<JsonEditorField
						label="Global Configuration"
						hint={
							<>
								A JSON object of values available to all field-level instances of this plugin. For
								example:
								<JsonExample />
							</>
						}
						value={globalConfig}
						onChange={setGlobalConfig}
						placeholder={GLOBAL_CONFIG_EXAMPLE}
					/>
					<Button type="submit" buttonType="primary" fullWidth disabled={!hasChanges}>
						Save
					</Button>
				</FieldGroup>
			</Form>
		</Canvas>
	);
}
