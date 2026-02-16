import { FieldWrapper } from "datocms-react-ui";
import type { ReactNode } from "react";
import { useId } from "react";
import { TOKEN_RE } from "../utils/interpolate";
import s from "./PatternField.module.css";

const SPLIT_RE = new RegExp(`(${TOKEN_RE.source})`, "g");

type Props = {
	label: string;
	hint?: ReactNode;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	values?: Record<string, string>;
};

function renderHighlighted(text: string, values: Record<string, string>): ReactNode[] {
	const parts = text.split(SPLIT_RE);
	return parts.map((part, i) => {
		if (TOKEN_RE.test(part)) {
			const key = part.slice(2, -2);
			const resolved = key in values;
			return (
				<span key={i} className={resolved ? s.tokenResolved : s.tokenUnresolved}>
					{part}
				</span>
			);
		}
		return (
			<span key={i} className={s.literal}>
				{part}
			</span>
		);
	});
}

export default function PatternField({
	label,
	hint,
	value,
	onChange,
	placeholder,
	values = {},
}: Props) {
	const id = useId();

	return (
		<FieldWrapper id={id} label={label} hint={hint}>
			<div className={s.wrapper}>
				<div className={s.highlight} aria-hidden>
					{value ? renderHighlighted(value, values) : <span className={s.literal}>&nbsp;</span>}
				</div>
				<input
					type="text"
					className={s.input}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
				/>
			</div>
		</FieldWrapper>
	);
}
