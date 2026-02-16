import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

export function render(component: React.ReactNode): void {
	root.render(<StrictMode>{component}</StrictMode>);
}
