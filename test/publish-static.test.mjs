import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { publishStatic } from "../scripts/publish-static.mjs";

const at = "2026-10-25T09:34:29.377Z";
function snapshots() {
  return {
    "health.json": JSON.stringify({ status: "ready", source_checked_at: at, launch_count: 1, pad_count: 1 }) + "\n",
    "v1/launches.json": JSON.stringify({ source_checked_at: at, count: 1, next: null, results: [{ id: "launch-a" }] }),
    "v1/pads.json": JSON.stringify({ source_checked_at: at, count: 1, next: null, results: [{ id: 1 }] })
  };
}
async function fixture() {
  const dir = await mkdtemp(path.join(tmpdir(), "rocket-static-"));
  const publicDir = path.join(dir, "public"), outputDir = path.join(dir, "site");
  await mkdir(publicDir); await writeFile(path.join(publicDir, "index.html"), "Screenshot gallery");
  return { publicDir, outputDir };
}
test("static publication copies exact feed bytes and never requests upstream", async () => {
  const dirs = await fixture(), bodies = snapshots(), requested = [];
  const result = await publishStatic({ ...dirs, fetcher: async url => {
    assert.equal(url.origin, "https://kian-hdr.github.io");
    const name = url.pathname.replace("/rocket-cue/", ""); requested.push(name);
    assert.ok(Object.hasOwn(bodies, name)); return new Response(bodies[name]);
  } });
  assert.equal(requested.length, 3); assert.equal(result.sourceCheckedAt, at);
  for (const [name, body] of Object.entries(bodies)) assert.equal(await readFile(path.join(dirs.outputDir, name), "utf8"), body);
  assert.equal(await readFile(path.join(dirs.outputDir, "index.html"), "utf8"), "Screenshot gallery");
});
test("static publication rejects mismatched or incomplete data before writing", async () => {
  for (const malformed of [
    { source_checked_at: "2026-10-24T00:00:00Z", count: 1, next: null, results: [{ id: "a" }] },
    { source_checked_at: at, count: 1, next: null, results: [] },
    { source_checked_at: at, count: 1, next: null, results: [{}] }
  ]) {
    const dirs = await fixture(), bodies = snapshots(); bodies["v1/launches.json"] = JSON.stringify(malformed);
    await assert.rejects(publishStatic({ ...dirs, fetcher: async url => new Response(bodies[url.pathname.replace("/rocket-cue/", "")]) }), /Published launches/);
    await assert.rejects(access(dirs.outputDir));
  }
});
