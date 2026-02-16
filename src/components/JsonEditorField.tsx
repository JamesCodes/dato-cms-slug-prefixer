import CodeEditor from "@uiw/react-textarea-code-editor";
import { FieldWrapper } from "datocms-react-ui";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import s from "./JsonEditorField.module.css";

type Props = {
	label: string;
	hint?: ReactNode;
	info?: ReactNode;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
	error?: string;
};

function validateJson(value: string): string | undefined {
	if (!value.trim()) return undefined;
	try {
		const parsed = JSON.parse(value);
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
			return 'Must be a JSON object (e.g. { "key": "value" }).';
		}
	} catch {
		return "Invalid JSON.";
	}
	return undefined;
}

export default function JsonEditorField({
	label,
	hint,
	info,
	value,
	onChange,
	onBlur: externalBlur,
	placeholder,
	error: externalError,
}: Props) {
	const id = useId();
	const [jsonError, setJsonError] = useState<string>();
	const [infoOpen, setInfoOpen] = useState(false);

	const displayError = externalError || jsonError;

	const handleChange = (newValue: string) => {
		onChange(newValue);
		if (jsonError) setJsonError(validateJson(newValue));
	};

	const handleBlur = () => {
		setJsonError(validateJson(value));
		externalBlur?.();
	};

	const fieldLabel = info ? (
		<span className={s.labelRow}>
			{label}
			<button
				type="button"
				className={s.infoButton}
				onClick={() => setInfoOpen((o) => !o)}
				aria-label="Toggle info"
				aria-expanded={infoOpen}
			>
				i
			</button>
		</span>
	) : (
		label
	);

	const fieldHint = (
		<>
			{info && infoOpen && <div className={s.infoContent}>{info}</div>}
			{hint}
		</>
	);

	return (
		<FieldWrapper id={id} label={fieldLabel} hint={fieldHint} error={displayError}>
			<CodeEditor
				value={value}
				onChange={(e) => handleChange(e.target.value)}
				onBlur={handleBlur}
				language="json"
				placeholder={placeholder}
				padding={12}
				data-color-mode="light"
				indentWidth={4}
				style={{
					fontSize: 14,
					fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
					borderRadius: 4,
					minHeight: 80,
				}}
			/>
		</FieldWrapper>
	);
}
