# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [13.7.5](https://github.com/ParabolInc/parabol/compare/v13.7.4...v13.7.5) (2026-03-25)


### Fixed

* organization team details link ([#12929](https://github.com/ParabolInc/parabol/issues/12929)) ([5f4aaaf](https://github.com/ParabolInc/parabol/commit/5f4aaafdc7e493512d7010778a7d1107439bd277))
* upload images in reflections ([#12928](https://github.com/ParabolInc/parabol/issues/12928)) ([12e986c](https://github.com/ParabolInc/parabol/commit/12e986cbd083a56629d9f808fb81028dc5b18f83))


### Changed

* remove broken link from README ([#12925](https://github.com/ParabolInc/parabol/issues/12925)) ([c14ef0d](https://github.com/ParabolInc/parabol/commit/c14ef0d4ed074dc342eb824e04cfa2840aab533e))

## [13.7.4](https://github.com/ParabolInc/parabol/compare/v13.7.3...v13.7.4) (2026-03-25)


### Fixed

* disconnect public users on access change ([#12922](https://github.com/ParabolInc/parabol/issues/12922)) ([78117b4](https://github.com/ParabolInc/parabol/commit/78117b42ee5543eea773b3e776c6bc461df1d134))

## [13.7.3](https://github.com/ParabolInc/parabol/compare/v13.7.2...v13.7.3) (2026-03-25)


### Fixed

* allow routine SAML metadata refresh ([#12920](https://github.com/ParabolInc/parabol/issues/12920)) ([4d8b5d9](https://github.com/ParabolInc/parabol/commit/4d8b5d9e82341be3cfb2834cf8778f97a9ef27ef))
* detect SVGs for Page's image upload ([#12910](https://github.com/ParabolInc/parabol/issues/12910)) ([aa64045](https://github.com/ParabolInc/parabol/commit/aa64045433e09a2015ffa9238be29cc84b358e48))
* disconnect changed clients on PageAccessPayload ([#12898](https://github.com/ParabolInc/parabol/issues/12898)) ([07414fb](https://github.com/ParabolInc/parabol/commit/07414fb172221432c0b9bebe41a6879ecb9d10f6))
* set content-disposition: attachment for user assets ([#12911](https://github.com/ParabolInc/parabol/issues/12911)) ([f150b84](https://github.com/ParabolInc/parabol/commit/f150b84d9c9f50fb836635b5f3c6c8a03c6cb73d))


### Changed

* Improve SAML and SCIM settings UI ([#12916](https://github.com/ParabolInc/parabol/issues/12916)) ([179ca29](https://github.com/ParabolInc/parabol/commit/179ca29f93dc5a9f3c725d3cd054fe107d1a4fb4))
* move error feedback to google form ([#12912](https://github.com/ParabolInc/parabol/issues/12912)) ([21460b8](https://github.com/ParabolInc/parabol/commit/21460b8fbfdebf56162e5fd19b65e337d6ccc49e))

## [13.7.2](https://github.com/ParabolInc/parabol/compare/v13.7.1...v13.7.2) (2026-03-24)


### Fixed

* Remove duplicate `transfer-encoding` headers from Yoga responses. ([#12913](https://github.com/ParabolInc/parabol/issues/12913)) ([3f55242](https://github.com/ParabolInc/parabol/commit/3f55242186a882940f2c56a4be6803452c051006))

## [13.7.1](https://github.com/ParabolInc/parabol/compare/v13.7.0...v13.7.1) (2026-03-23)


### Fixed

* Batch Jira Issue fetching ([#12897](https://github.com/ParabolInc/parabol/issues/12897)) ([71611fd](https://github.com/ParabolInc/parabol/commit/71611fdd98b5fbc0059915a478e23a5fc6540d21))
* embeddings metadata index types ([#12907](https://github.com/ParabolInc/parabol/issues/12907)) ([6a12a2f](https://github.com/ParabolInc/parabol/commit/6a12a2f47980d9231eebb84cf1b846c4e20e1859))
* patch version bumps ([#12904](https://github.com/ParabolInc/parabol/issues/12904)) ([9e51f55](https://github.com/ParabolInc/parabol/commit/9e51f550fe4ac92fdf026098dbcb4a7ff0dbeefc))
* remove jiraDimensionFields column from the Team table ([#12908](https://github.com/ParabolInc/parabol/issues/12908)) ([7c4c3dd](https://github.com/ParabolInc/parabol/commit/7c4c3ddbb756fce2b4ce0fbf0ebd7a8a9386a7a9))

## [13.7.0](https://github.com/ParabolInc/parabol/compare/v13.6.6...v13.7.0) (2026-03-20)


### Added

* coupons for upgrading to team plan ([#12892](https://github.com/ParabolInc/parabol/issues/12892)) ([93a19ee](https://github.com/ParabolInc/parabol/commit/93a19ee3ac6df28b802486eff6227be8a7e4cfa1))


### Fixed

* do not remove last billing leader ([#12890](https://github.com/ParabolInc/parabol/issues/12890)) ([76035f4](https://github.com/ParabolInc/parabol/commit/76035f4141e664aabd0d7f42f5346a488d6d79cc))
* ironbank action 2 ([#12888](https://github.com/ParabolInc/parabol/issues/12888)) ([a641054](https://github.com/ParabolInc/parabol/commit/a6410548dec10b4a3e2b86cb3e55409d31d5c9e4))
* more robust embedUserAsset URL checks ([#12891](https://github.com/ParabolInc/parabol/issues/12891)) ([111397a](https://github.com/ParabolInc/parabol/commit/111397a45e0f6d4a3985b225513a87cfed1ff8cd))
* page meetingSummaryId ([#12893](https://github.com/ParabolInc/parabol/issues/12893)) ([ecff1f3](https://github.com/ParabolInc/parabol/commit/ecff1f35a4fbcab87c9d842b6eb3a66c1591b098))
* paste Pages docs with many images ([#12751](https://github.com/ParabolInc/parabol/issues/12751)) ([9e683c6](https://github.com/ParabolInc/parabol/commit/9e683c69a3e00a9f80a8921a04de3fa287936f58))


### Changed

* clean FailedAuthRequest in tests ([#12895](https://github.com/ParabolInc/parabol/issues/12895)) ([e4469db](https://github.com/ParabolInc/parabol/commit/e4469db2c97878aa5c558b8cee59604b11e986ac))
* confirm auth before deleting user ([#12883](https://github.com/ParabolInc/parabol/issues/12883)) ([2cf0fa0](https://github.com/ParabolInc/parabol/commit/2cf0fa08f251f87da83dc68fe0950415facccd0d))
* react v18 migration ([#12792](https://github.com/ParabolInc/parabol/issues/12792)) ([4ed231b](https://github.com/ParabolInc/parabol/commit/4ed231be4060f60f952a619e69890c4a25f373cc))

## [13.6.6](https://github.com/ParabolInc/parabol/compare/v13.6.5...v13.6.6) (2026-03-18)


### Fixed

* clear pages offline data on logout ([#12881](https://github.com/ParabolInc/parabol/issues/12881)) ([1482c0f](https://github.com/ParabolInc/parabol/commit/1482c0f04b56c7481d2f4dce175d244642d0ae97))
* nodejs bump ([#12885](https://github.com/ParabolInc/parabol/issues/12885)) ([c843189](https://github.com/ParabolInc/parabol/commit/c843189e7e42bb510d8e52432ec0490ddef9c32c))
* security bumps ([#12886](https://github.com/ParabolInc/parabol/issues/12886)) ([b6b3743](https://github.com/ParabolInc/parabol/commit/b6b374375e314ff8eac355527ca277c83b0d546e))

## [13.6.5](https://github.com/ParabolInc/parabol/compare/v13.6.4...v13.6.5) (2026-03-17)


### Fixed

* create company cluster after creating org ([#12878](https://github.com/ParabolInc/parabol/issues/12878)) ([677f87e](https://github.com/ParabolInc/parabol/commit/677f87e200aa8e25b0680b04df727542b96a735e))

## [13.6.4](https://github.com/ParabolInc/parabol/compare/v13.6.3...v13.6.4) (2026-03-17)


### Changed

* Speed up database import ([#12776](https://github.com/ParabolInc/parabol/issues/12776)) ([8189a47](https://github.com/ParabolInc/parabol/commit/8189a476e54bf6a1b8f8f5de0a391f001f7fc113))

## [13.6.3](https://github.com/ParabolInc/parabol/compare/v13.6.2...v13.6.3) (2026-03-16)


### Fixed

* invalidate invites on remove from org ([#12873](https://github.com/ParabolInc/parabol/issues/12873)) ([4dee00b](https://github.com/ParabolInc/parabol/commit/4dee00b7702c994f3eaa988eafc248035565d2d0))
* verify team invite token matches email ([#12872](https://github.com/ParabolInc/parabol/issues/12872)) ([e0de9de](https://github.com/ParabolInc/parabol/commit/e0de9defedba307b56fb97b341bbc845579e5697))


### Changed

* finish database row type migration ([#12793](https://github.com/ParabolInc/parabol/issues/12793)) ([f59ddbd](https://github.com/ParabolInc/parabol/commit/f59ddbda09bfd1bb93860db2da8abea717520f9b))

## [13.6.2](https://github.com/ParabolInc/parabol/compare/v13.6.1...v13.6.2) (2026-03-16)


### Fixed

* **SCIM:** team archivor can be null ([#12868](https://github.com/ParabolInc/parabol/issues/12868)) ([ea9717d](https://github.com/ParabolInc/parabol/commit/ea9717d96bbdf15b55913f8b03b3da2c5e00b1e3))

## [13.6.1](https://github.com/ParabolInc/parabol/compare/v13.6.0...v13.6.1) (2026-03-13)


### Changed

* Update release workflow to checkout from `origin/production` ([#12861](https://github.com/ParabolInc/parabol/issues/12861)) ([884ecde](https://github.com/ParabolInc/parabol/commit/884ecde7d4c5d3622a500f2757aef986aeeb58a2))

## [13.6.0](https://github.com/ParabolInc/parabol/compare/v13.5.3...v13.6.0) (2026-03-13)


### Added

* Always display Jira Data Center tab for poker ([#12859](https://github.com/ParabolInc/parabol/issues/12859)) ([d4a99ca](https://github.com/ParabolInc/parabol/commit/d4a99ca76961cfba86ac8c218a7e9f814bf13e18))
* improved AI grouping; ungrouping; title marquee ([#12837](https://github.com/ParabolInc/parabol/issues/12837)) ([c794cb0](https://github.com/ParabolInc/parabol/commit/c794cb0cb0f7622786c0c2269b83ab9bea8edd83))


### Fixed

* linear issue titles in meeting summaries ([#12855](https://github.com/ParabolInc/parabol/issues/12855)) ([7cdddeb](https://github.com/ParabolInc/parabol/commit/7cdddeb8d601f0b313aef5ad9601412f007aff14))

## [13.5.3](https://github.com/ParabolInc/parabol/compare/v13.5.2...v13.5.3) (2026-03-13)


### Fixed

* remove Mattermost plugin provider if env is not present ([#12853](https://github.com/ParabolInc/parabol/issues/12853)) ([d1d9ea8](https://github.com/ParabolInc/parabol/commit/d1d9ea8903580b671b1d444a23e4dae1958557fd))

## [13.5.2](https://github.com/ParabolInc/parabol/compare/v13.5.1...v13.5.2) (2026-03-13)


### Fixed

* push to ironbank4 ([#12850](https://github.com/ParabolInc/parabol/issues/12850)) ([5137181](https://github.com/ParabolInc/parabol/commit/5137181d31d91ece1c637a5c4da238b7b7dc907d))

## [13.5.1](https://github.com/ParabolInc/parabol/compare/v13.5.0...v13.5.1) (2026-03-13)


### Fixed

* ironbank push 3 ([#12847](https://github.com/ParabolInc/parabol/issues/12847)) ([ee59040](https://github.com/ParabolInc/parabol/commit/ee590407f9ac67fd19dc8787aabb45d55a1c1eb9))

## [13.5.0](https://github.com/ParabolInc/parabol/compare/v13.4.0...v13.5.0) (2026-03-12)


### Added

* automate Ironbank PR creation and update ([#12843](https://github.com/ParabolInc/parabol/issues/12843)) ([0cd9af4](https://github.com/ParabolInc/parabol/commit/0cd9af4ed3a737709e0453a41dc0410b169c9729))


### Fixed

* ironbank push dupe ([#12845](https://github.com/ParabolInc/parabol/issues/12845)) ([6d38e1a](https://github.com/ParabolInc/parabol/commit/6d38e1ab9d07a0cb2d42a8c2c282dd6c0d44a677))

## [13.4.0](https://github.com/ParabolInc/parabol/compare/v13.3.1...v13.4.0) (2026-03-12)


### Added

* drag handle menu, position normalization ([#12753](https://github.com/ParabolInc/parabol/issues/12753)) ([5f2a361](https://github.com/ParabolInc/parabol/commit/5f2a3612eccb6adeb3e98db77cde7498fcfb0df2))


### Fixed

* blacklist all JWT on password reset ([#12834](https://github.com/ParabolInc/parabol/issues/12834)) ([e4954f0](https://github.com/ParabolInc/parabol/commit/e4954f0f7de4cfb74e52c7d2507acc9a7a9d17ef))
* bump deps ([#12840](https://github.com/ParabolInc/parabol/issues/12840)) ([bcc4e08](https://github.com/ParabolInc/parabol/commit/bcc4e0861ac78eca16d28244b88a6a0287afd98c))
* check template permissions when querying directly ([#12836](https://github.com/ParabolInc/parabol/issues/12836)) ([4678447](https://github.com/ParabolInc/parabol/commit/467844757a7d989129f56df1c2de44df3498dfdc))

## [13.3.1](https://github.com/ParabolInc/parabol/compare/v13.3.0...v13.3.1) (2026-03-12)


### Fixed

* blacklist session token on signout ([#12831](https://github.com/ParabolInc/parabol/issues/12831)) ([4059d31](https://github.com/ParabolInc/parabol/commit/4059d3144ff4295882868aad9847b9e8bcd5391b))

## [13.3.0](https://github.com/ParabolInc/parabol/compare/v13.2.0...v13.3.0) (2026-03-12)


### Added

* Implement free-tier Jira export limits with an upgrade modal ([#12828](https://github.com/ParabolInc/parabol/issues/12828)) ([9ccafca](https://github.com/ParabolInc/parabol/commit/9ccafca0d57e582d97dd72729b442aad3aa64770))

## [13.2.0](https://github.com/ParabolInc/parabol/compare/v13.1.3...v13.2.0) (2026-03-11)


### Added

* Implement server-side validation for document IDs ([#12825](https://github.com/ParabolInc/parabol/issues/12825)) ([24a98dd](https://github.com/ParabolInc/parabol/commit/24a98ddf28d6d1f4941254ed402ffe8ddbfa8c74))

## [13.1.3](https://github.com/ParabolInc/parabol/compare/v13.1.2...v13.1.3) (2026-03-11)


### Fixed

* re-adding meeting series recurrence ([#12821](https://github.com/ParabolInc/parabol/issues/12821)) ([ea2e002](https://github.com/ParabolInc/parabol/commit/ea2e002143ef84d8775e3bd55ad39d5282ac2e0a))

## [13.1.2](https://github.com/ParabolInc/parabol/compare/v13.1.1...v13.1.2) (2026-03-11)


### Fixed

* flush indexedDB record on bad page auth ([#12820](https://github.com/ParabolInc/parabol/issues/12820)) ([20e2fef](https://github.com/ParabolInc/parabol/commit/20e2fef54dcd0001249a26ca3f9095cca147a5da))


### Changed

* add getVerifiedAuthToken test ([#12816](https://github.com/ParabolInc/parabol/issues/12816)) ([49f00b0](https://github.com/ParabolInc/parabol/commit/49f00b0fc0c573eb0daea0585a735000e49c6f1f))

## [13.1.1](https://github.com/ParabolInc/parabol/compare/v13.1.0...v13.1.1) (2026-03-11)


### Fixed

* **SCIM:** adapt `itemsPerPage` to reflect resources length ([#12813](https://github.com/ParabolInc/parabol/issues/12813)) ([d3f0069](https://github.com/ParabolInc/parabol/commit/d3f006989710c342c88625e64c0604c3c93fa1be))


### Changed

* delete email verification token on usage ([#12810](https://github.com/ParabolInc/parabol/issues/12810)) ([a1613a1](https://github.com/ParabolInc/parabol/commit/a1613a1119cf4f61c3dbe615510615256358c7a4))
* increase password requirements ([#12809](https://github.com/ParabolInc/parabol/issues/12809)) ([8907b01](https://github.com/ParabolInc/parabol/commit/8907b01cf54fb31f5362021f799aa075f5b241c7))

## [13.1.0](https://github.com/ParabolInc/parabol/compare/v13.0.1...v13.1.0) (2026-03-11)


### Added

* limit on company cluster ([#12806](https://github.com/ParabolInc/parabol/issues/12806)) ([feaa9b3](https://github.com/ParabolInc/parabol/commit/feaa9b31ff062f8eaa28cf19f1182c80c9159373))


### Fixed

* blacklistJWT on delete user ([#12807](https://github.com/ParabolInc/parabol/issues/12807)) ([c1d380a](https://github.com/ParabolInc/parabol/commit/c1d380a869ac6a0708e22b69889999bf1314ce99))

## [13.0.1](https://github.com/ParabolInc/parabol/compare/v13.0.0...v13.0.1) (2026-03-09)


### Fixed

* update page link migration ([#12803](https://github.com/ParabolInc/parabol/issues/12803)) ([7b0c2af](https://github.com/ParabolInc/parabol/commit/7b0c2afd23ef4a907eb541c2c0e67147ac43c18a))

## [13.0.0](https://github.com/ParabolInc/parabol/compare/v12.10.12...v13.0.0) (2026-03-09)

### DO NOT UPDATE TO THIS VERSION

* the migration is broken, go at least straight to 13.0.1

### ⚠ BREAKING CHANGES

* update invalid page links ([#12797](https://github.com/ParabolInc/parabol/issues/12797))

### Fixed

* update invalid page links ([#12797](https://github.com/ParabolInc/parabol/issues/12797)) ([7355bca](https://github.com/ParabolInc/parabol/commit/7355bca8f0f5b8762999908ccd7035294f3a286c))

## [12.10.12](https://github.com/ParabolInc/parabol/compare/v12.10.11...v12.10.12) (2026-03-09)


### Changed

* Improve database performance ([#12775](https://github.com/ParabolInc/parabol/issues/12775)) ([d3d1f86](https://github.com/ParabolInc/parabol/commit/d3d1f8692bab396e63814dabf30653d41bb40132))

## [12.10.11](https://github.com/ParabolInc/parabol/compare/v12.10.10...v12.10.11) (2026-03-09)


### Fixed

* separate page cipher id environment variable ([#12796](https://github.com/ParabolInc/parabol/issues/12796)) ([3daef57](https://github.com/ParabolInc/parabol/commit/3daef579cae635925fc7f8129e95d36d8198dedf))


### Changed

* disable review stats ([#12783](https://github.com/ParabolInc/parabol/issues/12783)) ([8ab8df1](https://github.com/ParabolInc/parabol/commit/8ab8df1c8cf9eddcaf9eebb14446da9f724668e1))
* virtualize DatabaseView ([#12778](https://github.com/ParabolInc/parabol/issues/12778)) ([76b1465](https://github.com/ParabolInc/parabol/commit/76b14658487bcc3c8784cf05482a23334dbfe386))

## [12.10.10](https://github.com/ParabolInc/parabol/compare/v12.10.9...v12.10.10) (2026-03-06)


### Fixed

* sign out on not signed in error ([#12779](https://github.com/ParabolInc/parabol/issues/12779)) ([fd20095](https://github.com/ParabolInc/parabol/commit/fd20095edf2a544d19b1adcddc4f5e9c0fa23748))

## [12.10.9](https://github.com/ParabolInc/parabol/compare/v12.10.8...v12.10.9) (2026-03-03)


### Fixed

* remove unused hubspot API vars ([#12769](https://github.com/ParabolInc/parabol/issues/12769)) ([b2e7576](https://github.com/ParabolInc/parabol/commit/b2e757618c2364d5b0a3e5376c180af9b91d1a1c))


### Changed

* AI rules from past review comments ([#12752](https://github.com/ParabolInc/parabol/issues/12752)) ([316f730](https://github.com/ParabolInc/parabol/commit/316f7306f0581f98120715b9563f533977c813f8))

## [12.10.8](https://github.com/ParabolInc/parabol/compare/v12.10.7...v12.10.8) (2026-03-03)


### Fixed

* pages dnd ([#12719](https://github.com/ParabolInc/parabol/issues/12719)) ([de642f1](https://github.com/ParabolInc/parabol/commit/de642f1fd8fe0612cf61106afe90d62a667a6c2e))
* remove cookie logging, add validation logging ([#12763](https://github.com/ParabolInc/parabol/issues/12763)) ([bf9f077](https://github.com/ParabolInc/parabol/commit/bf9f0771719e971ef21cc49b26ae3a60ce6b113a))
* Tab/S+Tab indention for details, tasks ([#12762](https://github.com/ParabolInc/parabol/issues/12762)) ([a655843](https://github.com/ParabolInc/parabol/commit/a6558438a6bb75091279b79c82f55601b6b33573))
* Update `refUpdatedAt` on conflict when renaming meeting templates. ([#12749](https://github.com/ParabolInc/parabol/issues/12749)) ([e05bb5c](https://github.com/ParabolInc/parabol/commit/e05bb5c0fe619c0402af4f2258d03c7480aec1bc))
* upgrade react-beautiful-dnd ([#12761](https://github.com/ParabolInc/parabol/issues/12761)) ([5298734](https://github.com/ParabolInc/parabol/commit/52987342cd62e4e9c2bf5c12e267bbfa333f51b0))
* Use INSERT ... SELECT for PageBacklink to prevent foreign key violation ([#12760](https://github.com/ParabolInc/parabol/issues/12760)) ([20621a8](https://github.com/ParabolInc/parabol/commit/20621a88d29b6995277328e6082a3dac6e6cd06a))

## [12.10.7](https://github.com/ParabolInc/parabol/compare/v12.10.6...v12.10.7) (2026-02-28)


### Changed

* fail staging and prod deployments properly and restrict PR creation ([#12754](https://github.com/ParabolInc/parabol/issues/12754)) ([7826d31](https://github.com/ParabolInc/parabol/commit/7826d317a6ad1241cc68fd55ecb50553df273930))

## [12.10.6](https://github.com/ParabolInc/parabol/compare/v12.10.5...v12.10.6) (2026-02-28)


### Fixed

* bump vuln package ([#12742](https://github.com/ParabolInc/parabol/issues/12742)) ([f38b38b](https://github.com/ParabolInc/parabol/commit/f38b38bcf0f5b5dbcca0f518e78ee500c54cc9e1))
* centralize GraphQL authorization ([#12745](https://github.com/ParabolInc/parabol/issues/12745)) ([3539a4e](https://github.com/ParabolInc/parabol/commit/3539a4ef8e7402bad70ab8de6d9c115ed129e934))
* revert maps change ([#12747](https://github.com/ParabolInc/parabol/issues/12747)) ([1bb8eaf](https://github.com/ParabolInc/parabol/commit/1bb8eaff56033a3fd5356279c87c873e730fd2b3))
* updated minified-path-prefix for datadog maps ([#12746](https://github.com/ParabolInc/parabol/issues/12746)) ([a7296d9](https://github.com/ParabolInc/parabol/commit/a7296d9f3b830b7589edd3e599602b402cd14318))


### Changed

* make Mattermost Webhook and Plugin integration independent ([#12716](https://github.com/ParabolInc/parabol/issues/12716)) ([0841387](https://github.com/ParabolInc/parabol/commit/084138721f6b51eed8276af6052339836906298e))

## [12.10.5](https://github.com/ParabolInc/parabol/compare/v12.10.4...v12.10.5) (2026-02-27)


### Fixed

* properly notify client if AuthToken is unauthorized ([#12724](https://github.com/ParabolInc/parabol/issues/12724)) ([1cab8a0](https://github.com/ParabolInc/parabol/commit/1cab8a0c2664ba3b70fc4be0c8e0b7e0cad89777))

## [12.10.4](https://github.com/ParabolInc/parabol/compare/v12.10.3...v12.10.4) (2026-02-27)


### Fixed

* rollback aggressive logging out ([#12720](https://github.com/ParabolInc/parabol/issues/12720)) ([6abcafc](https://github.com/ParabolInc/parabol/commit/6abcafcfc426d98e520fef7fc2bfaed705274ad9))

## [12.10.3](https://github.com/ParabolInc/parabol/compare/v12.10.2...v12.10.3) (2026-02-27)


### Fixed

* allow signOut ([#12709](https://github.com/ParabolInc/parabol/issues/12709)) ([e605bed](https://github.com/ParabolInc/parabol/commit/e605bed7661c68da389cc8262aecf54e289c0018))
* await adding organization user in SCIM ([#12715](https://github.com/ParabolInc/parabol/issues/12715)) ([00a2522](https://github.com/ParabolInc/parabol/commit/00a2522a9d3ff72ccf6a5e55ab950a8a0cbfd544))
* log out client if auth token is rejected ([#12714](https://github.com/ParabolInc/parabol/issues/12714)) ([e5feca3](https://github.com/ParabolInc/parabol/commit/e5feca34743a8ca456414513202e63fbd3e4825e))
* Recurrence wouldn't restart meetings due to missing meeting settings ([#12717](https://github.com/ParabolInc/parabol/issues/12717)) ([606c44e](https://github.com/ParabolInc/parabol/commit/606c44ea5b928a025ca460f207f6a77600d333bc))

## [12.10.2](https://github.com/ParabolInc/parabol/compare/v12.10.1...v12.10.2) (2026-02-27)


### Fixed

* **embedder:** abort pending drought promise on graceful shutdown ([#12708](https://github.com/ParabolInc/parabol/issues/12708)) ([41cb22d](https://github.com/ParabolInc/parabol/commit/41cb22d89ee5c3f4a4e4640bcf24d79b6fd96cb6))

## [12.10.1](https://github.com/ParabolInc/parabol/compare/v12.10.0...v12.10.1) (2026-02-27)


### Fixed

* page links on public pages ([#12703](https://github.com/ParabolInc/parabol/issues/12703)) ([613f0f6](https://github.com/ParabolInc/parabol/commit/613f0f61f01246964bfb1bb31d99762546c17149))

## [12.10.0](https://github.com/ParabolInc/parabol/compare/v12.9.4...v12.10.0) (2026-02-27)


### Added

* linear search by issue id ([#12688](https://github.com/ParabolInc/parabol/issues/12688)) ([924bb36](https://github.com/ParabolInc/parabol/commit/924bb36c0c6d3e4b21ac973e926d2c37103f23bd))


### Fixed

* cleanup PG from embedder refactor ([#12699](https://github.com/ParabolInc/parabol/issues/12699)) ([b5ffd14](https://github.com/ParabolInc/parabol/commit/b5ffd1472c9589ad07400d018bb76b7788443086))
* Refactor to SDL part 4 ([#12698](https://github.com/ParabolInc/parabol/issues/12698)) ([4c80526](https://github.com/ParabolInc/parabol/commit/4c8052699f4cec69f04edf40fdcf561cd9e26aba))
* show updated filter result in integration footer ([#12695](https://github.com/ParabolInc/parabol/issues/12695)) ([8f003e2](https://github.com/ParabolInc/parabol/commit/8f003e2af53de54a03f450a9a703d01c3edb8991))

## [12.9.4](https://github.com/ParabolInc/parabol/compare/v12.9.3...v12.9.4) (2026-02-26)


### Fixed

* retro discuss to unknown ([#12692](https://github.com/ParabolInc/parabol/issues/12692)) ([bf22ea3](https://github.com/ParabolInc/parabol/commit/bf22ea318bffd505da7339c8def79d14f7556f8f))

## [12.9.3](https://github.com/ParabolInc/parabol/compare/v12.9.2...v12.9.3) (2026-02-26)


### Fixed

* MeetingSubnavItem multiple tooltips ([#12679](https://github.com/ParabolInc/parabol/issues/12679)) ([324e251](https://github.com/ParabolInc/parabol/commit/324e25123aae4e58e9bc88440dddcfa643872157))
* push task to GitHub or Linear ([#12685](https://github.com/ParabolInc/parabol/issues/12685)) ([bdcbdad](https://github.com/ParabolInc/parabol/commit/bdcbdad2558cd40a09829bbd3d102b6b1eb53dbd))
* SDL Refactor Part 2 ([#12681](https://github.com/ParabolInc/parabol/issues/12681)) ([f0fdf99](https://github.com/ParabolInc/parabol/commit/f0fdf99fea1242c799e86068c053967374d9499a))
* SDL Refactor Part 3 ([#12682](https://github.com/ParabolInc/parabol/issues/12682)) ([3be4e6d](https://github.com/ParabolInc/parabol/commit/3be4e6ddcbbc37fbaa9a03216d1f26efea57e023))


### Changed

* **SCIM:** update README to reflect Group provisioning capability ([#12684](https://github.com/ParabolInc/parabol/issues/12684)) ([219a95f](https://github.com/ParabolInc/parabol/commit/219a95f1069c895a7fbc67cca54a89c937c49408))

## [12.9.2](https://github.com/ParabolInc/parabol/compare/v12.9.1...v12.9.2) (2026-02-25)


### Changed

* lax authCookie ([#12675](https://github.com/ParabolInc/parabol/issues/12675)) ([61b2fcf](https://github.com/ParabolInc/parabol/commit/61b2fcf712e373360ba06539fcb1b8c6e93bc63b))

## [12.9.1](https://github.com/ParabolInc/parabol/compare/v12.9.0...v12.9.1) (2026-02-25)


### Changed

* enable SAML test ([#12663](https://github.com/ParabolInc/parabol/issues/12663)) ([5ec1289](https://github.com/ParabolInc/parabol/commit/5ec12895466803e17a69a56589de30b6852c67df))
* let abandoned SSO users recover their accounts ([#12646](https://github.com/ParabolInc/parabol/issues/12646)) ([fd43fdd](https://github.com/ParabolInc/parabol/commit/fd43fdde2c35aa4042c49be18dc92124badf714b))

## [12.9.0](https://github.com/ParabolInc/parabol/compare/v12.8.3...v12.9.0) (2026-02-25)


### Added

* Implement Jira export limits for starter tier organizations ([#12668](https://github.com/ParabolInc/parabol/issues/12668)) ([86d8c32](https://github.com/ParabolInc/parabol/commit/86d8c32f11718b84762895730cc2261eabd3cb9b))


### Fixed

* jira exports 2 ([#12670](https://github.com/ParabolInc/parabol/issues/12670)) ([552ab3c](https://github.com/ParabolInc/parabol/commit/552ab3c92f83b89a5a5bbb1dba13337ea4f7cf2e))
* Refactor asset fetching in `embedUserAsset` to use safer fetch ([#12671](https://github.com/ParabolInc/parabol/issues/12671)) ([1c1da75](https://github.com/ParabolInc/parabol/commit/1c1da754c0a3188938a5280c7ffe2e84173a437a))

## [12.8.3](https://github.com/ParabolInc/parabol/compare/v12.8.2...v12.8.3) (2026-02-24)


### Fixed

* refactor selectTemplate mutation ([#12662](https://github.com/ParabolInc/parabol/issues/12662)) ([0070fa5](https://github.com/ParabolInc/parabol/commit/0070fa5800a1480cc1fab64a2ecbd0250da689eb))

## [12.8.2](https://github.com/ParabolInc/parabol/compare/v12.8.1...v12.8.2) (2026-02-24)


### Fixed

* mutation permissions ([#12651](https://github.com/ParabolInc/parabol/issues/12651)) ([2abe4fd](https://github.com/ParabolInc/parabol/commit/2abe4fd4dacff0c5e7b043c214302e79feffd832))

## [12.8.1](https://github.com/ParabolInc/parabol/compare/v12.8.0...v12.8.1) (2026-02-24)


### Fixed

* prevent moving and dragging of Meeting Summaries pages ([#12657](https://github.com/ParabolInc/parabol/issues/12657)) ([f35cb22](https://github.com/ParabolInc/parabol/commit/f35cb22dc30a430a450b9c3b73eda333c724769c))

## [12.8.0](https://github.com/ParabolInc/parabol/compare/v12.7.2...v12.8.0) (2026-02-24)


### Added

* meeting summaries toc ([#12653](https://github.com/ParabolInc/parabol/issues/12653)) ([16938b7](https://github.com/ParabolInc/parabol/commit/16938b7700a3f1605c3d46c3f49869dae4cd9284))


### Fixed

* various input text wrapping bugs ([#12602](https://github.com/ParabolInc/parabol/issues/12602)) ([b0ec1d7](https://github.com/ParabolInc/parabol/commit/b0ec1d7c2a884a795eb05ce15bb91783b7f6b9d3))

## [12.7.2](https://github.com/ParabolInc/parabol/compare/v12.7.1...v12.7.2) (2026-02-20)


### Fixed

* slow queries ([#12640](https://github.com/ParabolInc/parabol/issues/12640)) ([b032fa1](https://github.com/ParabolInc/parabol/commit/b032fa1b07bf2a0babda14f3313e3d31e65415d0))


### Changed

* separate v11 changelogs ([#12644](https://github.com/ParabolInc/parabol/issues/12644)) ([6bbf49e](https://github.com/ParabolInc/parabol/commit/6bbf49eba079938bf64d48309689b371234fcc9f))

## [12.7.1](https://github.com/ParabolInc/parabol/compare/v12.7.0...v12.7.1) (2026-02-20)


### Fixed

* even more logging for cookieless websocket ([#12641](https://github.com/ParabolInc/parabol/issues/12641)) ([d379c80](https://github.com/ParabolInc/parabol/commit/d379c80313b11a5cfb3e856398a66bfe2045f762))

## [12.7.0](https://github.com/ParabolInc/parabol/compare/v12.6.1...v12.7.0) (2026-02-20)


### Added

* import dropped CSV and XLSX files into database ([#12608](https://github.com/ParabolInc/parabol/issues/12608)) ([6b932d4](https://github.com/ParabolInc/parabol/commit/6b932d445dc908455f9089a786b7c427e5539122))


### Fixed

* broken page removal on team member removal ([#12633](https://github.com/ParabolInc/parabol/issues/12633)) ([ba1ab3b](https://github.com/ParabolInc/parabol/commit/ba1ab3b5fed2d92dd694ba4d8f88f60f36976afb))
* logout on delete account ([#12632](https://github.com/ParabolInc/parabol/issues/12632)) ([6689a6c](https://github.com/ParabolInc/parabol/commit/6689a6cbcf5d6abb6ed353d9775e263cf116921a))
* more logging for awareness bug ([#12637](https://github.com/ParabolInc/parabol/issues/12637)) ([cda6bf2](https://github.com/ParabolInc/parabol/commit/cda6bf20e9e5e029403ecfcb7cfcc72f4956823e))
* remove swiper (unused) ([#12636](https://github.com/ParabolInc/parabol/issues/12636)) ([39fd07e](https://github.com/ParabolInc/parabol/commit/39fd07e6eb42c168cf337f6de4f434dbea7587f1))
* update readVarString usage to create new Uint8 to avoid buffer overflow ([#12634](https://github.com/ParabolInc/parabol/issues/12634)) ([387a64f](https://github.com/ParabolInc/parabol/commit/387a64fb4f8a7057d7babf54a3273059d91e125f))


### Changed

* ensure fresh SCIM Bearer Token each time ([#12630](https://github.com/ParabolInc/parabol/issues/12630)) ([9161cc6](https://github.com/ParabolInc/parabol/commit/9161cc6cf6db115d0e5364a64056c0fac10d24aa))
* more robust extension detection for loginSSO ([#12629](https://github.com/ParabolInc/parabol/issues/12629)) ([d903da4](https://github.com/ParabolInc/parabol/commit/d903da432d8333b05fde411677a0d7cdd8365777))

## [12.6.1](https://github.com/ParabolInc/parabol/compare/v12.6.0...v12.6.1) (2026-02-19)


### Fixed

* exclude deleted pages from search ([#12627](https://github.com/ParabolInc/parabol/issues/12627)) ([cb7e1c8](https://github.com/ParabolInc/parabol/commit/cb7e1c82e5f6217e3b09ecd4de7372157c85865e))
* reflection card padding in reflect and group phase  ([#12625](https://github.com/ParabolInc/parabol/issues/12625)) ([2c3921f](https://github.com/ParabolInc/parabol/commit/2c3921fc8751fc932d1c5f084b29c42993889b80))

## [12.6.0](https://github.com/ParabolInc/parabol/compare/v12.5.0...v12.6.0) (2026-02-18)


### Added

* Search on enter ([#12595](https://github.com/ParabolInc/parabol/issues/12595)) ([99173c8](https://github.com/ParabolInc/parabol/commit/99173c85802dff2d26234336f12d32023140171e))


### Fixed

* bump to nodejs v24.13.1 ([#12620](https://github.com/ParabolInc/parabol/issues/12620)) ([a8dec9c](https://github.com/ParabolInc/parabol/commit/a8dec9c1d304eaf01dcb077770475ab75c037865))
* security bumps: fast-xml-parser and markdown-it ([#12622](https://github.com/ParabolInc/parabol/issues/12622)) ([6cbfa41](https://github.com/ParabolInc/parabol/commit/6cbfa414fa1cae224c93c1cb0d155d8947dc020c))

## [12.5.0](https://github.com/ParabolInc/parabol/compare/v12.4.0...v12.5.0) (2026-02-18)


### Added

* Add reflection group color dots to retro sidebar ([#12616](https://github.com/ParabolInc/parabol/issues/12616)) ([5202a07](https://github.com/ParabolInc/parabol/commit/5202a07646c74d1392fe4bb880d0b649820300db))


### Fixed

* new user infinite loop on accept team invitation ([#12613](https://github.com/ParabolInc/parabol/issues/12613)) ([e6b45cb](https://github.com/ParabolInc/parabol/commit/e6b45cbb3fe80061e60664020bbbe0fe0c40152c))
* Task typo ([#12614](https://github.com/ParabolInc/parabol/issues/12614)) ([7effd89](https://github.com/ParabolInc/parabol/commit/7effd89296d08a98ff739cf5200516bcfd6f43a7))

## [12.4.0](https://github.com/ParabolInc/parabol/compare/v12.3.0...v12.4.0) (2026-02-17)


### Added

* Enable users to select and display additional Jira fields ([#12600](https://github.com/ParabolInc/parabol/issues/12600)) ([5f5f67f](https://github.com/ParabolInc/parabol/commit/5f5f67fa7dfee9099d2ba12303acde0535520a32))


### Fixed

* Allow upload of CSV and other text/* formats ([#12603](https://github.com/ParabolInc/parabol/issues/12603)) ([e0009a9](https://github.com/ParabolInc/parabol/commit/e0009a909ce2a2d794233f6c9f86b6429d5dcdf8))
* jira extra fields correction ([#12606](https://github.com/ParabolInc/parabol/issues/12606)) ([cddab23](https://github.com/ParabolInc/parabol/commit/cddab23019dcf1e9f9e85e686f4a3be663103bd1))


### Changed

* move TipTapEditor into its own folder ([#12605](https://github.com/ParabolInc/parabol/issues/12605)) ([d334630](https://github.com/ParabolInc/parabol/commit/d334630e9b8fa37a4087fea261cfa6a5f4403e42))

## [12.3.0](https://github.com/ParabolInc/parabol/compare/v12.2.1...v12.3.0) (2026-02-13)


### Added

* Add user mentions to Pages ([#12588](https://github.com/ParabolInc/parabol/issues/12588)) ([d44f4d3](https://github.com/ParabolInc/parabol/commit/d44f4d3e3293bb1cbac839d7063c01503a83aff0))
* **SCIM:** Add Group Provisioning ([#12594](https://github.com/ParabolInc/parabol/issues/12594)) ([6330417](https://github.com/ParabolInc/parabol/commit/6330417d82804fd388afac8edd6d28661bf793a1))


### Fixed

* no imports to server from client ([#12599](https://github.com/ParabolInc/parabol/issues/12599)) ([56f628b](https://github.com/ParabolInc/parabol/commit/56f628bca30dba3ac82efdb3d4e636329683f4e8))

## [12.2.1](https://github.com/ParabolInc/parabol/compare/v12.2.0...v12.2.1) (2026-02-10)


### Changed

* Move GraphQL Objects to SDL Pattern ([#12534](https://github.com/ParabolInc/parabol/issues/12534)) ([d79ede6](https://github.com/ParabolInc/parabol/commit/d79ede6dcb2f62c6f829f9e31ab27f7ef1ee24ac))

## [12.2.0](https://github.com/ParabolInc/parabol/compare/v12.1.0...v12.2.0) (2026-02-10)


### Added

* **SCIM:** support soft deletion via active=false patch ([#12568](https://github.com/ParabolInc/parabol/issues/12568)) ([91a9623](https://github.com/ParabolInc/parabol/commit/91a9623caa9959d3339ccdd35a67fa77f3074a28))


### Changed

* Update labeler workflow ([#12583](https://github.com/ParabolInc/parabol/issues/12583)) ([9f7141a](https://github.com/ParabolInc/parabol/commit/9f7141a7ee0122540a7718f588b3a01561fe6195))

## [12.1.0](https://github.com/ParabolInc/parabol/compare/v12.0.2...v12.1.0) (2026-02-10)


### Added

* Add inline rename functionality to file blocks and adjust menu ([#12577](https://github.com/ParabolInc/parabol/issues/12577)) ([2c017b7](https://github.com/ParabolInc/parabol/commit/2c017b7ea66c43811f48d9b0818bd7757b47ee6e))


### Fixed

* don't throw an error in PG when cannot join a meeting twice ([#12580](https://github.com/ParabolInc/parabol/issues/12580)) ([62b0ec7](https://github.com/ParabolInc/parabol/commit/62b0ec777c7296342d4f3d4fccfd0baf3d06f769))
* improve missing user id logs ([#12578](https://github.com/ParabolInc/parabol/issues/12578)) ([4ae8940](https://github.com/ParabolInc/parabol/commit/4ae8940eb2485362ef1d22d79f03d58be8242123))

## [12.0.2](https://github.com/ParabolInc/parabol/compare/v12.0.1...v12.0.2) (2026-02-10)


### Fixed

* insert title in meeting summaries ([#12574](https://github.com/ParabolInc/parabol/issues/12574)) ([8febfb3](https://github.com/ParabolInc/parabol/commit/8febfb3fd6431853fb8b277e571990d7bdb91821))

## [12.0.1](https://github.com/ParabolInc/parabol/compare/v12.0.0...v12.0.1) (2026-02-06)


### Fixed

* support heap dumps via sigusr2 on embedder ([#12569](https://github.com/ParabolInc/parabol/issues/12569)) ([bc98a20](https://github.com/ParabolInc/parabol/commit/bc98a20e6cc27393af134073bcd9c36b92fa972f))
* use plaintext in snippets, fix chunking when heading has no content ([#12572](https://github.com/ParabolInc/parabol/issues/12572)) ([3fdf8ec](https://github.com/ParabolInc/parabol/commit/3fdf8ec535067957286ed1f6e516afbc46801568))

## [12.0.0](https://github.com/ParabolInc/parabol/compare/v11.13.0...v12.0.0) (2026-02-05)


### ⚠ BREAKING CHANGES

* **valkey:** Redis replaced with Valkey ([#12525](https://github.com/ParabolInc/parabol/issues/12525))

### Added

* Implement user and file upload limits ([#12563](https://github.com/ParabolInc/parabol/issues/12563)) ([59fb1c3](https://github.com/ParabolInc/parabol/commit/59fb1c30634838fbf3a52e8f870a60eed95389f3))
* proxy build files through /build path ([#12554](https://github.com/ParabolInc/parabol/issues/12554)) ([0bae1a1](https://github.com/ParabolInc/parabol/commit/0bae1a1d37b7ba7fcedc3f07c3bd299648d4626f))
* Search Pages frontend ([#12526](https://github.com/ParabolInc/parabol/issues/12526)) ([3b83fdb](https://github.com/ParabolInc/parabol/commit/3b83fdb56bd3c9bcf5aae86266cb35a1b6ff0ccd))
* **valkey:** Redis replaced with Valkey ([#12525](https://github.com/ParabolInc/parabol/issues/12525)) ([e0e18f8](https://github.com/ParabolInc/parabol/commit/e0e18f8aad621a79576c76f77754e2e74696320e))


### Changed

* **deps-dev:** bump webpack from 5.103.0 to 5.104.1 ([#12562](https://github.com/ParabolInc/parabol/issues/12562)) ([7fa0226](https://github.com/ParabolInc/parabol/commit/7fa0226d0ddbda85d6f922f37ba64631fd14cc14))

## Prior Major Version Changelogs

We try to keep this CHANGELOG limited to only the current major version.
For past major version revision history, please refer to one of the following
linked documents:

   - [v11.x.x](./docs/changelog/CHANGELOG-v11.md)
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
