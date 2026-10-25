# Downloads and installation

Last checked: October 25, 2026.

## iPhone and iPad

[Download Rocket cue on the App Store](https://apps.apple.com/us/app/rocket-cue/id6816076297). Requires iOS / iPadOS 18.0 or later. The public listing and authenticated App Store status were checked on the date above. iOS 1.0.0 is available for distribution.

The App Store is the supported iPhone and iPad installation route. No IPA is attached to this Android release.

## Android

- [Download the APK: RocketCue-1.0.0-8.apk](https://github.com/Kian-hdr/rocket-cue/releases/download/android-v1.0.0-build8/RocketCue-1.0.0-8.apk)
- [Release notes and attached checksum](https://github.com/Kian-hdr/rocket-cue/releases/tag/android-v1.0.0-build8)
- Version: 1.0.0; Android version code: 8.
- Requires Android 8.0 (API 26) or later. Packaged ABIs: arm64-v8a and x86_64.
- Package: `space.exlumina.launchdiscovery`.
- Distribution: direct APK preview through GitHub Releases. No Google Play listing is available yet.

### Install or update

1. Download the APK above and open it on your Android device.
2. If prompted, permit installation for the browser or file manager you deliberately used, then follow Android's installer prompts.
3. For an existing installation, choose the update. Do not uninstall first; uninstalling removes local app data.

Build 8 uses the same signing certificate as build 7. The 7-to-8 update was tested without uninstalling on a Samsung Galaxy S25 Ultra. If Android reports a signing mismatch or refuses the update, keep the existing installation and contact [support](https://kian-hdr.github.io/rocket-cue/support/).

### Verify the download

APK SHA-256:

```text
9730f486aebd4adf991bf6b1059b48cd4c3b221a46b7814d128ec7f009d8154d
```

For example, on macOS or Linux:

```sh
shasum -a 256 RocketCue-1.0.0-8.apk
```

Signing-certificate SHA-256:

```text
30e40c71fff81d7bbb72febe9f45fa568c258f786eafffb2463f592ad7459c27
```

The attached `APK_SHA256SUMS.txt` covers the APK only. The Android App Bundle and private signing materials are not distributed with this download.

### What was checked

For build 8, the release build, lint, 11 app unit tests, six native API 36 emulator tests, APK signature and 16 KB ZIP/native-library alignment checks passed. The App Bundle also passed validation and signature verification in release preparation.

The APK was installed over build 7 on a Galaxy S25 Ultra. Direct checks on that phone confirmed that the full launcher rocket is visible, outdated-data banners are absent from the primary screens, and map credits appear on one line before collapsing to a single information button. Attribution links remain accessible.

These checks cover the tested build and device. They do not establish full support across every Android device, completed accessibility/performance testing, or Google Play approval. The app retains original source timestamps and last-good cached data; launch times can still change.

## Repository scope

This repository contains the public website and shared-feed service. Native application source is maintained separately. The release APK is the Android application; GitHub's automatic source archives contain the website/feed source only.
