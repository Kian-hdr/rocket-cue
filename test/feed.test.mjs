import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fetchCompleteFeed } from "../scripts/refresh.mjs";
import { buildSite } from "../scripts/build-site.mjs";
import { shouldAttempt } from "../scripts/reserve-budget.mjs";

const now = new Date("2026-09-28T12:00:00Z");

test("combines every page and rejects incomplete snapshots", async () => {
  let calls = 0;
  const fetcher = async url => {
    calls++;
    return Response.json(calls === 1
      ? { count: 2, next: "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?offset=100", results: [{ id: "a" }] }
      : { count: 2, next: null, results: [{ id: "b" }] });
  };
  const complete = await fetchCompleteFeed("launches", now, fetcher);
  assert.deepEqual(complete.results.map(item => item.id), ["a", "b"]);
  assert.equal(complete.next, null);
  await assert.rejects(fetchCompleteFeed("pads", now, async () => Response.json({
    count: 2, next: null, results: [{ id: 1 }]
  })), /incomplete/);
});

test("rejects unsafe pages, duplicate IDs and upstream rate limits", async () => {
  await assert.rejects(fetchCompleteFeed("pads", now, async () => Response.json({
    count: 1, next: "https://example.org/", results: [{ id: 1 }]
  })), /unsafe/);
  let calls = 0;
  await assert.rejects(fetchCompleteFeed("pads", now, async () => {
    calls++;
    return Response.json(calls === 1
      ? { count: 2, next: "https://ll.thespacedevs.com/2.3.0/pads/?offset=100", results: [{ id: 1 }] }
      : { count: 2, next: null, results: [{ id: 1 }] });
  }), /duplicate/);
  await assert.rejects(fetchCompleteFeed("launches", now, async () => new Response("", { status: 429 })), /429/);
});

test("fresh Pages snapshot makes no upstream call", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "rocket-cue-site-"));
  let upstreamCalls = 0;
  const result = await buildSite({
    now,
    fetcher: async () => Response.json({ source_checked_at: new Date(now.getTime() - 30 * 60_000).toISOString() }),
    loadFeed: async () => { upstreamCalls++; throw new Error("must not fetch"); },
    outputDir: path.join(dir, "site"),
    outputFile: null
  });
  assert.equal(result.updated, false);
  assert.equal(upstreamCalls, 0);
});

test("publishes both complete feeds together with one checked time", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "rocket-cue-site-"));
  const publicDir = path.join(dir, "public");
  await mkdir(publicDir);
  await writeFile(path.join(publicDir, "index.html"), "Rocket cue");
  const result = await buildSite({
    now,
    fetcher: async () => new Response("not found", { status: 404 }),
    loadFeed: async kind => ({ count: 1, next: null, results: [{ id: kind }] }),
    publicDir,
    outputDir: path.join(dir, "site"),
    outputFile: null
  });
  assert.equal(result.updated, true);
  const launches = JSON.parse(await readFile(path.join(dir, "site/v1/launches.json"), "utf8"));
  const pads = JSON.parse(await readFile(path.join(dir, "site/v1/pads.json"), "utf8"));
  assert.equal(launches.source_checked_at, pads.source_checked_at);
  assert.equal(launches.count, 1);
  assert.equal(pads.count, 1);
});

test("upstream budget waits 65 minutes and rejects corrupt state", () => {
  assert.equal(shouldAttempt(null, now), true);
  assert.equal(shouldAttempt(new Date(now.getTime() - 64 * 60_000).toISOString(), now), false);
  assert.equal(shouldAttempt(new Date(now.getTime() - 66 * 60_000).toISOString(), now), true);
  assert.throws(() => shouldAttempt("invalid", now), /invalid/);
});
