import { connect } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import FieldConfigScreen from "./entrypoints/FieldConfigScreen";
import SlugFieldEditor from "./entrypoints/SlugFieldEditor";
import { render } from "./utils/render";

connect({
	manualFieldExtensions() {
		return [
			{
				id: "slugPrefixer",
				name: "Slug Prefixer",
				type: "editor",
				fieldTypes: ["slug"],
				configurable: true,
			},
		];
	},
	renderConfigScreen(ctx) {
		return render(<ConfigScreen ctx={ctx} />);
	},
	renderManualFieldExtensionConfigScreen(
		fieldExtensionId,
		ctx,
	) {
		switch (fieldExtensionId) {
			case "slugPrefixer":
				return render(<FieldConfigScreen ctx={ctx} />);
		}
	},
	validateManualFieldExtensionParameters(
		fieldExtensionId,
		parameters,
	) {
		const errors: Record<string, string> = {};
		if (fieldExtensionId === "slugPrefixer") {
			const pattern = (parameters.prefixPattern as string) ?? "";
			const openCount = (pattern.match(/\{\{/g) || []).length;
			const closeCount = (pattern.match(/\}\}/g) || []).length;
			if (openCount !== closeCount) {
				errors.prefixPattern = "Unclosed {{ tag in prefix pattern.";
			}

			const queryConfig = (parameters.queryConfig as string) ?? "";
			if (queryConfig.trim()) {
				try {
					const parsed = JSON.parse(queryConfig);
					if (
						typeof parsed !== "object" ||
						parsed === null ||
						Array.isArray(parsed)
					) {
						errors.queryConfig = "Must be a JSON object.";
					} else {
						for (const value of Object.values(parsed)) {
							if (typeof value !== "string") {
								errors.queryConfig = "All values must be strings.";
								break;
							}
						}
					}
				} catch {
					errors.queryConfig = "Invalid JSON.";
				}
			}
		}
		return errors;
	},
	renderFieldExtension(fieldExtensionId, ctx) {
		switch (fieldExtensionId) {
			case "slugPrefixer":
				return render(<SlugFieldEditor ctx={ctx} />);
		}
	},
});
