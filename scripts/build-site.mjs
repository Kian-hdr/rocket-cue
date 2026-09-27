import { appendFile, cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchCompleteFeed } from "./refresh.mjs";

export const siteURL = "https://kian-hdr.github.io/rocket-cue/";
export const minimumRefreshAgeMs = 65 * 60 * 1000;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

function validCheckedAt(value, now) {
  const checkedAt = Date.parse(value);
  return Number.isFinite(checkedAt) && checkedAt <= now.getTime() + 5 * 60_000
    ? checkedAt : null;
}

async function currentSnapshotAge(now, fetcher, baseURL) {
  try {
    const response = await fetcher(new URL("health.json", baseURL), {
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) return null;
    const health = await response.json();
    const checkedAt = validCheckedAt(health.source_checked_at, now);
    return checkedAt === null ? null : now.getTime() - checkedAt;
  } catch {
    return null; // A first deployment has no health page.
  }
}

async function reportUpdated(updated, outputFile) {
  if (outputFile) await appendFile(outputFile, `updated=${updated}\n`);
}

/** Build a complete site artifact only when a budgeted upstream refresh succeeds. */
export async function buildSite({
  now = new Date(),
  fetcher = fetch,
  loadFeed = fetchCompleteFeed,
  baseURL = siteURL,
  publicDir = path.join(repoRoot, "public"),
  outputDir = path.join(repoRoot, "site"),
  outputFile = process.env.GITHUB_OUTPUT
} = {}) {
  const age = await currentSnapshotAge(now, fetcher, baseURL);
  if (age !== null && age >= 0 && age < minimumRefreshAgeMs) {
    console.log(`Skipping LL2: the published snapshot is ${Math.floor(age / 60_000)} minutes old.`);
    await reportUpdated(false, outputFile);
    return { updated: false };
  }

  // A failure in either feed leaves the already deployed Pages site intact.
  const launches = await loadFeed("launches", now, fetcher);
  const pads = await loadFeed("pads", now, fetcher);
  const checkedAt = new Date().toISOString();
  await rm(outputDir, { recursive: true, force: true }); // Generated artifact only.
  await cp(publicDir, outputDir, { recursive: true });
  await mkdir(path.join(outputDir, "v1"), { recursive: true });
  await Promise.all([
    writeFile(path.join(outputDir, "v1", "launches.json"), JSON.stringify({ ...launches, source_checked_at: checkedAt })),
    writeFile(path.join(outputDir, "v1", "pads.json"), JSON.stringify({ ...pads, source_checked_at: checkedAt })),
    writeFile(path.join(outputDir, "health.json"), JSON.stringify({
      status: "ready",
      source_checked_at: checkedAt,
      launch_count: launches.count,
      pad_count: pads.count,
      source: "The Space Devs Launch Library 2"
    }))
  ]);
  await reportUpdated(true, outputFile);
  console.log(`Built complete site: ${launches.count} launches, ${pads.count} pads, checked ${checkedAt}.`);
  return { updated: true, checkedAt, launchCount: launches.count, padCount: pads.count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite().catch(error => {
    console.error(`Rocket cue feed refresh failed; prior Pages deployment is retained: ${String(error)}`);
    process.exitCode = 1;
  });
}
