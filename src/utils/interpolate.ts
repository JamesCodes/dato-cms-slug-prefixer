export const TOKEN_RE = /\{\{(\w+)\}\}/;
const TOKEN_RE_GLOBAL = new RegExp(TOKEN_RE.source, "g");

export function interpolate(template: string, values: Record<string, string>): string {
	return template.replace(TOKEN_RE_GLOBAL, (match, key: string) =>
		key in values ? values[key] : match,
	);
}

export function hasUnresolvedKeys(template: string, values: Record<string, string>): boolean {
	return getTemplateKeys(template).some((key) => !(key in values));
}

export function getTemplateKeys(template: string): string[] {
	const keys: string[] = [];
	const re = new RegExp(TOKEN_RE_GLOBAL.source, "g");
	for (let match = re.exec(template); match !== null; match = re.exec(template)) {
		if (!keys.includes(match[1])) {
			keys.push(match[1]);
		}
	}
	return keys;
}
