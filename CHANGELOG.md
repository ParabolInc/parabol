# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [11.3.2](https://github.com/ParabolInc/parabol/compare/v11.3.1...v11.3.2) (2025-12-15)


### Changed

* show page name in document title ([#12452](https://github.com/ParabolInc/parabol/issues/12452)) ([3279bb9](https://github.com/ParabolInc/parabol/commit/3279bb9e30ba05e82df030fb5ad01c56a325a60e))

## [11.3.1](https://github.com/ParabolInc/parabol/compare/v11.3.0...v11.3.1) (2025-12-12)


### Fixed

* collab caret hide on print and click ([#12441](https://github.com/ParabolInc/parabol/issues/12441)) ([7514f4b](https://github.com/ParabolInc/parabol/commit/7514f4b89919e2db306f9a5501a2f465fa4ba8d7))
* revert datadog dd-trace to v5.67.0 ([#12447](https://github.com/ParabolInc/parabol/issues/12447)) ([dcf987a](https://github.com/ParabolInc/parabol/commit/dcf987a58ecd3dda194f95de18c16909cb9f65e9))

## [11.3.0](https://github.com/ParabolInc/parabol/compare/v11.2.0...v11.3.0) (2025-12-12)


### Added

* CSV import and export for databases ([#12382](https://github.com/ParabolInc/parabol/issues/12382)) ([922a235](https://github.com/ParabolInc/parabol/commit/922a235d3495a3f0b980dd81e7260716a360f0b2))


### Fixed

* make idp metadata public ([#12444](https://github.com/ParabolInc/parabol/issues/12444)) ([3b2d298](https://github.com/ParabolInc/parabol/commit/3b2d298a273a04704c961047fef1cdb3dcb3e219))

## [11.2.0](https://github.com/ParabolInc/parabol/compare/v11.1.4...v11.2.0) (2025-12-10)


### Added

* change email via SAML ([#12412](https://github.com/ParabolInc/parabol/issues/12412)) ([0e48ddd](https://github.com/ParabolInc/parabol/commit/0e48ddda837220e7768ffee30555cd856a187551))
* Export Pages to PDF ([#12427](https://github.com/ParabolInc/parabol/issues/12427)) ([06061ee](https://github.com/ParabolInc/parabol/commit/06061eec5425e712be8fdf1832c4d8db6ebd8774))
* support tab and shift+tab in pages ([#12436](https://github.com/ParabolInc/parabol/issues/12436)) ([538b3e1](https://github.com/ParabolInc/parabol/commit/538b3e1e071f3848765e97a3dcb243b0c4e69f0d))


### Fixed

* no double URI encode ([#12434](https://github.com/ParabolInc/parabol/issues/12434)) ([8215c98](https://github.com/ParabolInc/parabol/commit/8215c9841e44ef5434c4f7f447a0ad1579e09dc1))

## [11.1.4](https://github.com/ParabolInc/parabol/compare/v11.1.3...v11.1.4) (2025-12-10)


### Fixed

* do not URI encode proxied assets twice ([#12432](https://github.com/ParabolInc/parabol/issues/12432)) ([0c77c8a](https://github.com/ParabolInc/parabol/commit/0c77c8a34aad3b8d53b9ca15ad7bac71c67279a2))


### Changed

* **changelog:** moved v10 changelog to its own file ([#12429](https://github.com/ParabolInc/parabol/issues/12429)) ([ad94db4](https://github.com/ParabolInc/parabol/commit/ad94db4278393bb3f52b196583109e0b43e6fc67))

## [11.1.3](https://github.com/ParabolInc/parabol/compare/v11.1.2...v11.1.3) (2025-12-10)


### Fixed

* Asset Migration v2 ([#12423](https://github.com/ParabolInc/parabol/issues/12423)) ([7bbc2e3](https://github.com/ParabolInc/parabol/commit/7bbc2e3a6784c947c1bb2ca21da2f9fd12debb43))

## [11.1.2](https://github.com/ParabolInc/parabol/compare/v11.1.1...v11.1.2) (2025-12-09)


### Fixed

* meeting summary redirect ([#12418](https://github.com/ParabolInc/parabol/issues/12418)) ([b3d0618](https://github.com/ParabolInc/parabol/commit/b3d0618f6647573b03ce00b9581f226ea4293c70))

## [11.1.1](https://github.com/ParabolInc/parabol/compare/v11.1.0...v11.1.1) (2025-12-09)


### Fixed

* remove PageAccess when deleting user ([#12414](https://github.com/ParabolInc/parabol/issues/12414)) ([67f3998](https://github.com/ParabolInc/parabol/commit/67f3998d92ab4e551a9d4554b19906d903422ebb))
* skip already updated assets in migration ([#12416](https://github.com/ParabolInc/parabol/issues/12416)) ([3c897f6](https://github.com/ParabolInc/parabol/commit/3c897f6e4bebca24cef1606e302ae89ef4a3ea82))

## [11.1.0](https://github.com/ParabolInc/parabol/compare/v11.0.1...v11.1.0) (2025-12-08)


### Added

* auto login for single tenant ([#12411](https://github.com/ParabolInc/parabol/issues/12411)) ([953f13a](https://github.com/ParabolInc/parabol/commit/953f13ad89f294ff052b6d552704ff3067991b3d))


### Fixed

* share menu styles ([#12410](https://github.com/ParabolInc/parabol/issues/12410)) ([2fe2701](https://github.com/ParabolInc/parabol/commit/2fe2701d397bed24b10b7bf16938890d1bc9584c))
* standardize adding meetingSummaryId to all meeting objects before publish ([#12408](https://github.com/ParabolInc/parabol/issues/12408)) ([00b9d6c](https://github.com/ParabolInc/parabol/commit/00b9d6c7d35bb05542a40089614d4e3aadbe4152))

## [11.0.1](https://github.com/ParabolInc/parabol/compare/v11.0.0...v11.0.1) (2025-12-06)


### Fixed

* tiptap extension mismatches, dependency cleanup ([#12403](https://github.com/ParabolInc/parabol/issues/12403)) ([b14e6fe](https://github.com/ParabolInc/parabol/commit/b14e6fe3f850b8348748bd08fefa3a8370f08316))


### Changed

* update dev DLL for faster startups ([#12405](https://github.com/ParabolInc/parabol/issues/12405)) ([bf00fa2](https://github.com/ParabolInc/parabol/commit/bf00fa213901cc52f597600e06c1bf8c60f90ea2))

## [11.0.0](https://github.com/ParabolInc/parabol/compare/v10.38.0...v11.0.0) (2025-12-05)


### ⚠ BREAKING CHANGES

* Asset Proxy Server (Part 2 of 2) ([#12340](https://github.com/ParabolInc/parabol/issues/12340))

### Added

* Asset Proxy Server (Part 2 of 2) ([#12340](https://github.com/ParabolInc/parabol/issues/12340)) ([07f4f0d](https://github.com/ParabolInc/parabol/commit/07f4f0de5e8ee0436591f971c9f36669ba29c911))


## Prior Major Version Changelogs

We try to keep this CHANGELOG limited to only the current major version.
For past major version revision history, please refer to one of the following
linked documents:

   - [v10.x.x](./docs/changelog/CHANGELOG-v10.md)
   - [v9.x.x](./docs/changelog/CHANGELOG-v9.md)
   - [v8.39.2–v8.18.0](./docs/changelog/CHANGELOG-v8.39.2-v8.18.0.md)
   - [v8.17.0–v8.0.0](./docs/changelog/CHANGELOG-v8.17.0-v8.0.0.md)
   - [v7.x.x](./docs/changelog/CHANGELOG-v7.md)
   - [v6.x.x](./docs/changelog/CHANGELOG-v6.md)
   - [v5.x.x](./docs/changelog/CHANGELOG-v5.md)
   - [v4.x.x](./docs/changelog/CHANGELOG-v4.md)
   - [v3.x.x](./docs/changelog/CHANGELOG-v3.md)
   - [v2.x.x](./docs/changelog/CHANGELOG-v2.md)
   - [v1.x.x](./docs/changelog/CHANGELOG-v1.md)
   - [v0.x.x](./docs/changelog/CHANGELOG-v0.md)
