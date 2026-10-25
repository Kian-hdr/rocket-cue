# Changelog

## Android 1.0.0 · build 8 — October 25, 2026

### Changed

- Added padding that keeps the complete rocket visible within Android adaptive launcher masks, including themed icons.
- Removed catalogue-check and saved-launch-outdated banners from the primary Android screens.
- Consolidated stacked map credits into one line that collapses to an information button. Provider links remain available.

### Distribution and validation

- Published a signed APK preview through GitHub Releases, with a SHA-256 checksum and the existing build 7 signing identity.
- Verified the 7-to-8 update and the three visual corrections on a Samsung Galaxy S25 Ultra.
- Release build/lint, 11 app unit tests and six native emulator tests passed; broader device, accessibility and performance testing remains in progress.
- No iOS binary change in this release. iPhone and iPad remain available through the App Store.

See [downloads and installation](docs/DOWNLOADS.md) for links, compatibility and validation scope.
