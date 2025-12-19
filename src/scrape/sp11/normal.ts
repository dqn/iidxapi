import path from "path";

import { DOCS_DIR, scrapeDifficultyTable } from "../shared.js";

const TARGET_URL = "https://w.atwiki.jp/bemani2sp11/pages/22.html";
const OUTPUT_FILE = path.join(DOCS_DIR, "sp11/normal.json");

scrapeDifficultyTable({ targetUrl: TARGET_URL, outputFile: OUTPUT_FILE });
