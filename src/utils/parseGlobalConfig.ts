export function parseGlobalConfig(raw: string): Record<string, string> {
	if (!raw.trim()) return {};
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
		const result: Record<string, string> = {};
		for (const [key, value] of Object.entries(parsed)) {
			if (typeof value === "string") {
				result[key] = value;
			}
		}
		return result;
	} catch {
		return {};
	}
}
