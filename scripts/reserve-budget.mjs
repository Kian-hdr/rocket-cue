import { readFile, writeFile, appendFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const minimumAttemptAgeMs = 65 * 60 * 1000;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultStatePath = path.join(repoRoot, "state", "last-attempt.json");

export function shouldAttempt(lastAttempt, now) {
  if (lastAttempt === null) return true;
  const prior = Date.parse(lastAttempt);
  if (!Number.isFinite(prior) || prior > now.getTime() + 5 * 60_000) {
    throw new Error("Feed request-budget state is invalid; refusing an upstream request");
  }
  const age = now.getTime() - prior;
  return age >= minimumAttemptAgeMs;
}

/** Reserve the entire ten-request LL2 budget before any source request begins. */
export async function reserveBudget({
  now = new Date(),
  statePath = defaultStatePath,
  outputFile = process.env.GITHUB_OUTPUT
} = {}) {
  const state = JSON.parse(await readFile(statePath, "utf8"));
  if (!Object.hasOwn(state, "last_attempt_at")) throw new Error("Feed request-budget state is missing");
  const due = shouldAttempt(state.last_attempt_at, now);
  if (due) await writeFile(statePath, JSON.stringify({ last_attempt_at: now.toISOString() }) + "\n");
  if (outputFile) await appendFile(outputFile, `due=${due}\n`);
  console.log(due ? "Reserved one bounded LL2 refresh." : "LL2 refresh budget is not yet due.");
  return due;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  reserveBudget().catch(error => {
    console.error(String(error));
    process.exitCode = 1;
  });
}
