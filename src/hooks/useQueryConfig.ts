import { useEffect, useMemo, useState } from "react";
import { buildGraphQLQuery } from "../utils/buildGraphQLQuery";

const DATOCMS_GRAPHQL_URL = "https://graphql.datocms.com/";

export function useQueryConfig(
	queryConfigJson: string,
	apiKey: string,
): { values: Record<string, string>; error: string | null } {
	const queryPaths = useMemo(() => {
		const trimmed = queryConfigJson.trim();
		if (!trimmed) return {};
		try {
			const parsed = JSON.parse(trimmed);
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
				return {};
			const result: Record<string, string> = {};
			for (const [key, value] of Object.entries(parsed)) {
				if (typeof value === "string") result[key] = value;
			}
			return result;
		} catch {
			return {};
		}
	}, [queryConfigJson]);

	const [values, setValues] = useState<Record<string, string>>({});
	const [error, setError] = useState<string | null>(null);

	const queryDef = useMemo(
		() => buildGraphQLQuery(queryPaths),
		[queryPaths],
	);

	useEffect(() => {
		if (!queryDef) {
			setError(null);
			return;
		}
		if (!apiKey) {
			setError("No API key configured in plugin settings.");
			return;
		}

		let cancelled = false;
		setError(null);

		fetch(DATOCMS_GRAPHQL_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({ query: queryDef.query }),
		})
			.then((r) => r.json())
			.then((json) => {
				if (cancelled) return;
				if (json.errors) {
					const messages = json.errors.map(
						(e: { message: string }) => e.message,
					);
					setError(messages.join("; "));
				}
				if (json.data) {
					setValues(queryDef.extract(json.data));
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(`Fetch failed: ${err.message}`);
					setValues({});
				}
			});

		return () => {
			cancelled = true;
		};
	}, [queryDef, apiKey]);

	return { values, error };
}
