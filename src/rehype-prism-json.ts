/**
 * Custom rehype-prism-plus shim that only registers the JSON language.
 * The default export from rehype-prism-plus pulls in all 594 refractor
 * languages (~900 kB minified). This shim uses the generator export
 * with a refractor core instance that only knows JSON.
 */
import { refractor } from "refractor/core";
import json from "refractor/json";
import rehypePrismGenerator from "rehype-prism-plus/generator";

refractor.register(json);

export default rehypePrismGenerator(refractor);
