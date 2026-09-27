# Rocket cue

Rocket cue is a free, personal iPhone app by Kian Tajbakhsh for following upcoming rocket launches. Browse and filter missions, inspect launch-pad locations, save a local Watchlist, open source-listed webcasts and add launches to Calendar. It does not require an account or offer ads or in-app purchases.

**iPhone availability:** Public App Store release is in preparation. A verified App Store link will be added after Apple makes the listing live. The current internal TestFlight build is limited to Kian's test group.

**Android availability:** No Android app or APK exists yet.

This repository contains the [project site](https://kian-hdr.github.io/rocket-cue/), [privacy notice](https://kian-hdr.github.io/rocket-cue/privacy/), [support page](https://kian-hdr.github.io/rocket-cue/support/) and the small read-only feed updater used by the site. The iPhone app source is not published here. An App Store distribution IPA is not a general-purpose iPhone sideload download; the public App Store listing will be the supported install route. Apple describes other iOS distribution methods as limited to registered test devices or eligible alternative distribution arrangements.

## What the app does

- Shows upcoming missions with search and provider, location and date filters.
- Keeps a Watchlist locally on the iPhone, with no account.
- Shows launch facilities on Apple Maps. Pins do not identify public viewing entrances.
- Opens a webcast only when the data source lists a valid link, and can prepare a Calendar event with a reminder.
- Keeps the last saved launch and pad data when an update fails, and shows when the source was checked.

Launch times and statuses change. Confirm time-sensitive details with the launch provider or webcast. Data comes from [The Space Devs Launch Library 2](https://thespacedevs.com/llapi). The app does not represent or speak for launch providers.

## Shared feed

The site serves complete read-only JSON snapshots at [`v1/launches.json`](https://kian-hdr.github.io/rocket-cue/v1/launches.json) and [`v1/pads.json`](https://kian-hdr.github.io/rocket-cue/v1/pads.json), with [`health.json`](https://kian-hdr.github.io/rocket-cue/health.json) reporting the source-check time. The updater budgets no more than ten upstream requests in one attempt and reserves at least 65 minutes between attempts. GitHub scheduled workflows can be delayed or dropped; the site retains its last successful snapshot and the app marks old data. See [feed operations](docs/FEED.md).

## Contact

For help, corrections or privacy questions: [kian@tajbakhsh.dev](mailto:kian@tajbakhsh.dev). Please do not include private location or other sensitive information in a public GitHub issue.

This repository has no app binary or APK. A working public iPhone download link will be added after App Store approval and availability are verified.
