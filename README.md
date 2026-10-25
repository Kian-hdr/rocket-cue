# Rocket cue

Rocket cue is a free personal app for following upcoming rocket launches on iPhone, iPad and Android. Browse and filter missions, explore launch facilities, keep a local Watchlist, open source-listed webcasts and prepare Calendar events. No account, ads or in-app purchases.

## Download

| Platform | Install | Requirements |
| --- | --- | --- |
| iPhone and iPad | [Download on the App Store](https://apps.apple.com/us/app/rocket-cue/id6816076297) | iOS / iPadOS 18.0 or later |
| Android | [Download APK · 1.0.0, build 8](https://github.com/Kian-hdr/rocket-cue/releases/download/android-v1.0.0-build8/RocketCue-1.0.0-8.apk) | Android 8.0 or later; direct-install preview |

The Android APK is available from [GitHub Releases](https://github.com/Kian-hdr/rocket-cue/releases/tag/android-v1.0.0-build8). It is not a Google Play listing. See the [installation and update guide](docs/DOWNLOADS.md) for checksums, signing continuity and validation details.

## What the app does

- Shows upcoming missions with search and provider, location and date filters.
- Keeps a Watchlist locally on your device, with no account.
- Shows launch facilities on native maps: Apple MapKit on iPhone and iPad; MapLibre with OpenStreetMap/OpenFreeMap on Android. Pins are not public viewing entrances.
- Opens source-listed webcasts and prepares Calendar events for confirmed future launch times.
- Keeps the last saved launch and pad data when an update fails. Source details are available in About.

Launch times and statuses change. Confirm time-sensitive details with the launch provider or webcast. Data comes from [The Space Devs Launch Library 2](https://thespacedevs.com/llapi). Rocket cue does not represent or speak for launch providers.

## Android build 8

- Keeps the complete rocket visible inside adaptive launcher masks, including its nose and flame.
- Removes catalogue-check and outdated-data banners from the main Android screens.
- Replaces stacked map credits with one compact attribution control.

Build 8 was installed over build 7 and visually checked on a Samsung Galaxy S25 Ultra on October 25, 2026. The release build, lint, 11 app unit tests and six native emulator tests passed. Broader device and accessibility testing remains in progress. See the [changelog](CHANGELOG.md) and [download guide](docs/DOWNLOADS.md).

## Repository and documentation

This repository contains the [project site](https://kian-hdr.github.io/rocket-cue/), [privacy notice](https://kian-hdr.github.io/rocket-cue/privacy/), [support page](https://kian-hdr.github.io/rocket-cue/support/) and read-only shared-feed updater. Native iOS and Android app source is maintained separately and is not included in this repository. Android APKs are attached to releases; GitHub's automatic source archives contain this website/feed repository, not the native app source. iPhone and iPad installation uses the App Store link above.

- [Download, installation and update guide](docs/DOWNLOADS.md)
- [Changelog](CHANGELOG.md)
- [Shared-feed operations](docs/FEED.md)
- [Privacy](https://kian-hdr.github.io/rocket-cue/privacy/)
- [Support](https://kian-hdr.github.io/rocket-cue/support/)

## Shared feed

The site serves complete read-only JSON snapshots at [`v1/launches.json`](https://kian-hdr.github.io/rocket-cue/v1/launches.json) and [`v1/pads.json`](https://kian-hdr.github.io/rocket-cue/v1/pads.json), with [`health.json`](https://kian-hdr.github.io/rocket-cue/health.json) reporting the source-check time. The updater budgets no more than ten upstream requests per attempt and reserves at least 65 minutes between attempts. GitHub scheduled workflows can be delayed or dropped; the site and apps retain their last successfully saved data. See [feed operations](docs/FEED.md).

## Contact

Rocket cue is a personal project by Kian Tajbakhsh. For help, corrections or privacy questions: [kian@tajbakhsh.dev](mailto:kian@tajbakhsh.dev). Please remove private location and other sensitive information before posting screenshots or public issues.
