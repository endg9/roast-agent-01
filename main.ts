import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

const sourcePath = join(import.meta.dirname, "entry.txt");
let raw: string;
try {
  raw = readFileSync(sourcePath, "utf8");
} catch {
  fail(`cannot read ${sourcePath}`);
}

if (raw.includes("\r")) {
  fail("entry.txt must not contain carriage returns");
}

const lines = raw.split("\n");
if (lines.length !== 2 || lines[1] !== "") {
  fail("entry.txt must contain exactly one line plus a trailing newline");
}

const line = lines[0];
if (line.trim().length === 0) {
  fail("entry must not be empty or only whitespace");
}

const charCount = [...line].length;
if (charCount < 1 || charCount > 200) {
  fail(`entry must be 1-200 characters, got ${charCount}`);
}

// Load-bearing specifics: the roast only works as an agent apology loop.
for (const required of ["apologized", "summarized the apology", "long version"]) {
  if (!line.includes(required)) {
    fail(`entry must mention ${required}`);
  }
}

// The twist must pay off on the last words — the agent offers the long version.
if (!line.endsWith("long version.")) {
  fail("entry must end with the payoff 'long version.'");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(import.meta.dirname, "output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, `${line}\n`, "utf8");

// Read the output back and verify it is byte-identical to the line + newline.
const written = readFileSync(outPath, "utf8");
if (written !== `${line}\n`) {
  fail("output/entry.txt does not match the entry line");
}
console.log(line);
