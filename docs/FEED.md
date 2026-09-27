# Shared feed operations

Rocket cue's public feed is a read-only static cache of The Space Devs Launch Library 2. It exists so public app users do not each consume the source's unauthenticated request allowance. The site adds a complete 365-day launch horizon, a pad catalogue, a single source-check timestamp and fail-closed publication. It does not proxy user requests to the upstream API.

## Endpoints

| Path | Contents |
| --- | --- |
| `v1/launches.json` | Complete upcoming launch snapshot, with `count`, `next: null`, `results` and `source_checked_at` |
| `v1/pads.json` | Complete pad catalogue with the same wrapper |
| `health.json` | Last successful source-check time and both record counts |

GitHub Pages publishes all three files together as one site artifact. A failed launch or pad fetch prevents deployment, so the previous complete site stays live. The iPhone client rejects missing timestamps, partial counts and malformed records; its saved on-device data remains available when the site is stale or unreachable.

## Refresh and request budget

The scheduled GitHub Actions workflow gets several chances per hour. A state file is committed before any upstream request, and no new attempt starts until at least 65 minutes have passed. A successful refresh uses at most six launch pages and four pad pages, within the source's documented 15 unauthenticated requests per hour. A failed attempt still consumes its reserved window; this avoids hammering the source after a 429 or outage.

[GitHub warns](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) that scheduled workflows can be delayed or dropped. This is a best-effort hobby feed, not a live launch control source. Check the public `health.json` timestamp and the workflow's latest run before treating a snapshot as current. The app displays its last check time and marks stale saved data. If the feed stops updating, repair the workflow or hosting before uploading a new App Store build; do not silently switch the public app back to direct per-user LL2 calls.

## Source and hosting privacy

The updater makes shared server-side requests to Launch Library 2. Individual app users request static files from GitHub Pages, which [logs visitor IP addresses for security](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection). The public [privacy notice](https://kian-hdr.github.io/rocket-cue/privacy/) describes this and the app's other data flows.
