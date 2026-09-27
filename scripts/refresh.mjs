// A bounded, complete Launch Library 2 snapshot for Rocket cue's read-only cache.
// The public iPhone app source lives in a separate private workspace.

export const sourceOrigin = "https://ll.thespacedevs.com";
const maxPageBytes = 8 * 1024 * 1024;
const maxSnapshotBytes = 20 * 1024 * 1024;

const sources = {
  launches: { path: "/2.3.0/launches/upcoming/", maxPages: 6, maxResults: 600 },
  pads: { path: "/2.3.0/pads/", maxPages: 4, maxResults: 400 }
};

function sourceURL(kind, now) {
  const source = sources[kind];
  if (!source) throw new Error(`Unknown feed kind: ${kind}`);
  const url = new URL(source.path, sourceOrigin);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "100");
  if (kind === "pads") {
    url.searchParams.set("ordering", "id");
  } else {
    url.searchParams.set("mode", "detailed");
    url.searchParams.set("ordering", "net");
    url.searchParams.set("net__gte", new Date(now.getTime() - 86_400_000).toISOString());
    url.searchParams.set("net__lte", new Date(now.getTime() + 365 * 86_400_000).toISOString());
  }
  return url;
}

async function readBounded(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("LL2 returned an empty body");
  const chunks = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxPageBytes) {
      await reader.cancel();
      throw new Error("LL2 page exceeded the size cap");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

function parsePage(text) {
  const page = JSON.parse(text);
  if (!page || typeof page !== "object" ||
      !Number.isInteger(page.count) || page.count < 0 ||
      !Array.isArray(page.results) || page.results.length > 100 ||
      !(page.next === null || typeof page.next === "string")) {
    throw new Error("LL2 page has an invalid pagination shape");
  }
  for (const result of page.results) {
    if (!result || typeof result !== "object" ||
        !(typeof result.id === "string" || typeof result.id === "number")) {
      throw new Error("LL2 page contains a record without an ID");
    }
  }
  return page;
}

/** Never publish a partial, duplicate, oversized, or redirected source snapshot. */
export async function fetchCompleteFeed(kind, now, fetcher = fetch) {
  const source = sources[kind];
  if (!source) throw new Error(`Unknown feed kind: ${kind}`);
  const visited = new Set();
  const seenIDs = new Set();
  const results = [];
  let next = sourceURL(kind, now);
  let expectedCount = null;

  for (let pageNumber = 0; next && pageNumber < source.maxPages; pageNumber++) {
    const url = next;
    if (url.origin !== sourceOrigin || url.pathname !== source.path || visited.has(url.href)) {
      throw new Error("LL2 returned an unsafe or repeated page URL");
    }
    visited.add(url.href);
    const response = await fetcher(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RocketCue/1.0 (+mailto:kian@tajbakhsh.dev)"
      },
      signal: AbortSignal.timeout(20_000)
    });
    if (!response.ok) throw new Error(`LL2 ${kind} returned HTTP ${response.status}`);
    const page = parsePage(await readBounded(response));
    if (expectedCount === null) expectedCount = page.count;
    else if (page.count !== expectedCount) throw new Error("LL2 count changed during pagination");
    for (const record of page.results) {
      const id = String(record.id);
      if (seenIDs.has(id)) throw new Error("LL2 returned a duplicate ID");
      seenIDs.add(id);
      results.push(record);
    }
    if (results.length > source.maxResults) throw new Error("LL2 record cap exceeded");
    next = page.next ? new URL(page.next, url) : null;
  }

  if (next || results.length !== expectedCount || results.length === 0) {
    throw new Error("LL2 pagination was incomplete");
  }
  const snapshot = { count: results.length, next: null, results };
  if (Buffer.byteLength(JSON.stringify(snapshot)) > maxSnapshotBytes) {
    throw new Error("LL2 snapshot exceeded the size cap");
  }
  return snapshot;
}
