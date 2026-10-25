import { cp, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Publish website assets with the exact current live feed, without an upstream refresh. */
export async function publishStatic({
  fetcher = fetch,
  baseURL = "https://kian-hdr.github.io/rocket-cue/",
  publicDir = path.join(root, "public"),
  outputDir = path.join(root, "site")
} = {}) {
  const files = ["health.json", "v1/launches.json", "v1/pads.json"];
  const bodies = await Promise.all(files.map(async name => {
    const response = await fetcher(new URL(name, baseURL), {
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok) throw new Error(`Published ${name}: HTTP ${response.status}`);
    return response.text();
  }));
  const [health, launches, pads] = bodies.map(body => JSON.parse(body));
  if (health.status !== "ready" || !Number.isFinite(Date.parse(health.source_checked_at))) {
    throw new Error("Published feed health is invalid");
  }
  for (const [name, feed, count] of [
    ["launches", launches, health.launch_count], ["pads", pads, health.pad_count]
  ]) {
    if (!Number.isInteger(count) || count < 0 || feed.count !== count ||
        !Array.isArray(feed.results) || feed.results.length !== count || feed.next !== null ||
        feed.source_checked_at !== health.source_checked_at) {
      throw new Error(`Published ${name} is incomplete or has a mismatched timestamp`);
    }
    const ids = feed.results.map(record => record?.id);
    if (ids.some(id => !["string", "number"].includes(typeof id) || String(id).length === 0) ||
        new Set(ids.map(String)).size !== ids.length) {
      throw new Error(`Published ${name} has missing or duplicate IDs`);
    }
  }
  // Validate all three snapshots before writing. Keep their original bytes and source times.
  await cp(publicDir, outputDir, { recursive: true });
  await mkdir(path.join(outputDir, "v1"), { recursive: true });
  await Promise.all(files.map((name, i) => writeFile(path.join(outputDir, name), bodies[i])));
  return { sourceCheckedAt: health.source_checked_at, launchCount: launches.count, padCount: pads.count };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  publishStatic().then(result => console.log("Preserved live feed:", JSON.stringify(result)))
    .catch(error => { console.error(String(error)); process.exitCode = 1; });
}
