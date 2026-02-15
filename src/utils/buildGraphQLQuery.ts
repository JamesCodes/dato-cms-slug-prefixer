interface QueryTree {
	[key: string]: QueryTree;
}

export function buildGraphQLQuery(queryPaths: Record<string, string>): {
	query: string;
	extract: (data: Record<string, unknown>) => Record<string, string>;
} | null {
	const entries = Object.entries(queryPaths);
	if (entries.length === 0) return null;

	const tree: QueryTree = {};
	for (const [, path] of entries) {
		const segments = path.split(".");
		let current = tree;
		for (const segment of segments) {
			current[segment] ??= {};
			current = current[segment];
		}
	}

	function serialize(node: QueryTree): string {
		const fields = Object.entries(node);
		if (fields.length === 0) return "";
		return (
			"{ " +
			fields
				.map(([key, sub]) => {
					const nested = serialize(sub);
					return nested ? `${key} ${nested}` : key;
				})
				.join(" ") +
			" }"
		);
	}

	const query = serialize(tree);

	function extract(data: Record<string, unknown>): Record<string, string> {
		const result: Record<string, string> = {};
		for (const [key, path] of entries) {
			const segments = path.split(".");
			let current: unknown = data;
			for (const segment of segments) {
				if (current && typeof current === "object") {
					current = (current as Record<string, unknown>)[segment];
				} else {
					current = undefined;
					break;
				}
			}
			if (typeof current === "string") {
				result[key] = current;
			}
		}
		return result;
	}

	return { query, extract };
}
