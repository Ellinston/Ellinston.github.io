import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const DEFAULT_OUTPUT = "data/portfolio.json";

function getArg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validate(data) {
  assert(data.schemaVersion === 1, "schemaVersion must be 1");
  assert(/^\d{4}-\d{2}-\d{2}$/.test(data.updated), "updated must use YYYY-MM-DD");
  assert(data.profile?.name && data.profile?.intro, "profile is incomplete");
  assert(Array.isArray(data.projects) && data.projects.length > 0, "projects must not be empty");
  assert(Array.isArray(data.milestones), "milestones must be an array");
  assert(Array.isArray(data.notes), "notes must be an array");

  const ids = new Set();
  for (const project of data.projects) {
    assert(project.id && !ids.has(project.id), `duplicate or missing project id: ${project.id}`);
    ids.add(project.id);
    assert(project.title && project.summary && project.status, `project ${project.id} is incomplete`);
    assert(Array.isArray(project.links) && project.links.length > 0, `project ${project.id} needs evidence links`);
  }

  const serialized = JSON.stringify(data);
  const privatePatterns = [/[A-Z]:\\/i, /\b(?:\d{1,3}\.){3}\d{1,3}\b/, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, /(?:api[_-]?key|password|secret|token)\s*[:=]/i];
  for (const pattern of privatePatterns) assert(!pattern.test(serialized), `public data rejected by privacy rule: ${pattern}`);
}

async function loadSource(source) {
  if (/^https?:\/\//.test(source)) {
    const headers = { "user-agent": "Ellinston.github.io portfolio sync" };
    if (process.env.AGENT_KIT_READ_TOKEN) headers.authorization = `Bearer ${process.env.AGENT_KIT_READ_TOKEN}`;
    const response = await fetch(source, { headers });
    if (!response.ok) throw new Error(`source returned HTTP ${response.status}`);
    return response.text();
  }
  return readFile(resolve(source), "utf8");
}

async function main() {
  const source = getArg("--source", process.env.AGENT_KIT_PORTFOLIO_SOURCE);
  assert(source, "provide --source or AGENT_KIT_PORTFOLIO_SOURCE");
  const output = resolve(getArg("--output", DEFAULT_OUTPUT));
  const checkOnly = process.argv.includes("--check");
  const raw = await loadSource(source);
  const data = JSON.parse(raw);
  validate(data);
  const normalized = `${JSON.stringify(data, null, 2)}\n`;

  if (checkOnly) {
    process.stdout.write(`Portfolio data is valid (${data.projects.length} projects).\n`);
    return;
  }

  let current = "";
  try { current = await readFile(output, "utf8"); } catch { /* The first sync creates the mirror. */ }
  if (current === normalized) {
    process.stdout.write("Portfolio mirror is already current.\n");
    return;
  }
  await writeFile(output, normalized, "utf8");
  process.stdout.write(`Updated ${output} from ${source}.\n`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
