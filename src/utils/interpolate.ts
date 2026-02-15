const TOKEN_RE = /\{\{(\w+)\}\}/g;

export function interpolate(
	template: string,
	values: Record<string, string>,
): string {
	return template.replace(TOKEN_RE, (match, key: string) =>
		key in values ? values[key] : match,
	);
}

export function hasUnresolvedKeys(
	template: string,
	values: Record<string, string>,
): boolean {
	return getTemplateKeys(template).some((key) => !(key in values));
}

export function getTemplateKeys(template: string): string[] {
	const keys: string[] = [];
	let match: RegExpExecArray | null;
	const re = new RegExp(TOKEN_RE.source, "g");
	while ((match = re.exec(template)) !== null) {
		if (!keys.includes(match[1])) {
			keys.push(match[1]);
		}
	}
	return keys;
}
