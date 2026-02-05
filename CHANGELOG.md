# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [11.13.0](https://github.com/ParabolInc/parabol/compare/v11.12.0...v11.13.0) (2026-02-05)


### Added

* **SCIM:** user endpoints ([#12530](https://github.com/ParabolInc/parabol/issues/12530)) ([153dab4](https://github.com/ParabolInc/parabol/commit/153dab470d584e61cbdf8c988063490441813d11))

## [11.12.0](https://github.com/ParabolInc/parabol/compare/v11.11.0...v11.12.0) (2026-02-04)


### Added

* File uploads on pages ([#12533](https://github.com/ParabolInc/parabol/issues/12533)) ([03196bf](https://github.com/ParabolInc/parabol/commit/03196bff448336f73840426c88c92b6eaf94c01b))


### Fixed

* editor size for images ([#12551](https://github.com/ParabolInc/parabol/issues/12551)) ([71a541d](https://github.com/ParabolInc/parabol/commit/71a541db3f45ba2123214320ee7bfdcf75dceeae))
* speed up search queries ([#12552](https://github.com/ParabolInc/parabol/issues/12552)) ([84c041c](https://github.com/ParabolInc/parabol/commit/84c041ce1f7195f8a88734a6494f833366da8791))

## [11.11.0](https://github.com/ParabolInc/parabol/compare/v11.10.5...v11.11.0) (2026-02-04)


### Added

* **pages:** image block enhancements ([#12442](https://github.com/ParabolInc/parabol/issues/12442)) ([6a8d45a](https://github.com/ParabolInc/parabol/commit/6a8d45a50517f669a4c7e308602f6d8b6fcbb370))
* **SCIM:** Add authentication configuration ([#12507](https://github.com/ParabolInc/parabol/issues/12507)) ([739d00a](https://github.com/ParabolInc/parabol/commit/739d00a6e83d5019707d2a598acc912ea0da4c34))


### Fixed

* Change `EmbeddingsJobQueueStream.next()` to use loop ([#12548](https://github.com/ParabolInc/parabol/issues/12548)) ([eddaa50](https://github.com/ParabolInc/parabol/commit/eddaa50d4b2a84b910bea237904db98b6d1849c4))

## [11.10.5](https://github.com/ParabolInc/parabol/compare/v11.10.4...v11.10.5) (2026-02-03)


### Fixed

* bump fast-xml-parser ([#12536](https://github.com/ParabolInc/parabol/issues/12536)) ([41da489](https://github.com/ParabolInc/parabol/commit/41da489241a0725ff3f4213b5645618b7aafcef8))
* extends timeouts, better logging for uncaught errors for embedder ([#12542](https://github.com/ParabolInc/parabol/issues/12542)) ([f404e77](https://github.com/ParabolInc/parabol/commit/f404e77c9a1516faff57e7e1b10cde0c73774f63))
* rename persistentUserId to persistentNameId ([#12532](https://github.com/ParabolInc/parabol/issues/12532)) ([2a734ac](https://github.com/ParabolInc/parabol/commit/2a734acd530502d179867187a98139c6fde631ef))

## [11.10.4](https://github.com/ParabolInc/parabol/compare/v11.10.3...v11.10.4) (2026-02-03)


### Fixed

* use contextFactory for all contexts ([#12539](https://github.com/ParabolInc/parabol/issues/12539)) ([75db54b](https://github.com/ParabolInc/parabol/commit/75db54b58a223de8e9283b066fb05f2a5c1b083c))

## [11.10.3](https://github.com/ParabolInc/parabol/compare/v11.10.2...v11.10.3) (2026-01-30)


### Fixed

* process pages first when adding new model ([#12522](https://github.com/ParabolInc/parabol/issues/12522)) ([c09ae42](https://github.com/ParabolInc/parabol/commit/c09ae42c8f1fddac4f480d630396a274153097ba))
* Qwen3 Quantized ([#12528](https://github.com/ParabolInc/parabol/issues/12528)) ([aae14db](https://github.com/ParabolInc/parabol/commit/aae14db999814e19f77a7204b07151f92c1eda3b))

## [11.10.2](https://github.com/ParabolInc/parabol/compare/v11.10.1...v11.10.2) (2026-01-23)


### Fixed

* oneOf validator for buildEmbeddings ([#12519](https://github.com/ParabolInc/parabol/issues/12519)) ([999db60](https://github.com/ParabolInc/parabol/commit/999db608914fd51ec9800eea3784fd92265786d7))

## [11.10.1](https://github.com/ParabolInc/parabol/compare/v11.10.0...v11.10.1) (2026-01-23)


### Fixed

* add ready() for TEI, only import recent items ([#12516](https://github.com/ParabolInc/parabol/issues/12516)) ([3711fc0](https://github.com/ParabolInc/parabol/commit/3711fc019707587a31b045e283469ceef13a241c))

## [11.10.0](https://github.com/ParabolInc/parabol/compare/v11.9.0...v11.10.0) (2026-01-23)


### Added

* Support adhoc embeds ([#12508](https://github.com/ParabolInc/parabol/issues/12508)) ([c48cc06](https://github.com/ParabolInc/parabol/commit/c48cc061461394088783c44887dc6410ac612fa7))


### Fixed

* ensure pgvector version, run in dev as well ([#12514](https://github.com/ParabolInc/parabol/issues/12514)) ([a8d61e8](https://github.com/ParabolInc/parabol/commit/a8d61e8a6021bd85c223e0d3c7b65cb7d07273f6))

## [11.9.0](https://github.com/ParabolInc/parabol/compare/v11.8.0...v11.9.0) (2026-01-22)


### Added

* User search for Pages ([#12499](https://github.com/ParabolInc/parabol/issues/12499)) ([2e5695b](https://github.com/ParabolInc/parabol/commit/2e5695be70e17ea7879d42f359c875edbb6cdbb9))

## [11.8.0](https://github.com/ParabolInc/parabol/compare/v11.7.0...v11.8.0) (2026-01-15)


### Added

* OAuth 2.0 Provider (behind feature flag) ([#12391](https://github.com/ParabolInc/parabol/issues/12391)) ([39f80b3](https://github.com/ParabolInc/parabol/commit/39f80b376bc3533d868f86c9b7bfa5474ed39814))


### Fixed

* fail when generating vendorsDll fails ([#12501](https://github.com/ParabolInc/parabol/issues/12501)) ([b56977c](https://github.com/ParabolInc/parabol/commit/b56977cbae3f832e382736dc23d9242fcddc99d7))
* remove @tiptap/react from vendors ([#12502](https://github.com/ParabolInc/parabol/issues/12502)) ([59336d5](https://github.com/ParabolInc/parabol/commit/59336d52955f53c2845967a4a88b1b364fcb2207))
* remove DLL for dev ([#12505](https://github.com/ParabolInc/parabol/issues/12505)) ([d935bd5](https://github.com/ParabolInc/parabol/commit/d935bd563d4b6d1bb57f6f842a0084e121c0b88e))


### Changed

* rerun buildDll on config change ([#12503](https://github.com/ParabolInc/parabol/issues/12503)) ([ac4de92](https://github.com/ParabolInc/parabol/commit/ac4de9227c5cd00d10d4c362b93623ea7a73b233))
* test OAuth app token access ([#12500](https://github.com/ParabolInc/parabol/issues/12500)) ([c9e1bc7](https://github.com/ParabolInc/parabol/commit/c9e1bc7ca10024c0b4cf36f57d02057ee81cad73))

## [11.7.0](https://github.com/ParabolInc/parabol/compare/v11.6.4...v11.7.0) (2026-01-12)


### Added

* database keyboard navigation ([#12491](https://github.com/ParabolInc/parabol/issues/12491)) ([fc59345](https://github.com/ParabolInc/parabol/commit/fc59345a690051cd6cf9021c1ac4970fa69711ad))


### Fixed

* bump qs version to safe ([#12495](https://github.com/ParabolInc/parabol/issues/12495)) ([4c9619f](https://github.com/ParabolInc/parabol/commit/4c9619fe961fc6b16ace9fb1310c653f335cf2c5))
* presign URL for local fs assets ([#12496](https://github.com/ParabolInc/parabol/issues/12496)) ([2a2739e](https://github.com/ParabolInc/parabol/commit/2a2739e563f71573ab05a40d54a0a238ee28aa0b))


### Changed

* mark organization feature flags as public explicitly ([#12493](https://github.com/ParabolInc/parabol/issues/12493)) ([f5092a1](https://github.com/ParabolInc/parabol/commit/f5092a1a9022675792fd9b856dd1b29fc09bf4cb))

## [11.6.4](https://github.com/ParabolInc/parabol/compare/v11.6.3...v11.6.4) (2026-01-07)


### Fixed

* hardDeleteUser with no teams ([#12485](https://github.com/ParabolInc/parabol/issues/12485)) ([b0178ec](https://github.com/ParabolInc/parabol/commit/b0178ec0c64ee0c97f75d802af63d44128ab59c7))

## [11.6.3](https://github.com/ParabolInc/parabol/compare/v11.6.2...v11.6.3) (2026-01-07)


### Fixed

* hardDeleteUser with no teams ([#12482](https://github.com/ParabolInc/parabol/issues/12482)) ([9cfcb49](https://github.com/ParabolInc/parabol/commit/9cfcb490406f778c837680e29fe948fbe2d20fb5))

## [11.6.2](https://github.com/ParabolInc/parabol/compare/v11.6.1...v11.6.2) (2026-01-07)


### Fixed

* deadlock in hardDeleteUser ([#12479](https://github.com/ParabolInc/parabol/issues/12479)) ([d6c4e4a](https://github.com/ParabolInc/parabol/commit/d6c4e4a98c5b7a504818488712829193f7191a8c))

## [11.6.1](https://github.com/ParabolInc/parabol/compare/v11.6.0...v11.6.1) (2026-01-07)


### Fixed

* delete PushInvitation when deleting User ([#12476](https://github.com/ParabolInc/parabol/issues/12476)) ([5d92ebd](https://github.com/ParabolInc/parabol/commit/5d92ebd037dc0a70b77687cd4a5f0ec6bc116ef4))

## [11.6.0](https://github.com/ParabolInc/parabol/compare/v11.5.0...v11.6.0) (2026-01-05)


### Added

* add check in summary table ([#12440](https://github.com/ParabolInc/parabol/issues/12440)) ([44c565e](https://github.com/ParabolInc/parabol/commit/44c565ed5f96da44e08a4fb4d3b6fbe1f9260a54))


### Fixed

* let superusers use as many tokens as they like for page insights ([#12469](https://github.com/ParabolInc/parabol/issues/12469)) ([780c04b](https://github.com/ParabolInc/parabol/commit/780c04b1980763dfef4b311302c8a9f4df1aca95))


### Changed

* support tsgo (remove baseUrl) ([#12472](https://github.com/ParabolInc/parabol/issues/12472)) ([1139cad](https://github.com/ParabolInc/parabol/commit/1139cadb0d9d31e31b32dbf7bec5874aa855b777))

## [11.5.0](https://github.com/ParabolInc/parabol/compare/v11.4.0...v11.5.0) (2025-12-18)


### Added

* clone external pictures when added to a page ([#12467](https://github.com/ParabolInc/parabol/issues/12467)) ([69e4a4b](https://github.com/ParabolInc/parabol/commit/69e4a4b06c54addee4909b3e2f5bc3978161ac55))


### Fixed

* check for isNotRemoved after querying the `teamMembers` dataloader ([#12462](https://github.com/ParabolInc/parabol/issues/12462)) ([9b3de31](https://github.com/ParabolInc/parabol/commit/9b3de31e3fafbd8bc5da054b8718b6f4f496a526))
* self-review the redir-loop PR ([#12463](https://github.com/ParabolInc/parabol/issues/12463)) ([421f28e](https://github.com/ParabolInc/parabol/commit/421f28ef5583c5e92ebed77e2a23cdf8b1646d57))
* signout when done impersonating ([#12460](https://github.com/ParabolInc/parabol/issues/12460)) ([e6ba0bd](https://github.com/ParabolInc/parabol/commit/e6ba0bdc5a98df3f650a3f710f7d2af9f059a303))
* typings for GraphQLError on the client ([#12464](https://github.com/ParabolInc/parabol/issues/12464)) ([2d83bfb](https://github.com/ParabolInc/parabol/commit/2d83bfbab1ab7786ac42d33e323d298c722dce21))

## [11.4.0](https://github.com/ParabolInc/parabol/compare/v11.3.2...v11.4.0) (2025-12-15)


### Added

* bump nodejs to v22.21.1 ([#12455](https://github.com/ParabolInc/parabol/issues/12455)) ([14f7e00](https://github.com/ParabolInc/parabol/commit/14f7e0054de551f29cce31fc84673e5d4a60ea93))

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
