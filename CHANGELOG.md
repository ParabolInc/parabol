# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [10.33.1](https://github.com/ParabolInc/parabol/compare/v10.33.0...v10.33.1) (2025-11-06)


### Fixed

* demo meeting avatars ([#12319](https://github.com/ParabolInc/parabol/issues/12319)) ([9e21aa8](https://github.com/ParabolInc/parabol/commit/9e21aa82724cdeffd96c4ac0b007b11b1f92a1dc))

## [10.33.0](https://github.com/ParabolInc/parabol/compare/v10.32.1...v10.33.0) (2025-11-06)


### Added

* page adoption ([#12304](https://github.com/ParabolInc/parabol/issues/12304)) ([0f27b34](https://github.com/ParabolInc/parabol/commit/0f27b34ad4d24f127d82a263a15070ea89e35bd1))


### Fixed

* remove newlines from story titles when creating table ([#12307](https://github.com/ParabolInc/parabol/issues/12307)) ([be9f263](https://github.com/ParabolInc/parabol/commit/be9f2635a22e5c39021c13ddd839c29574bc7293))
* sanitize querymap before persisting ([#12306](https://github.com/ParabolInc/parabol/issues/12306)) ([e4ae60f](https://github.com/ParabolInc/parabol/commit/e4ae60ffd18cb5f4e602aba499692abf5f8d2053))


### Changed

* send email summaries to whole team ([#12314](https://github.com/ParabolInc/parabol/issues/12314)) ([9cf389b](https://github.com/ParabolInc/parabol/commit/9cf389b88cbe57d2005eb4c5e384415a604ae4a4))

## [10.32.1](https://github.com/ParabolInc/parabol/compare/v10.32.0...v10.32.1) (2025-10-30)


### Fixed

* handle same-page moves (untested from/to details) ([#12267](https://github.com/ParabolInc/parabol/issues/12267)) ([a1ddeda](https://github.com/ParabolInc/parabol/commit/a1ddeda2c734985be406e7b3e5b14cbbe9a3f8da))

## [10.32.0](https://github.com/ParabolInc/parabol/compare/v10.31.0...v10.32.0) (2025-10-30)


### Added

* update Linear integration to use refresh tokens ([#12243](https://github.com/ParabolInc/parabol/issues/12243)) ([b266795](https://github.com/ParabolInc/parabol/commit/b266795d1dd49988706a449ea8d037d71de1d07a))

## [10.31.0](https://github.com/ParabolInc/parabol/compare/v10.30.0...v10.31.0) (2025-10-29)


### Added

* support MAIL_SMTP_URL ([#12296](https://github.com/ParabolInc/parabol/issues/12296)) ([2717f24](https://github.com/ParabolInc/parabol/commit/2717f24a4be9f8898a82f97496051343967725e4))

## [10.30.0](https://github.com/ParabolInc/parabol/compare/v10.29.1...v10.30.0) (2025-10-28)


### Added

* add h1, h2, h3, bullet slash shortcuts ([#12289](https://github.com/ParabolInc/parabol/issues/12289)) ([f45eb62](https://github.com/ParabolInc/parabol/commit/f45eb62b19cb8b9d5ff4a2312978e9076655b864))
* added Copy Link to Page's Share menu ([#12283](https://github.com/ParabolInc/parabol/issues/12283)) ([d1a6e88](https://github.com/ParabolInc/parabol/commit/d1a6e88cb0931c146ec3092dd580890df15d4648))
* float the PageHeader (base: feat/pages-copy-link) ([#12284](https://github.com/ParabolInc/parabol/issues/12284)) ([11feb39](https://github.com/ParabolInc/parabol/commit/11feb39b4368bd748a536794e4ce9c299f6279d9))


### Fixed

* memory leak on proxy sockets ([#12293](https://github.com/ParabolInc/parabol/issues/12293)) ([90c3593](https://github.com/ParabolInc/parabol/commit/90c3593679d0840325f83b26e3893475c41a3b0f))


### Changed

* remove Pages feature flag ([#12287](https://github.com/ParabolInc/parabol/issues/12287)) ([17e258c](https://github.com/ParabolInc/parabol/commit/17e258cb66d742e46c288063dd6449c810b3e45f))

## [10.29.1](https://github.com/ParabolInc/parabol/compare/v10.29.0...v10.29.1) (2025-10-24)


### Fixed

* onAuth retries ([#12280](https://github.com/ParabolInc/parabol/issues/12280)) ([1f52c92](https://github.com/ParabolInc/parabol/commit/1f52c92a5ba4fc2a87efe653fac92f04ba4c2933))

## [10.29.0](https://github.com/ParabolInc/parabol/compare/v10.28.5...v10.29.0) (2025-10-23)


### Added

* Adds refresh button to Sprint Poker ([#12239](https://github.com/ParabolInc/parabol/issues/12239)) ([4bb327f](https://github.com/ParabolInc/parabol/commit/4bb327ff57b9b4d129c120dfce5e0f98fcf10517))


### Fixed

* use ping/pong between origin and proxy sockets ([#12278](https://github.com/ParabolInc/parabol/issues/12278)) ([3d7d0a1](https://github.com/ParabolInc/parabol/commit/3d7d0a132c79ef5fa3bdb2e9d48b21776fcedfd5))

## [10.28.5](https://github.com/ParabolInc/parabol/compare/v10.28.4...v10.28.5) (2025-10-23)


### Fixed

* reduce pong from 30 to 15s ([#12274](https://github.com/ParabolInc/parabol/issues/12274)) ([de25d45](https://github.com/ParabolInc/parabol/commit/de25d4580b677b409da1f11ea13ee12f2ec6a6f6))

## [10.28.4](https://github.com/ParabolInc/parabol/compare/v10.28.3...v10.28.4) (2025-10-23)


### Fixed

* keep proxy sockets alive ([#12271](https://github.com/ParabolInc/parabol/issues/12271)) ([5d8f05d](https://github.com/ParabolInc/parabol/commit/5d8f05d54bed43a64b37ab73d480b071a8e2b401))

## [10.28.3](https://github.com/ParabolInc/parabol/compare/v10.28.2...v10.28.3) (2025-10-22)


### Fixed

* cache meeting teamId in redis for faster onAuth awareness ([#12265](https://github.com/ParabolInc/parabol/issues/12265)) ([e24d246](https://github.com/ParabolInc/parabol/commit/e24d246ca074bc76b19150a5430f05b492a20093))
* reduce connectSocket load on pg ([#12263](https://github.com/ParabolInc/parabol/issues/12263)) ([a1da972](https://github.com/ParabolInc/parabol/commit/a1da972af0e839cd53941ac961d007d494652fe7))

## [10.28.2](https://github.com/ParabolInc/parabol/compare/v10.28.1...v10.28.2) (2025-10-22)


### Fixed

* simplify onAuth query, delay provider unregister for 5s ([#12258](https://github.com/ParabolInc/parabol/issues/12258)) ([331885e](https://github.com/ParabolInc/parabol/commit/331885e8680cdc6905bfd3700cbfd926d88475dc))

## [10.28.1](https://github.com/ParabolInc/parabol/compare/v10.28.0...v10.28.1) (2025-10-21)


### Fixed

* include pnpm-lock.yaml in zip ([#12255](https://github.com/ParabolInc/parabol/issues/12255)) ([6e4278e](https://github.com/ParabolInc/parabol/commit/6e4278edd4196737738e497213a5955cb0cd893e))

## [10.28.0](https://github.com/ParabolInc/parabol/compare/v10.27.10...v10.28.0) (2025-10-21)


### Added

* add pnpm-lock to ironbank zip ([#12252](https://github.com/ParabolInc/parabol/issues/12252)) ([5afdad8](https://github.com/ParabolInc/parabol/commit/5afdad8e1291a8e3f25cb9e563888a0a17a26f06))

## [10.27.10](https://github.com/ParabolInc/parabol/compare/v10.27.9...v10.27.10) (2025-10-21)


### Fixed

* prevent fatal crashes on html_inline markdown parsing ([#12249](https://github.com/ParabolInc/parabol/issues/12249)) ([2af4437](https://github.com/ParabolInc/parabol/commit/2af44370c27c7b7e37df2e38675bb80591595685))

## [10.27.9](https://github.com/ParabolInc/parabol/compare/v10.27.8...v10.27.9) (2025-10-21)


### Fixed

* onDisconnect without teams ([#12246](https://github.com/ParabolInc/parabol/issues/12246)) ([7777d8c](https://github.com/ParabolInc/parabol/commit/7777d8ca09944649c37614afe9789440c74deb18))

## [10.27.8](https://github.com/ParabolInc/parabol/compare/v10.27.7...v10.27.8) (2025-10-21)


### Fixed

* use internal closed flag + try/catch for cleaned up ws ([#12241](https://github.com/ParabolInc/parabol/issues/12241)) ([67b2db8](https://github.com/ParabolInc/parabol/commit/67b2db841cb3d621a9b4373c317aaba9630c5aa4))

## [10.27.7](https://github.com/ParabolInc/parabol/compare/v10.27.6...v10.27.7) (2025-10-20)


### Fixed

* awareness auth: closing uWS sockets only once ([#12236](https://github.com/ParabolInc/parabol/issues/12236)) ([facae4b](https://github.com/ParabolInc/parabol/commit/facae4bd2854b5368118829fad0c0efffbb06d9e))

## [10.27.6](https://github.com/ParabolInc/parabol/compare/v10.27.5...v10.27.6) (2025-10-17)


### Fixed

* connectedMeetingMembers retry until value pushed to MeetingMember ([#12230](https://github.com/ParabolInc/parabol/issues/12230)) ([1d3ee8d](https://github.com/ParabolInc/parabol/commit/1d3ee8dcbd984ad64c83fdea4021eff671b9dcb3))
* vuln in happy-dom ([#12232](https://github.com/ParabolInc/parabol/issues/12232)) ([e8f2565](https://github.com/ParabolInc/parabol/commit/e8f2565bf3639c0a65b361b8e73b904dbd5d46d4))

## [10.27.5](https://github.com/ParabolInc/parabol/compare/v10.27.4...v10.27.5) (2025-10-17)


### Fixed

* add TTL to awareness ([#12221](https://github.com/ParabolInc/parabol/issues/12221)) ([38654b2](https://github.com/ParabolInc/parabol/commit/38654b2b6a2d9709da3b0bd04e32c26c4a3f435b))

## [10.27.4](https://github.com/ParabolInc/parabol/compare/v10.27.3...v10.27.4) (2025-10-15)


### Fixed

* crash when @-mentioning in reflections ([#12217](https://github.com/ParabolInc/parabol/issues/12217)) ([20e74e7](https://github.com/ParabolInc/parabol/commit/20e74e78d5fa5d73c0b11f26006e207accd8aae1))


### Changed

* update page shared invite email ([#12210](https://github.com/ParabolInc/parabol/issues/12210)) ([e6ec992](https://github.com/ParabolInc/parabol/commit/e6ec9928f05b36ffe1682f2c6a63569bd179830d))

## [10.27.3](https://github.com/ParabolInc/parabol/compare/v10.27.2...v10.27.3) (2025-10-14)


### Fixed

* bump happy-dom to v20 ([#12212](https://github.com/ParabolInc/parabol/issues/12212)) ([4f4931d](https://github.com/ParabolInc/parabol/commit/4f4931d3a16d98545815b455336a936226227dd4))
* redirect to meeting summary page instead of /new-summary ([#12203](https://github.com/ParabolInc/parabol/issues/12203)) ([297463d](https://github.com/ParabolInc/parabol/commit/297463df352b22b7db73e0863142b275299fc13e))

## [10.27.2](https://github.com/ParabolInc/parabol/compare/v10.27.1...v10.27.2) (2025-10-14)


### Fixed

* toReversed is not a function ([#12204](https://github.com/ParabolInc/parabol/issues/12204)) ([683ee28](https://github.com/ParabolInc/parabol/commit/683ee2851552abc3093aeda90ff47a8c30f8b7f9))


### Changed

* reduced page invite email for new users ([#12207](https://github.com/ParabolInc/parabol/issues/12207)) ([d800cc9](https://github.com/ParabolInc/parabol/commit/d800cc92947c7651c7bbb08b16a08780ae0b6a52))

## [10.27.1](https://github.com/ParabolInc/parabol/compare/v10.27.0...v10.27.1) (2025-10-10)


### Changed

* remove HOCUS_POCUS_PORT environment variable ([#12196](https://github.com/ParabolInc/parabol/issues/12196)) ([9c2fa6e](https://github.com/ParabolInc/parabol/commit/9c2fa6e140f5870871d8d8ad5362652da3d22c62))

## [10.27.0](https://github.com/ParabolInc/parabol/compare/v10.26.10...v10.27.0) (2025-10-09)


### Added

* Page affinity ([#12154](https://github.com/ParabolInc/parabol/issues/12154)) ([cee495d](https://github.com/ParabolInc/parabol/commit/cee495d85fea147a97da18c693b3cf7c504d77c9))


### Fixed

* use You when addressing the viewer ([#12189](https://github.com/ParabolInc/parabol/issues/12189)) ([19b00b2](https://github.com/ParabolInc/parabol/commit/19b00b2cdf7f23b57505fc0ea52860f5917b478f))

## [10.26.10](https://github.com/ParabolInc/parabol/compare/v10.26.9...v10.26.10) (2025-10-09)


### Fixed

* collapsing left nav when navigating to/from page route ([#12185](https://github.com/ParabolInc/parabol/issues/12185)) ([1d07450](https://github.com/ParabolInc/parabol/commit/1d074501cbde1a765f7c19643874cafd17afc1da))
* delete pages from left side bar ([#12181](https://github.com/ParabolInc/parabol/issues/12181)) ([3a55e16](https://github.com/ParabolInc/parabol/commit/3a55e16bb985ef3011bba6d9382a8e58f505722f))
* increase rate limit fior addTeam ([#12186](https://github.com/ParabolInc/parabol/issues/12186)) ([373ee43](https://github.com/ParabolInc/parabol/commit/373ee431cbfbbcb0ebc7687c54997241907b1aba))
* limit page invites ([#12183](https://github.com/ParabolInc/parabol/issues/12183)) ([3f42f5e](https://github.com/ParabolInc/parabol/commit/3f42f5ec1cc149b7df280ae83af6f49de579f7e4))
* Service Worker context closed ([#12179](https://github.com/ParabolInc/parabol/issues/12179)) ([6f6cf96](https://github.com/ParabolInc/parabol/commit/6f6cf96afce89ea5688b3cdaa3d442e0c343d3a4))
* user of undefined errors ([#12184](https://github.com/ParabolInc/parabol/issues/12184)) ([45ae8f7](https://github.com/ParabolInc/parabol/commit/45ae8f72a1f84cf8d105c889e1313a4b8eb926a3))

## [10.26.9](https://github.com/ParabolInc/parabol/compare/v10.26.8...v10.26.9) (2025-10-09)


### Fixed

* infer app location from meeting subscription ([#12169](https://github.com/ParabolInc/parabol/issues/12169)) ([23dbdcb](https://github.com/ParabolInc/parabol/commit/23dbdcbe7834d3ced7bd48c857c2bf7e4b9c0ca3))


### Changed

* require email verification for password signup ([#12176](https://github.com/ParabolInc/parabol/issues/12176)) ([42f28fe](https://github.com/ParabolInc/parabol/commit/42f28fecaa97267db2a95ebe0f5fdcf83d1710e8))

## [10.26.8](https://github.com/ParabolInc/parabol/compare/v10.26.7...v10.26.8) (2025-10-09)


### Fixed

* maintain original order from jira API ([#12172](https://github.com/ParabolInc/parabol/issues/12172)) ([f60a954](https://github.com/ParabolInc/parabol/commit/f60a954814642dc4d20a44b090c9a329f8f80bcb))

## [10.26.7](https://github.com/ParabolInc/parabol/compare/v10.26.6...v10.26.7) (2025-10-08)


### Fixed

* nodemailer version ([#12170](https://github.com/ParabolInc/parabol/issues/12170)) ([9841083](https://github.com/ParabolInc/parabol/commit/9841083027ff01d68d8bc1184fe3460135be76bd))
* properly unsubscribe from subscriptions ([#12168](https://github.com/ParabolInc/parabol/issues/12168)) ([332801d](https://github.com/ParabolInc/parabol/commit/332801def0e9d23d2ff17683aecd6af6512d2b01))
* reload page to work around Service Worker context closed ([#12164](https://github.com/ParabolInc/parabol/issues/12164)) ([6921c87](https://github.com/ParabolInc/parabol/commit/6921c87cf8b33f8968fb3093318eb082dbfc3792))


### Changed

* insights block style tweaks ([#12165](https://github.com/ParabolInc/parabol/issues/12165)) ([372190b](https://github.com/ParabolInc/parabol/commit/372190b45cc59f342caecb5959959865226e7022))

## [10.26.6](https://github.com/ParabolInc/parabol/compare/v10.26.5...v10.26.6) (2025-10-07)


### Fixed

* allow meeting queries with 0 own teams ([#12160](https://github.com/ParabolInc/parabol/issues/12160)) ([4a5ff96](https://github.com/ParabolInc/parabol/commit/4a5ff96b4321dfc279d6fbeaf9fbeffdaa43d2da))

## [10.26.5](https://github.com/ParabolInc/parabol/compare/v10.26.4...v10.26.5) (2025-10-04)


### Fixed

* handle no variableVariables coming from graphiql admin queries ([#12155](https://github.com/ParabolInc/parabol/issues/12155)) ([43cc66a](https://github.com/ParabolInc/parabol/commit/43cc66a79b165ffad523d020fbba510a35b42387))

## [10.26.4](https://github.com/ParabolInc/parabol/compare/v10.26.3...v10.26.4) (2025-10-02)


### Fixed

* **gh-action:** ironbank action checks code out as first step ([#12147](https://github.com/ParabolInc/parabol/issues/12147)) ([bef2c52](https://github.com/ParabolInc/parabol/commit/bef2c52a033117f88a3df8c148550d747ab0b8a2))

## [10.26.3](https://github.com/ParabolInc/parabol/compare/v10.26.2...v10.26.3) (2025-10-02)


### Changed

* **gh-actions:** docker-external and ironbank run only with tags, are improved to run faster and show useful information at the end ([#12145](https://github.com/ParabolInc/parabol/issues/12145)) ([4fab3d0](https://github.com/ParabolInc/parabol/commit/4fab3d07b21f17917185f35f18c3e3a0dcb0cb98))
* proxy websockets in local dev ([#12142](https://github.com/ParabolInc/parabol/issues/12142)) ([a7278c5](https://github.com/ParabolInc/parabol/commit/a7278c5d803207669cf78439eb5c7b20588b9ca8))

## [10.26.2](https://github.com/ParabolInc/parabol/compare/v10.26.1...v10.26.2) (2025-09-30)


### Fixed

* improve rate limit logs ([#12138](https://github.com/ParabolInc/parabol/issues/12138)) ([b4f7b57](https://github.com/ParabolInc/parabol/commit/b4f7b57bd49ccb7f3afff6f0b121c76df33519e9))
* regression on unauthenticated access to public pages ([#12140](https://github.com/ParabolInc/parabol/issues/12140)) ([864d656](https://github.com/ParabolInc/parabol/commit/864d656a02fd67e03b473d17f298c2c9cbac50e4))

## [10.26.1](https://github.com/ParabolInc/parabol/compare/v10.26.0...v10.26.1) (2025-09-29)


### Fixed

* only call on meetingId change setAppLocation ([#12130](https://github.com/ParabolInc/parabol/issues/12130)) ([7f5ef59](https://github.com/ParabolInc/parabol/commit/7f5ef59c09ea91e43268b1531f89f0d62e31b36b))

## [10.26.0](https://github.com/ParabolInc/parabol/compare/v10.25.4...v10.26.0) (2025-09-29)


### Added

* Offline Support for Pages (plus fix enforced page titles, selectable task content) ([#12127](https://github.com/ParabolInc/parabol/issues/12127)) ([218b428](https://github.com/ParabolInc/parabol/commit/218b4281bd829b516ed48679fb0f73d3e2ff8cd9))

## [10.25.4](https://github.com/ParabolInc/parabol/compare/v10.25.3...v10.25.4) (2025-09-29)


### Fixed

* always reset style after remote drag ([#12122](https://github.com/ParabolInc/parabol/issues/12122)) ([a455889](https://github.com/ParabolInc/parabol/commit/a45588968198c0f0aadf378b7dddf98000f8d6b1))
* do not log failed permission checks ([#12124](https://github.com/ParabolInc/parabol/issues/12124)) ([16842d8](https://github.com/ParabolInc/parabol/commit/16842d8d6c82615e981da50a6365d026619d46d9))


### Changed

* reduce number of error logs ([7631d16](https://github.com/ParabolInc/parabol/commit/7631d163de9b28096a7c12ec1a23820cfa6f6061))

## [10.25.3](https://github.com/ParabolInc/parabol/compare/v10.25.2...v10.25.3) (2025-09-27)


### Fixed

* center music icon, truncate fields before inserting into DB ([#12116](https://github.com/ParabolInc/parabol/issues/12116)) ([d7286ae](https://github.com/ParabolInc/parabol/commit/d7286ae768c4a9c42e162bf72863353ff22616d1))
* exclude binary fields from audit logs ([#12119](https://github.com/ParabolInc/parabol/issues/12119)) ([0c33f83](https://github.com/ParabolInc/parabol/commit/0c33f8344888ea09cf3ee9ae3f25db097c0e9bfd))
* logout user if they have an expired token ([#12120](https://github.com/ParabolInc/parabol/issues/12120)) ([8abdc71](https://github.com/ParabolInc/parabol/commit/8abdc715be51e19bfbb266ae3c633204b846eeeb))
* name chronos jobs ([#12111](https://github.com/ParabolInc/parabol/issues/12111)) ([5bc5327](https://github.com/ParabolInc/parabol/commit/5bc5327eeb40cdea29eada9244be90657890c02c))

## [10.25.2](https://github.com/ParabolInc/parabol/compare/v10.25.1...v10.25.2) (2025-09-25)


### Fixed

* add insights for editors only ([#12105](https://github.com/ParabolInc/parabol/issues/12105)) ([6c7b2e1](https://github.com/ParabolInc/parabol/commit/6c7b2e1da1f72468e14cd1f8d16de97ab142d16e))
* stop calling redis subscribe with 0 args ([#12104](https://github.com/ParabolInc/parabol/issues/12104)) ([b317ad4](https://github.com/ParabolInc/parabol/commit/b317ad4468d4a72148bccf45ebb2439a9411e832))

## [10.25.1](https://github.com/ParabolInc/parabol/compare/v10.25.0...v10.25.1) (2025-09-24)


### Fixed

* do not crash on hocus pocus store failures ([#12094](https://github.com/ParabolInc/parabol/issues/12094)) ([92b9106](https://github.com/ParabolInc/parabol/commit/92b9106c9a3dfaf4fd0b08e2127c8ab3d1ec3f73))
* mark jira integrations as inactive if we cannot refresh them ([#12096](https://github.com/ParabolInc/parabol/issues/12096)) ([ae94fc1](https://github.com/ParabolInc/parabol/commit/ae94fc16e2484c13f8f59c80c2100737f6b9a5bf))
* sql query column ordering ([#12097](https://github.com/ParabolInc/parabol/issues/12097)) ([aefd648](https://github.com/ParabolInc/parabol/commit/aefd6486bc6d17a903414a857a0a3b845733c4fc))
* users can accept mass invites from org admins not on the team ([#12091](https://github.com/ParabolInc/parabol/issues/12091)) ([7d4a183](https://github.com/ParabolInc/parabol/commit/7d4a183cd59d2e1d46a62f5c9f39db8265601c19))
* valid Team.agendaItems for addTeam and addOrg ([#12095](https://github.com/ParabolInc/parabol/issues/12095)) ([f000e3f](https://github.com/ParabolInc/parabol/commit/f000e3f1bdf95e5812706c5ee1fa7c43b7f1409d))


### Changed

* only deactivate atlassian integration if token was invalid ([#12098](https://github.com/ParabolInc/parabol/issues/12098)) ([bc99f7b](https://github.com/ParabolInc/parabol/commit/bc99f7b24502c713839e462ab64e06871f0f39cb))

## [10.25.0](https://github.com/ParabolInc/parabol/compare/v10.24.1...v10.25.0) (2025-09-23)


### Added

* Pages to GA ([#12088](https://github.com/ParabolInc/parabol/issues/12088)) ([2fd0893](https://github.com/ParabolInc/parabol/commit/2fd08938549aba2ce605f0d4f6c62d518baf60f2))

## [10.24.1](https://github.com/ParabolInc/parabol/compare/v10.24.0...v10.24.1) (2025-09-22)


### Fixed

* prevent canonical page link duplicates ([#12083](https://github.com/ParabolInc/parabol/issues/12083)) ([35f924f](https://github.com/ParabolInc/parabol/commit/35f924f2a98ee6e721e14d1ab27ddc43f06f8e74))
* summaryMeetingId on the Page table ([#12086](https://github.com/ParabolInc/parabol/issues/12086)) ([34c663a](https://github.com/ParabolInc/parabol/commit/34c663a2c6c02207373dfa13de4297abf89be997))


### Changed

* more Safari SW debugging ([#12078](https://github.com/ParabolInc/parabol/issues/12078)) ([c1a845a](https://github.com/ParabolInc/parabol/commit/c1a845a00fd46d7f72f0388698fdfe75943d73aa))
* single line audit logs ([#12081](https://github.com/ParabolInc/parabol/issues/12081)) ([f4aac12](https://github.com/ParabolInc/parabol/commit/f4aac126e69a7c4462293c3fd217a7457cb32282))

## [10.24.0](https://github.com/ParabolInc/parabol/compare/v10.23.9...v10.24.0) (2025-09-22)


### Added

* add audit logs ([#12048](https://github.com/ParabolInc/parabol/issues/12048)) ([ec839f8](https://github.com/ParabolInc/parabol/commit/ec839f85bcddc8917084dd2266c1be8db39e999c))


### Fixed

* add error handling on initial script load ([#12073](https://github.com/ParabolInc/parabol/issues/12073)) ([3c3e090](https://github.com/ParabolInc/parabol/commit/3c3e090361df53561856b68a4920fb08804c07a1))
* user sort order for shared pages ([#12075](https://github.com/ParabolInc/parabol/issues/12075)) ([1f6b890](https://github.com/ParabolInc/parabol/commit/1f6b890991893df9932aa1f5265c525a8b39f636))


### Changed

* disable static file handle if not needed ([#12034](https://github.com/ParabolInc/parabol/issues/12034)) ([5e355f3](https://github.com/ParabolInc/parabol/commit/5e355f32d0fce26bf04cdfeeb88c09233ee2e47e))

## [10.23.9](https://github.com/ParabolInc/parabol/compare/v10.23.8...v10.23.9) (2025-09-18)


### Fixed

* dispose dataloaders on socket disconnect ([#12070](https://github.com/ParabolInc/parabol/issues/12070)) ([e3f4750](https://github.com/ParabolInc/parabol/commit/e3f475084e2f067ded6db2b4dc7eeeb1b09dd8ed))

## [10.23.8](https://github.com/ParabolInc/parabol/compare/v10.23.7...v10.23.8) (2025-09-17)


### Fixed

* dont download packages newer than 2 days old by default ([#12063](https://github.com/ParabolInc/parabol/issues/12063)) ([64aad45](https://github.com/ParabolInc/parabol/commit/64aad45b7a791d897021dbadbb03eb1a726078a8))


### Changed

* add dataloader cache debugging field ([#12068](https://github.com/ParabolInc/parabol/issues/12068)) ([7b78fc2](https://github.com/ParabolInc/parabol/commit/7b78fc231d93d43f48b1bc9b3737b740a3ae9299))
* do not run dev with inspect by default ([#12067](https://github.com/ParabolInc/parabol/issues/12067)) ([485b0c7](https://github.com/ParabolInc/parabol/commit/485b0c724df59babb49ca7e277ab6c7cb8b2f039))

## [10.23.7](https://github.com/ParabolInc/parabol/compare/v10.23.6...v10.23.7) (2025-09-16)


### Fixed

* add user-agent to fetch calls ([#12060](https://github.com/ParabolInc/parabol/issues/12060)) ([4c67372](https://github.com/ParabolInc/parabol/commit/4c67372b37b59994b7dd51d395b18dac1afe578e))


### Changed

* simplify logging tags ([#12057](https://github.com/ParabolInc/parabol/issues/12057)) ([2b6c1cb](https://github.com/ParabolInc/parabol/commit/2b6c1cb95b455f5cfd9a41b6afe43204072e5c55))

## [10.23.6](https://github.com/ParabolInc/parabol/compare/v10.23.5...v10.23.6) (2025-09-16)


### Fixed

* monkeypatch fetch with whatwg-node/fetch ([#12046](https://github.com/ParabolInc/parabol/issues/12046)) ([8db31aa](https://github.com/ParabolInc/parabol/commit/8db31aabf21270be3587cdab8c23a666ea76267f))


### Changed

* bump @module-federation/enhanced ([#12052](https://github.com/ParabolInc/parabol/issues/12052)) ([a312057](https://github.com/ParabolInc/parabol/commit/a31205726059f58ab9a5783ebafa4cfd7a43f5a6))
* **docker:** upgrade from Debian Bookworm to Trixie ([#12049](https://github.com/ParabolInc/parabol/issues/12049)) ([c9e2690](https://github.com/ParabolInc/parabol/commit/c9e2690160475f60dd2ff374a621d5d2734d1337))
* improve log format for Datadog ingestion ([#12051](https://github.com/ParabolInc/parabol/issues/12051)) ([c8b0a08](https://github.com/ParabolInc/parabol/commit/c8b0a08a08037ac892afd5344b50b3b600527c78))
* overwrite brace-expansion version ([#12054](https://github.com/ParabolInc/parabol/issues/12054)) ([37ab2b5](https://github.com/ParabolInc/parabol/commit/37ab2b59295dab2ccbfb9c7bf6083e7f58f43dce))
* overwrite brace-expansion version ([#12055](https://github.com/ParabolInc/parabol/issues/12055)) ([e258857](https://github.com/ParabolInc/parabol/commit/e258857cd0906b8f661137dd64bca63cd2d57043))
* resolve @babel/runtime to a single version ([#12053](https://github.com/ParabolInc/parabol/issues/12053)) ([09612c9](https://github.com/ParabolInc/parabol/commit/09612c9cad2eda60152d8707bc4ee6871af3dbf8))

## [10.23.5](https://github.com/ParabolInc/parabol/compare/v10.23.4...v10.23.5) (2025-09-15)


### Fixed

* don't throw in ratelimit if return type has error ([#12044](https://github.com/ParabolInc/parabol/issues/12044)) ([0168b98](https://github.com/ParabolInc/parabol/commit/0168b98771b9f3d3908c83620d730ba4453c2075))
* when restoring child without parent, remove parent from ancestorIds ([#12045](https://github.com/ParabolInc/parabol/issues/12045)) ([259b7eb](https://github.com/ParabolInc/parabol/commit/259b7eb817d6f946deb4699269275bf92d9929dc))


### Changed

* pnpm dev debug settings ([#12031](https://github.com/ParabolInc/parabol/issues/12031)) ([a3673e2](https://github.com/ParabolInc/parabol/commit/a3673e2f98d332cbb63d6ec18c7174e890705b5e))

## [10.23.4](https://github.com/ParabolInc/parabol/compare/v10.23.3...v10.23.4) (2025-09-15)


### Fixed

* ditch cheerio and undici ([#12040](https://github.com/ParabolInc/parabol/issues/12040)) ([e2e3bae](https://github.com/ParabolInc/parabol/commit/e2e3bae9a69e7b4807657c7908f7e966203bae10))
* use watwg-node/fetch for everything on server ([#12036](https://github.com/ParabolInc/parabol/issues/12036)) ([7d0ead7](https://github.com/ParabolInc/parabol/commit/7d0ead7bf05f6e807e7763ab8fb7ec122c12affd))

## [10.23.3](https://github.com/ParabolInc/parabol/compare/v10.23.2...v10.23.3) (2025-09-12)


### Fixed

* Allow deleting deleted tasks from Poker scope ([#12030](https://github.com/ParabolInc/parabol/issues/12030)) ([e897ba3](https://github.com/ParabolInc/parabol/commit/e897ba3dae2b1edf2b02023bfaa6372bc22a2f60))
* always fall back to fetch on Service Worker onFetch ([#12029](https://github.com/ParabolInc/parabol/issues/12029)) ([4cdb794](https://github.com/ParabolInc/parabol/commit/4cdb794c244c7831fbd197cebd881658789fc74b))
* invalid parent page access on child page creation ([#12035](https://github.com/ParabolInc/parabol/issues/12035)) ([2910e05](https://github.com/ParabolInc/parabol/commit/2910e0553fdcc84320ea9e90565d095470c45224))
* link menu in reflection groups ([#12033](https://github.com/ParabolInc/parabol/issues/12033)) ([b7f9b82](https://github.com/ParabolInc/parabol/commit/b7f9b82bdd907b95181c6e04aa3fa7c162e60f58))


### Changed

* **deps:** bump axios from 1.11.0 to 1.12.0 ([#12024](https://github.com/ParabolInc/parabol/issues/12024)) ([cb15334](https://github.com/ParabolInc/parabol/commit/cb15334b70fe81ef8538d1bbdee2a1f5e7145ab4))
* **nodejs:** upgrade to 22.19.0 ([#12028](https://github.com/ParabolInc/parabol/issues/12028)) ([4330c11](https://github.com/ParabolInc/parabol/commit/4330c1133f051f100fcf192d962cae1c068a92d6))
* remove all references to Sentry ([#12026](https://github.com/ParabolInc/parabol/issues/12026)) ([9e56c20](https://github.com/ParabolInc/parabol/commit/9e56c20f8535f433d7fae10b7d08494816bd2ab4))

## [10.23.2](https://github.com/ParabolInc/parabol/compare/v10.23.1...v10.23.2) (2025-09-11)


### Fixed

* attempt to cleanup dataloaders ([#12023](https://github.com/ParabolInc/parabol/issues/12023)) ([f08fb95](https://github.com/ParabolInc/parabol/commit/f08fb954360718584d37b8bb98bd6f58d7b3b86f))
* catch OpenAI exceptions ([#12012](https://github.com/ParabolInc/parabol/issues/12012)) ([d49d9c7](https://github.com/ParabolInc/parabol/commit/d49d9c72740046fd44ea97f32f68f684bce5c9b7))
* fix User.tms trigger on Team updates ([#12020](https://github.com/ParabolInc/parabol/issues/12020)) ([2ba0af7](https://github.com/ParabolInc/parabol/commit/2ba0af7336c68084eab570b15ea0a79920f0fcdb))

## [10.23.1](https://github.com/ParabolInc/parabol/compare/v10.23.0...v10.23.1) (2025-09-10)


### Fixed

* support server usage ([#12016](https://github.com/ParabolInc/parabol/issues/12016)) ([c6ce84b](https://github.com/ParabolInc/parabol/commit/c6ce84bcefe383de838a0966bba98e673b325a6a))

## [10.23.0](https://github.com/ParabolInc/parabol/compare/v10.22.1...v10.23.0) (2025-09-10)


### Added

* send page invites to externals via email ([#11973](https://github.com/ParabolInc/parabol/issues/11973)) ([ec7a91b](https://github.com/ParabolInc/parabol/commit/ec7a91be6ac42e6b8644f2d405f74fb324748864))
* send page shared email to users ([#12009](https://github.com/ParabolInc/parabol/issues/12009)) ([5977926](https://github.com/ParabolInc/parabol/commit/59779269e9920bc9bba663aaa7b19ef86ec81553))


### Fixed

* cleanup happy-dom with custom generateHTML ([#12014](https://github.com/ParabolInc/parabol/issues/12014)) ([a0c76fa](https://github.com/ParabolInc/parabol/commit/a0c76faecec7d247dbc4060f256a02686a3d04eb))
* CSS wrap domains in SAML ([#12006](https://github.com/ParabolInc/parabol/issues/12006)) ([f860384](https://github.com/ParabolInc/parabol/commit/f860384e7c55cdbf19603e4bf3ff374750b63f75))
* enable Update button correctly in PromptResponseEditor after cle… ([#11972](https://github.com/ParabolInc/parabol/issues/11972)) ([18e09c4](https://github.com/ParabolInc/parabol/commit/18e09c43338d52b2dca7a89c55bbb377f2cddbd3))
* give new users access to shared pages ([#12007](https://github.com/ParabolInc/parabol/issues/12007)) ([dd7cc57](https://github.com/ParabolInc/parabol/commit/dd7cc57a4f3df8e449c7c86c15025c6d0b7bb13a))


### Changed

* add tests for public/restricted pages ([#12008](https://github.com/ParabolInc/parabol/issues/12008)) ([cdb891d](https://github.com/ParabolInc/parabol/commit/cdb891dfb97f82ccd54e33eb3bda150713da19ec))
* update mattermost redux package ([#12010](https://github.com/ParabolInc/parabol/issues/12010)) ([e2b8dee](https://github.com/ParabolInc/parabol/commit/e2b8dee8a00ac69cd4e46212ac1f4b86a256fb24))

## [10.22.1](https://github.com/ParabolInc/parabol/compare/v10.22.0...v10.22.1) (2025-09-05)


### Changed

* **heap-dump:** allow customizing the folder where the heap dumps are stored ([#11995](https://github.com/ParabolInc/parabol/issues/11995)) ([5aa4df8](https://github.com/ParabolInc/parabol/commit/5aa4df8cd71768183c673a0709d5a853e96a88dd))

## [10.22.0](https://github.com/ParabolInc/parabol/compare/v10.21.4...v10.22.0) (2025-09-04)


### Added

* send in app notifications when a page is shared with a user ([#11991](https://github.com/ParabolInc/parabol/issues/11991)) ([b36b374](https://github.com/ParabolInc/parabol/commit/b36b3742f3c05500a35fed814d58822b747a050f))


### Fixed

* no dependabot updates ([#11988](https://github.com/ParabolInc/parabol/issues/11988)) ([68a5a1a](https://github.com/ParabolInc/parabol/commit/68a5a1a01a649d7722936be6ac44875ef791a9fa))
* undo del snackbar ([#11996](https://github.com/ParabolInc/parabol/issues/11996)) ([83d1a80](https://github.com/ParabolInc/parabol/commit/83d1a80c60b174900fb1799168eccab8d64416dd))

## [10.21.4](https://github.com/ParabolInc/parabol/compare/v10.21.3...v10.21.4) (2025-09-03)


### Fixed

* version match relay to latest ([#11986](https://github.com/ParabolInc/parabol/issues/11986)) ([bcf20f0](https://github.com/ParabolInc/parabol/commit/bcf20f025a6ad31c736e77b8763276abedb2a943))


### Changed

* really reduce server health checker ([#11984](https://github.com/ParabolInc/parabol/issues/11984)) ([f47b3fa](https://github.com/ParabolInc/parabol/commit/f47b3fa73c2134cf48ab4f9b0e3812e7558d92bf))

## [10.21.3](https://github.com/ParabolInc/parabol/compare/v10.21.2...v10.21.3) (2025-09-03)


### Fixed

* handle publish to public pages correctly ([#11981](https://github.com/ParabolInc/parabol/issues/11981)) ([80b071a](https://github.com/ParabolInc/parabol/commit/80b071a4611dff9ab9868194cdf0659cf6f9eba2))


### Changed

* reduce logs from server health checker ([#11980](https://github.com/ParabolInc/parabol/issues/11980)) ([1b8ba66](https://github.com/ParabolInc/parabol/commit/1b8ba66ce918af782e58b929e9124b5ddf1d74ed))

## [10.21.2](https://github.com/ParabolInc/parabol/compare/v10.21.1...v10.21.2) (2025-09-03)


### Fixed

* distinct orgs for pages feature flag migration ([#11976](https://github.com/ParabolInc/parabol/issues/11976)) ([f5f66eb](https://github.com/ParabolInc/parabol/commit/f5f66ebb89bac078f8e6abb0db3d5caf7a7ce21a))

## [10.21.1](https://github.com/ParabolInc/parabol/compare/v10.21.0...v10.21.1) (2025-09-03)


### Changed

* add tags to dd-traces for hocusPocus ([#11967](https://github.com/ParabolInc/parabol/issues/11967)) ([5632876](https://github.com/ParabolInc/parabol/commit/5632876e6d7134782012a80e5f26d8165d30e34b))
* make Pages an organization feature flag ([#11971](https://github.com/ParabolInc/parabol/issues/11971)) ([06ff397](https://github.com/ParabolInc/parabol/commit/06ff397c666ae1f13e6532522576624859de234b))
* speed up teamsWithUserSort query ([#11974](https://github.com/ParabolInc/parabol/issues/11974)) ([04d8721](https://github.com/ParabolInc/parabol/commit/04d872106d8a4a4834144d13440bd6c937d9cef5))

## [10.21.0](https://github.com/ParabolInc/parabol/compare/v10.20.10...v10.21.0) (2025-08-29)


### Added

* add starter actions for adding insights ([#11947](https://github.com/ParabolInc/parabol/issues/11947)) ([5a63249](https://github.com/ParabolInc/parabol/commit/5a6324931103362226a6405111643e6b505e4fbc))


### Fixed

* add email to no access modal ([#11950](https://github.com/ParabolInc/parabol/issues/11950)) ([68b93a4](https://github.com/ParabolInc/parabol/commit/68b93a4d3e7c6c641f80cfad4aa05462d5762d03))
* increase redlock retries ([#11935](https://github.com/ParabolInc/parabol/issues/11935)) ([055fdc3](https://github.com/ParabolInc/parabol/commit/055fdc33b316b2ab19c83c2f39bcb2428812d710))
* shared pages include pages where teamId is null ([#11951](https://github.com/ParabolInc/parabol/issues/11951)) ([0288107](https://github.com/ParabolInc/parabol/commit/028810717171ce607c531bd72efb13e4dad0e2e2))
* todo list styles in pages ([#11949](https://github.com/ParabolInc/parabol/issues/11949)) ([7ea02ef](https://github.com/ParabolInc/parabol/commit/7ea02ef06e405ff159296be330df226459f862df))

## [10.20.10](https://github.com/ParabolInc/parabol/compare/v10.20.9...v10.20.10) (2025-08-29)


### Changed

* add more hocus pocus tracing ([#11943](https://github.com/ParabolInc/parabol/issues/11943)) ([7c829a8](https://github.com/ParabolInc/parabol/commit/7c829a8f45d31ba4c1440dca80a13865dc81e0d6))

## [10.20.9](https://github.com/ParabolInc/parabol/compare/v10.20.8...v10.20.9) (2025-08-29)


### Changed

* reduce error logs when onStoreDocument fails ([#11940](https://github.com/ParabolInc/parabol/issues/11940)) ([a206fa4](https://github.com/ParabolInc/parabol/commit/a206fa49f66132bc4ed1593af0c86b24ffb616ed))

## [10.20.8](https://github.com/ParabolInc/parabol/compare/v10.20.7...v10.20.8) (2025-08-29)


### Fixed

* do not crash when failing to acquire page store lock ([#11937](https://github.com/ParabolInc/parabol/issues/11937)) ([9a7290b](https://github.com/ParabolInc/parabol/commit/9a7290b02bfa690dbc1f3067e09860f18229d1ed))

## [10.20.7](https://github.com/ParabolInc/parabol/compare/v10.20.6...v10.20.7) (2025-08-29)


### Fixed

* left nav max length overflow ([#11931](https://github.com/ParabolInc/parabol/issues/11931)) ([407b68f](https://github.com/ParabolInc/parabol/commit/407b68f0655d34c22cec876bfd05fc89f3f59047))


### Changed

* measure hocusPocus store document ([#11932](https://github.com/ParabolInc/parabol/issues/11932)) ([4f5e553](https://github.com/ParabolInc/parabol/commit/4f5e553c0487ae6bacdf59e96656b6b43a479e7b))

## [10.20.6](https://github.com/ParabolInc/parabol/compare/v10.20.5...v10.20.6) (2025-08-28)


### Fixed

* bump tiptap ([#11927](https://github.com/ParabolInc/parabol/issues/11927)) ([32015da](https://github.com/ParabolInc/parabol/commit/32015dac85da8927b3ae3c622c332d076a950e8c))
* shared pages include top-level accessible ([#11929](https://github.com/ParabolInc/parabol/issues/11929)) ([263e61f](https://github.com/ParabolInc/parabol/commit/263e61f7e39d9345bec2867c1b81a08b508b9e0a))

## [10.20.5](https://github.com/ParabolInc/parabol/compare/v10.20.4...v10.20.5) (2025-08-27)


### Fixed

* only billing users can downgrade a plan ([#11924](https://github.com/ParabolInc/parabol/issues/11924)) ([d68f470](https://github.com/ParabolInc/parabol/commit/d68f47025fbf58eb4857a4e33869e18c0a4507df))

## [10.20.4](https://github.com/ParabolInc/parabol/compare/v10.20.3...v10.20.4) (2025-08-26)


### Changed

* bump datadog-rum ([#11920](https://github.com/ParabolInc/parabol/issues/11920)) ([64bccf7](https://github.com/ParabolInc/parabol/commit/64bccf7643e6cf9914cd642f007a48bb3a3b190e))

## [10.20.3](https://github.com/ParabolInc/parabol/compare/v10.20.2...v10.20.3) (2025-08-26)


### Changed

* show better message for network and browser extension errors ([#11918](https://github.com/ParabolInc/parabol/issues/11918)) ([09eca41](https://github.com/ParabolInc/parabol/commit/09eca414cc92b771e0fe21060ecaf491461421fa))

## [10.20.2](https://github.com/ParabolInc/parabol/compare/v10.20.1...v10.20.2) (2025-08-25)


### Fixed

* memory leak onError and activeClients ([#11914](https://github.com/ParabolInc/parabol/issues/11914)) ([107ad9a](https://github.com/ParabolInc/parabol/commit/107ad9a8d92fc93133a68cf16a77eb127a1af663))
* memory leak onError and activeClients ([#11915](https://github.com/ParabolInc/parabol/issues/11915)) ([a4f0689](https://github.com/ParabolInc/parabol/commit/a4f068999a4b0f0847de8755d4d1c403a75079ce))

## [10.20.1](https://github.com/ParabolInc/parabol/compare/v10.20.0...v10.20.1) (2025-08-25)


### Fixed

* do not overwrite Query resolvers ([#11910](https://github.com/ParabolInc/parabol/issues/11910)) ([5f0bdb4](https://github.com/ParabolInc/parabol/commit/5f0bdb452283ab27267a1259d4d13d7d884ed475))


### Changed

* fix create new issue workflow ([#11906](https://github.com/ParabolInc/parabol/issues/11906)) ([559f6ea](https://github.com/ParabolInc/parabol/commit/559f6ea1051b1a5ac0207e271c743496fa7a4c41))

## [10.20.0](https://github.com/ParabolInc/parabol/compare/v10.19.3...v10.20.0) (2025-08-22)


### Added

* Public Pages without Auth ([#11901](https://github.com/ParabolInc/parabol/issues/11901)) ([5405827](https://github.com/ParabolInc/parabol/commit/5405827c5fb8f4db67b94e3f1a5d6538a48569ec))


### Fixed

* fetch active meetings when joining public team ([#11891](https://github.com/ParabolInc/parabol/issues/11891)) ([ced3d98](https://github.com/ParabolInc/parabol/commit/ced3d98645de480f095f6c1387f85246c6229fbd))
* max task card width ([#11899](https://github.com/ParabolInc/parabol/issues/11899)) ([97fe99b](https://github.com/ParabolInc/parabol/commit/97fe99b6c7a754a30927443cbb4b16723e4750f7))


### Changed

* decode HTML entities for issue titles ([#11892](https://github.com/ParabolInc/parabol/issues/11892)) ([33c7f6f](https://github.com/ParabolInc/parabol/commit/33c7f6fc921095fa9245fb06a5c169ee697d0bce))
* **deps:** bump dd-trace from 5.61.1 to 5.62.0 ([#11830](https://github.com/ParabolInc/parabol/issues/11830)) ([6e258aa](https://github.com/ParabolInc/parabol/commit/6e258aafa6ef7b0d634d3397cfe22d0391b731c0))

## [10.19.3](https://github.com/ParabolInc/parabol/compare/v10.19.2...v10.19.3) (2025-08-21)


### Fixed

* remove poker template dimensions ([#11886](https://github.com/ParabolInc/parabol/issues/11886)) ([0f71cdb](https://github.com/ParabolInc/parabol/commit/0f71cdb49292a924df549906239e76c1a725d67b))
* update top-level title updates ([#11880](https://github.com/ParabolInc/parabol/issues/11880)) ([b8e989d](https://github.com/ParabolInc/parabol/commit/b8e989db26670de379aa6ac56acbe6a85a57242a))


### Changed

* reopen issue on datadog comment ([#11885](https://github.com/ParabolInc/parabol/issues/11885)) ([7ff9d73](https://github.com/ParabolInc/parabol/commit/7ff9d7320084a8f7d306605befd64cc5620cba47))
* workflow to create GitHub issues from Datadog ([#11670](https://github.com/ParabolInc/parabol/issues/11670)) ([606e474](https://github.com/ParabolInc/parabol/commit/606e474c1c6d05a5f054ccabbf7c42001a1f77e4))

## [10.19.2](https://github.com/ParabolInc/parabol/compare/v10.19.1...v10.19.2) (2025-08-20)


### Fixed

* increase maximum OAuth token length for Atlassian ([#11863](https://github.com/ParabolInc/parabol/issues/11863)) ([affef7e](https://github.com/ParabolInc/parabol/commit/affef7efb0433c6d3d9c0f10ba072a5928fe87a2))
* normalize smart quote to regular quote before comparison ([#11723](https://github.com/ParabolInc/parabol/issues/11723)) ([6081548](https://github.com/ParabolInc/parabol/commit/608154811a89bf13cf444926b7786515ee168356))
* prefix breadcrumbs with team name ([#11824](https://github.com/ParabolInc/parabol/issues/11824)) ([7251b6b](https://github.com/ParabolInc/parabol/commit/7251b6be1bfdf4c10b205122d217e79abebfe66f))
* show old browser error if Intl.Segmenter is missing ([#11859](https://github.com/ParabolInc/parabol/issues/11859)) ([38de79e](https://github.com/ParabolInc/parabol/commit/38de79e16474643acc378686d154209fb6cc1b10))
* update Jira's search issue API ([#11874](https://github.com/ParabolInc/parabol/issues/11874)) ([89550cf](https://github.com/ParabolInc/parabol/commit/89550cfc97ff8f8243ba1a4ae01748a0d1d32615))


### Changed

* fix source map path for client ([#11861](https://github.com/ParabolInc/parabol/issues/11861)) ([1cdaa57](https://github.com/ParabolInc/parabol/commit/1cdaa572f91c798cc3fda0b7587a2a962438e33e))
* **gh-actions:** report to Slack GH Actions docker-external, ironbank and release-please if they fail. ([#11867](https://github.com/ParabolInc/parabol/issues/11867)) ([8a54daf](https://github.com/ParabolInc/parabol/commit/8a54dafe3d64488c5114ef66f4c51736ef93856c))
* update reviewers list ([#11864](https://github.com/ParabolInc/parabol/issues/11864)) ([560631b](https://github.com/ParabolInc/parabol/commit/560631baa6263410297e46a51e0103b3794088c3))

## [10.19.1](https://github.com/ParabolInc/parabol/compare/v10.19.0...v10.19.1) (2025-08-15)


### Fixed

* dynamic meeting type for insights block ([#11818](https://github.com/ParabolInc/parabol/issues/11818)) ([f459cbb](https://github.com/ParabolInc/parabol/commit/f459cbbeb7c7de84437b62b197b21cf67bc68944))

## [10.19.0](https://github.com/ParabolInc/parabol/compare/v10.18.0...v10.19.0) (2025-08-15)


### Added

* add check-in summaries for pages ([#11801](https://github.com/ParabolInc/parabol/issues/11801)) ([9f106dc](https://github.com/ParabolInc/parabol/commit/9f106dca8042b4c3cd3ff5483368d132ea534d8a))
* add page access modal ([#11737](https://github.com/ParabolInc/parabol/issues/11737)) ([96386ca](https://github.com/ParabolInc/parabol/commit/96386ca9e636838493b3935fc5cf839118536b6c))
* standups pages summary ([#11799](https://github.com/ParabolInc/parabol/issues/11799)) ([267e030](https://github.com/ParabolInc/parabol/commit/267e030d7c13ae7b77773e68a129b896f059e647))


### Fixed

* delete page triggers ([#11812](https://github.com/ParabolInc/parabol/issues/11812)) ([d8b1cbc](https://github.com/ParabolInc/parabol/commit/d8b1cbcae5b9d1019b9b31e4921d4559d7519d99))
* hide access to teams and orgs ([#11815](https://github.com/ParabolInc/parabol/issues/11815)) ([c24be66](https://github.com/ParabolInc/parabol/commit/c24be66a947085244a6f3b73179e07997a861087))

## [10.18.0](https://github.com/ParabolInc/parabol/compare/v10.17.0...v10.18.0) (2025-08-05)


### Added

* poker emails for pages ([#11667](https://github.com/ParabolInc/parabol/issues/11667)) ([6de8d1d](https://github.com/ParabolInc/parabol/commit/6de8d1dc4b9cc71b364e13e08f5adcd05a713520))
* poker summary on a page ([#11666](https://github.com/ParabolInc/parabol/issues/11666)) ([92aedd7](https://github.com/ParabolInc/parabol/commit/92aedd785ea813eba214f9588b0c74bdd553594c))


### Fixed

* always consume stream before abort handler throws ([#11696](https://github.com/ParabolInc/parabol/issues/11696)) ([04a5921](https://github.com/ParabolInc/parabol/commit/04a59219769326b130a47a96d18fa89a8911a9b1))
* drop unused dependencies chart.js, immutablejs ([#11695](https://github.com/ParabolInc/parabol/issues/11695)) ([709fc32](https://github.com/ParabolInc/parabol/commit/709fc32382cf049bb3d446e6b8d396a5cac90b33))
* remove reconnecting toast ([#11698](https://github.com/ParabolInc/parabol/issues/11698)) ([6bc69ce](https://github.com/ParabolInc/parabol/commit/6bc69ce37f7627da6b666502fbc283ee0dc091fd))
* tiptap memory leak ([#11709](https://github.com/ParabolInc/parabol/issues/11709)) ([90b6f1d](https://github.com/ParabolInc/parabol/commit/90b6f1d2229f78624e13736c8ef6956f9bdbc9ed))


### Changed

* **deps:** bump tailwind-merge from 1.14.0 to 3.3.1 ([#11671](https://github.com/ParabolInc/parabol/issues/11671)) ([05f9d8b](https://github.com/ParabolInc/parabol/commit/05f9d8b99b791472f617f28021a891dd0910da2a))

## [10.17.0](https://github.com/ParabolInc/parabol/compare/v10.16.3...v10.17.0) (2025-08-04)


### Added

* new email summary for retros ([#11645](https://github.com/ParabolInc/parabol/issues/11645)) ([5bc3f4f](https://github.com/ParabolInc/parabol/commit/5bc3f4f58a3c3a29661e975a1e1e747855174992))


### Fixed

* remove team member or archive team with pages ([#11668](https://github.com/ParabolInc/parabol/issues/11668)) ([b774451](https://github.com/ParabolInc/parabol/commit/b774451cbb38daaac83f65d918c461b19e97a68d))


### Changed

* fix server source maps path for Datadog ([#11656](https://github.com/ParabolInc/parabol/issues/11656)) ([75c805a](https://github.com/ParabolInc/parabol/commit/75c805a0610077844c6d03fbbb71e3fda8c62b72))
* fix source map path back ([#11658](https://github.com/ParabolInc/parabol/issues/11658)) ([5385f19](https://github.com/ParabolInc/parabol/commit/5385f191c18e3c628ff15291a678bfd221d38d36))
* source map build path ([#11657](https://github.com/ParabolInc/parabol/issues/11657)) ([0fb767d](https://github.com/ParabolInc/parabol/commit/0fb767dc41052b64c55922cf238cce7e3d63bf96))

## [10.16.3](https://github.com/ParabolInc/parabol/compare/v10.16.2...v10.16.3) (2025-07-31)


### Fixed

* end meetings without insights ([#11643](https://github.com/ParabolInc/parabol/issues/11643)) ([905a058](https://github.com/ParabolInc/parabol/commit/905a0583c8cb453e7128f8cf2312559a8dce6670))

## [10.16.2](https://github.com/ParabolInc/parabol/compare/v10.16.1...v10.16.2) (2025-07-31)


### Fixed

* filter reflection slash commands ([#11630](https://github.com/ParabolInc/parabol/issues/11630)) ([f47becd](https://github.com/ParabolInc/parabol/commit/f47becdec3e23df703e0eacb6fbde368e9fd9c61))
* window.__ACTION__ is not defined for MattermostPlugin ([#11623](https://github.com/ParabolInc/parabol/issues/11623)) ([888b967](https://github.com/ParabolInc/parabol/commit/888b9675f84f2f1038fccff37827934a28b09e55))


### Changed

* add more ignore files to biome and add .editorconfig ([#11627](https://github.com/ParabolInc/parabol/issues/11627)) ([9dc3674](https://github.com/ParabolInc/parabol/commit/9dc3674634c024921a7728f62223befe9cb1cad0))

## [10.16.1](https://github.com/ParabolInc/parabol/compare/v10.16.0...v10.16.1) (2025-07-31)


### Changed

* remove ReactRenderingError ([#11619](https://github.com/ParabolInc/parabol/issues/11619)) ([3a95bd6](https://github.com/ParabolInc/parabol/commit/3a95bd6a9e04b30d7beba21ce23266c25bf00181))
* replace eslint and prettier with biome ([#11603](https://github.com/ParabolInc/parabol/issues/11603)) ([5cc1ec7](https://github.com/ParabolInc/parabol/commit/5cc1ec7c3bd49bd4f75dd07d8f96906528152aba))
* set git sha and repository in docker for Datadog ([#11590](https://github.com/ParabolInc/parabol/issues/11590)) ([a1f59ac](https://github.com/ParabolInc/parabol/commit/a1f59acc3d62d63e37c7428209dd286676c2c793))

## [10.16.0](https://github.com/ParabolInc/parabol/compare/v10.15.0...v10.16.0) (2025-07-30)


### Added

* Retro Meeting Summary on a Page ([#11575](https://github.com/ParabolInc/parabol/issues/11575)) ([aae78d8](https://github.com/ParabolInc/parabol/commit/aae78d82f3dd141ed8ddaf98d644fa6e8b214faa))


### Fixed

* approve oxide for tailwindcss builds ([#11600](https://github.com/ParabolInc/parabol/issues/11600)) ([4997d9c](https://github.com/ParabolInc/parabol/commit/4997d9c34d941a4dbed246da6965b9425311e6c8))
* don't send EditReflectionMutation when it's read only ([#11598](https://github.com/ParabolInc/parabol/issues/11598)) ([52cdeb6](https://github.com/ParabolInc/parabol/commit/52cdeb6a129bc401c3d7a75552ca3bfb366e6ee3))

## [10.15.0](https://github.com/ParabolInc/parabol/compare/v10.14.3...v10.15.0) (2025-07-29)


### Added

* **pages:** Upgrade TipTap to V3 ([#11429](https://github.com/ParabolInc/parabol/issues/11429)) ([93d3c71](https://github.com/ParabolInc/parabol/commit/93d3c719f3f581b58e0045d1e3c5b036b4d1d480))


### Changed

* bump sharp version in webpack ([#11599](https://github.com/ParabolInc/parabol/issues/11599)) ([e740114](https://github.com/ParabolInc/parabol/commit/e7401148a50760a12f750ef5be1157e54139220e))
* **deps:** bump form-data from 4.0.2 to 4.0.4 ([#11573](https://github.com/ParabolInc/parabol/issues/11573)) ([d9e4ec4](https://github.com/ParabolInc/parabol/commit/d9e4ec48c81f70b2fa62ce2d41d1a17becc99bb7))

## [10.14.3](https://github.com/ParabolInc/parabol/compare/v10.14.2...v10.14.3) (2025-07-29)


### Changed

* Add userId to Datadog traces ([#11594](https://github.com/ParabolInc/parabol/issues/11594)) ([ac29065](https://github.com/ParabolInc/parabol/commit/ac29065df8fbfc570c117afcb816b9e0888047ee))

## [10.14.2](https://github.com/ParabolInc/parabol/compare/v10.14.1...v10.14.2) (2025-07-29)


### Changed

* fix error log message format for Datadog ([#11591](https://github.com/ParabolInc/parabol/issues/11591)) ([cc7916c](https://github.com/ParabolInc/parabol/commit/cc7916cae3d953b7d869a7f576e8d2be38df9e84))

## [10.14.1](https://github.com/ParabolInc/parabol/compare/v10.14.0...v10.14.1) (2025-07-29)


### Fixed

* mattermost generated files ([#11580](https://github.com/ParabolInc/parabol/issues/11580)) ([39f240f](https://github.com/ParabolInc/parabol/commit/39f240f48d42503b517fd5e6d0290c9b24a0d7b9))
* prevent access if token is missing ([#11548](https://github.com/ParabolInc/parabol/issues/11548)) ([96d5d8c](https://github.com/ParabolInc/parabol/commit/96d5d8cec4a83058721f48b79beef8e1f185aae3))
* save edited task content on drag & drop ([#11583](https://github.com/ParabolInc/parabol/issues/11583)) ([b2eb9ab](https://github.com/ParabolInc/parabol/commit/b2eb9aba85f9021a0d2e0c39a98f2296e81678c0))


### Changed

* bump node to 22.17.1 ([#11587](https://github.com/ParabolInc/parabol/issues/11587)) ([f432b87](https://github.com/ParabolInc/parabol/commit/f432b876ee5347eb97702f723dc905985220e2d7))
* ignore users order in createPage test ([#11572](https://github.com/ParabolInc/parabol/issues/11572)) ([72e7e40](https://github.com/ParabolInc/parabol/commit/72e7e401b0b9de5e8543a27ccdea7fd69812ce05))
* remove api package dependency ([#11585](https://github.com/ParabolInc/parabol/issues/11585)) ([4a191a8](https://github.com/ParabolInc/parabol/commit/4a191a821248c53a36499fad703629a7beddde25))
* remove direct lodash dependencies ([#11584](https://github.com/ParabolInc/parabol/issues/11584)) ([76cb657](https://github.com/ParabolInc/parabol/commit/76cb657084f1cbfe50d63ddb61f087ac254e27ef))
* update franc-min to 6.2.0 ([#11586](https://github.com/ParabolInc/parabol/issues/11586)) ([7fa6647](https://github.com/ParabolInc/parabol/commit/7fa6647b3d2a5296281e8bb086386aefdb578a2d))

## [10.14.0](https://github.com/ParabolInc/parabol/compare/v10.13.0...v10.14.0) (2025-07-21)


### Added

* add breadcrumb to pages ([#11560](https://github.com/ParabolInc/parabol/issues/11560)) ([5d097b4](https://github.com/ParabolInc/parabol/commit/5d097b4142d6ea816902534a5b68143f4f5964e9))
* add details block to pages ([#11520](https://github.com/ParabolInc/parabol/issues/11520)) ([7137743](https://github.com/ParabolInc/parabol/commit/7137743cf1a71415eaa59c25b09e965bc2396284))
* add tables to pages ([#11545](https://github.com/ParabolInc/parabol/issues/11545)) ([5938265](https://github.com/ParabolInc/parabol/commit/59382650e05369dced5a3918bdccd6662f9b9a65))
* submit reflections, tasks and standup responses on Mod+Enter ([#11561](https://github.com/ParabolInc/parabol/issues/11561)) ([03fc4d2](https://github.com/ParabolInc/parabol/commit/03fc4d2fd23352407e40a974db98ccab1b70d672))


### Fixed

* return only affected team ids when removing org users ([#11569](https://github.com/ParabolInc/parabol/issues/11569)) ([06d8fea](https://github.com/ParabolInc/parabol/commit/06d8feaf94bf233b4c3442c62c8ebd3084c83379))

## [10.13.0](https://github.com/ParabolInc/parabol/compare/v10.12.6...v10.13.0) (2025-07-15)


### Added

* add transcript to Page ([#11514](https://github.com/ParabolInc/parabol/issues/11514)) ([b602ce8](https://github.com/ParabolInc/parabol/commit/b602ce86b94fd05fc7d76b966d27b3c1c54ff37a))


### Fixed

* can click link when changing pages ([#11553](https://github.com/ParabolInc/parabol/issues/11553)) ([68adc47](https://github.com/ParabolInc/parabol/commit/68adc47a67d39789116e27bcae671b9908a27954))
* **dependabot:** fix configuration file ([#11539](https://github.com/ParabolInc/parabol/issues/11539)) ([2bd3844](https://github.com/ParabolInc/parabol/commit/2bd38441cfa85d9822652963ba50a7c48674568f))
* pages link shuffle correctly ([#11498](https://github.com/ParabolInc/parabol/issues/11498)) ([2e46817](https://github.com/ParabolInc/parabol/commit/2e468170bd29dc41440437c29832372a69fa4662))


### Changed

* **dependabot:** ignore devDependencies ([#11538](https://github.com/ParabolInc/parabol/issues/11538)) ([695808a](https://github.com/ParabolInc/parabol/commit/695808ac7daddc7f7db46656315a8a2de12e6e4a))
* **dependabot:** run it only weekly and reduce the max number of PRs to 6 ([#11546](https://github.com/ParabolInc/parabol/issues/11546)) ([437f14f](https://github.com/ParabolInc/parabol/commit/437f14f37ff9620366436719de78dbd6df3efd17))
* **github-actions:** explicit permissions added and unused workflows deleted ([#11535](https://github.com/ParabolInc/parabol/issues/11535)) ([1372aab](https://github.com/ParabolInc/parabol/commit/1372aab48553dd82aca6b4c9da5aab0ce02b1d0c))
* **readme:** database versions explicit ([#11537](https://github.com/ParabolInc/parabol/issues/11537)) ([7680458](https://github.com/ParabolInc/parabol/commit/7680458ac3d82488e9078c12c87b61f941b547ff))

## [10.12.6](https://github.com/ParabolInc/parabol/compare/v10.12.5...v10.12.6) (2025-07-07)


### Fixed

* drop stripe quantity mismatch logging not null constraint ([#11529](https://github.com/ParabolInc/parabol/issues/11529)) ([8dec804](https://github.com/ParabolInc/parabol/commit/8dec8041d7da556b09d6b39482225731036fe60c))


### Changed

* fix client schema types ([#11526](https://github.com/ParabolInc/parabol/issues/11526)) ([10df771](https://github.com/ParabolInc/parabol/commit/10df77123f742589e2887acbb512d29cebb0cb8b))

## [10.12.5](https://github.com/ParabolInc/parabol/compare/v10.12.4...v10.12.5) (2025-07-07)


### Fixed

* show correct meeting phase in dashboard ([#11522](https://github.com/ParabolInc/parabol/issues/11522)) ([4e25d4d](https://github.com/ParabolInc/parabol/commit/4e25d4d40f3d1e144014711b1503ff52f2c38431))

## [10.12.4](https://github.com/ParabolInc/parabol/compare/v10.12.3...v10.12.4) (2025-07-04)


### Fixed

* clear typing notification on submit ([#11518](https://github.com/ParabolInc/parabol/issues/11518)) ([9b6443a](https://github.com/ParabolInc/parabol/commit/9b6443ac81829f5cf1539a562036455c5556d64c))

## [10.12.3](https://github.com/ParabolInc/parabol/compare/v10.12.2...v10.12.3) (2025-07-04)


### Changed

* Remove OrganizationUser.inactive ([#11504](https://github.com/ParabolInc/parabol/issues/11504)) ([9fb810f](https://github.com/ParabolInc/parabol/commit/9fb810f5981d49e749a85fce7733c68735a05034))

## [10.12.2](https://github.com/ParabolInc/parabol/compare/v10.12.1...v10.12.2) (2025-07-02)


### Changed

* remove remains of Sentry ([#11502](https://github.com/ParabolInc/parabol/issues/11502)) ([8a73627](https://github.com/ParabolInc/parabol/commit/8a73627db15a361b235b1833e85740888333c9ef))
* remove Sentry error logging ([#11340](https://github.com/ParabolInc/parabol/issues/11340)) ([d121d6f](https://github.com/ParabolInc/parabol/commit/d121d6f2a75d04b6d3531785ae6dc815488d2c69))

## [10.12.1](https://github.com/ParabolInc/parabol/compare/v10.12.0...v10.12.1) (2025-07-01)


### Changed

* improve meeting series naming ([#11468](https://github.com/ParabolInc/parabol/issues/11468)) ([e15559f](https://github.com/ParabolInc/parabol/commit/e15559f53a477db49fa34492afb2f2708930dcb1))
* Normalize User.tms ([#10992](https://github.com/ParabolInc/parabol/issues/10992)) ([a8934c5](https://github.com/ParabolInc/parabol/commit/a8934c5e4c493c17a8c8e6a8587a588224215f32))

## [10.12.0](https://github.com/ParabolInc/parabol/compare/v10.11.1...v10.12.0) (2025-06-30)


### Added

* Prometheus metrics ([#11371](https://github.com/ParabolInc/parabol/issues/11371)) ([05257fd](https://github.com/ParabolInc/parabol/commit/05257fd676ccd43e1e30301d6348670363f6b76a))
* zoom transcript proof of concept ([#11484](https://github.com/ParabolInc/parabol/issues/11484)) ([ea2d8d6](https://github.com/ParabolInc/parabol/commit/ea2d8d658d9f254ad30e8a623de570e05a700b8a))


### Fixed

* getSAMLForDomain domains field ([#11485](https://github.com/ParabolInc/parabol/issues/11485)) ([debd408](https://github.com/ParabolInc/parabol/commit/debd408abddcc9d953d0daff8a34a4b096526872))
* use imported quietLofi file ([#11494](https://github.com/ParabolInc/parabol/issues/11494)) ([3914dd6](https://github.com/ParabolInc/parabol/commit/3914dd6acc2f6451e345db63cb1b28faca96c4bf))


### Changed

* avoid multiple size labels on PRs ([#11479](https://github.com/ParabolInc/parabol/issues/11479)) ([d4256ed](https://github.com/ParabolInc/parabol/commit/d4256edfe53d9f92f5aacb2914996723e6079a0c))
* fix PR size labeler ([#11481](https://github.com/ParabolInc/parabol/issues/11481)) ([2638174](https://github.com/ParabolInc/parabol/commit/263817421c47435fc9c92208af5f901d6ae5e3ca))

## [10.11.1](https://github.com/ParabolInc/parabol/compare/v10.11.0...v10.11.1) (2025-06-23)


### Fixed

* flashing placeholders on pages ([#11475](https://github.com/ParabolInc/parabol/issues/11475)) ([cb5eef6](https://github.com/ParabolInc/parabol/commit/cb5eef64048a6a1c4b545f4de2286e16d409d7fe))
* ignore dismiss new feature after logout ([#11477](https://github.com/ParabolInc/parabol/issues/11477)) ([92499f2](https://github.com/ParabolInc/parabol/commit/92499f2fa5ca0d279b35f12b5ecfeb5be038c531))

## [10.11.0](https://github.com/ParabolInc/parabol/compare/v10.10.1...v10.11.0) (2025-06-20)


### Added

* Automatic Table of Contents for child pages ([#11472](https://github.com/ParabolInc/parabol/issues/11472)) ([da6d962](https://github.com/ParabolInc/parabol/commit/da6d962f3dc93f5d875d973134f3d27683d55fbe))


### Changed

* background music loops ([#11446](https://github.com/ParabolInc/parabol/issues/11446)) ([6862768](https://github.com/ParabolInc/parabol/commit/6862768127ec7eec01e2b72f1a13ddd94d322220))

## [10.10.1](https://github.com/ParabolInc/parabol/compare/v10.10.0...v10.10.1) (2025-06-19)


### Fixed

* **pages:** support null nodeBefore ([#11464](https://github.com/ParabolInc/parabol/issues/11464)) ([d7e8dd1](https://github.com/ParabolInc/parabol/commit/d7e8dd1e06e6558389a6c7cf4e2bcc5a41478854))

## [10.10.0](https://github.com/ParabolInc/parabol/compare/v10.9.6...v10.10.0) (2025-06-18)


### Added

* **pages:** PageLinkBlock ([#11461](https://github.com/ParabolInc/parabol/issues/11461)) ([230afd0](https://github.com/ParabolInc/parabol/commit/230afd0c3bda63257f888b33f0dada6ca189572b))

## [10.9.6](https://github.com/ParabolInc/parabol/compare/v10.9.5...v10.9.6) (2025-06-18)


### Fixed

* fix update button on team prompt response on second edit ([#11457](https://github.com/ParabolInc/parabol/issues/11457)) ([99bc600](https://github.com/ParabolInc/parabol/commit/99bc6003fe6b5503e03fae93ec2b1a83d3ffb3c6))


### Changed

* create ai titles for single reflections ([#11445](https://github.com/ParabolInc/parabol/issues/11445)) ([0391301](https://github.com/ParabolInc/parabol/commit/0391301c10ac224986c7bd0c04f3dc773beae072))

## [10.9.5](https://github.com/ParabolInc/parabol/compare/v10.9.4...v10.9.5) (2025-06-18)


### Fixed

* show correct ready number if user goes offline ([#11454](https://github.com/ParabolInc/parabol/issues/11454)) ([f28da39](https://github.com/ParabolInc/parabol/commit/f28da393f074e0609ae8ded2e7b1a87809ed6e6d))


### Changed

* Minor pages nav list styling ([#11452](https://github.com/ParabolInc/parabol/issues/11452)) ([ee50340](https://github.com/ParabolInc/parabol/commit/ee50340ac69f0b2a860d5fed3ac3bda4bc882134))

## [10.9.4](https://github.com/ParabolInc/parabol/compare/v10.9.3...v10.9.4) (2025-06-18)


### Fixed

* always refresh after app update ([#11449](https://github.com/ParabolInc/parabol/issues/11449)) ([547061d](https://github.com/ParabolInc/parabol/commit/547061d71eec3afbb70c18062d35554aa498550d))

## [10.9.3](https://github.com/ParabolInc/parabol/compare/v10.9.2...v10.9.3) (2025-06-18)


### Fixed

* clear is typing status when moving to next discussion ([#11444](https://github.com/ParabolInc/parabol/issues/11444)) ([c44acbd](https://github.com/ParabolInc/parabol/commit/c44acbd694ff352d6edaf3635e1678933105a14f))
* Update service worker when sources return 404 ([#11439](https://github.com/ParabolInc/parabol/issues/11439)) ([9ea0981](https://github.com/ParabolInc/parabol/commit/9ea098118e81322d799d92d45d91bd339d028135))


### Changed

* Make version in help menu clickable ([#11440](https://github.com/ParabolInc/parabol/issues/11440)) ([e635b8c](https://github.com/ParabolInc/parabol/commit/e635b8ca0150f7e40bd7de2c8d536031e4ec4752))

## [10.9.2](https://github.com/ParabolInc/parabol/compare/v10.9.1...v10.9.2) (2025-06-14)


### Changed

* show app version in help menu ([#11435](https://github.com/ParabolInc/parabol/issues/11435)) ([1b53424](https://github.com/ParabolInc/parabol/commit/1b53424d4f3b41ec50d54acd96424cff0264f528))

## [10.9.1](https://github.com/ParabolInc/parabol/compare/v10.9.0...v10.9.1) (2025-06-13)


### Fixed

* migration order for delete pages ([#11430](https://github.com/ParabolInc/parabol/issues/11430)) ([534d12f](https://github.com/ParabolInc/parabol/commit/534d12f924f58682cbd3cbbd2705ce958f938959))
* refactor mass invitation to support org admin invites ([#11433](https://github.com/ParabolInc/parabol/issues/11433)) ([0086621](https://github.com/ParabolInc/parabol/commit/008662161b02719453844013f0d5b79229cbfac5))

## [10.9.0](https://github.com/ParabolInc/parabol/compare/v10.8.2...v10.9.0) (2025-06-13)


### Added

* **pages:** support deleting pages ([#11417](https://github.com/ParabolInc/parabol/issues/11417)) ([e416bc4](https://github.com/ParabolInc/parabol/commit/e416bc4397fcd9fae43f3d3059a603f21faa0a95))


### Changed

* kysely orderBy(array) is deprecated ([#11426](https://github.com/ParabolInc/parabol/issues/11426)) ([7bd0d03](https://github.com/ParabolInc/parabol/commit/7bd0d036ee595eacad4158343fc6c390edbd5590))

## [10.8.2](https://github.com/ParabolInc/parabol/compare/v10.8.1...v10.8.2) (2025-06-13)


### Changed

* Reflect phase restyling ([#11375](https://github.com/ParabolInc/parabol/issues/11375)) ([7fe329e](https://github.com/ParabolInc/parabol/commit/7fe329ec7d72a23fd1be4c1c4cae4701471d1dce))

## [10.8.1](https://github.com/ParabolInc/parabol/compare/v10.8.0...v10.8.1) (2025-06-12)


### Fixed

* do not show hyperlink into team members page in OrgTeamsRow if the viewer is not part of the team ([#11387](https://github.com/ParabolInc/parabol/issues/11387)) ([549b4a7](https://github.com/ParabolInc/parabol/commit/549b4a7f8b2ad982f2ceeebd33cf85e45de96e4a))
* rbac performance ([#11422](https://github.com/ParabolInc/parabol/issues/11422)) ([cc64f37](https://github.com/ParabolInc/parabol/commit/cc64f373f21c37221ecc8e89cc1863d52fc1a84a))


### Changed

* facilitator music overrides non facilitator's music ([#11418](https://github.com/ParabolInc/parabol/issues/11418)) ([3366582](https://github.com/ParabolInc/parabol/commit/3366582b68e5c413d7b026483e5e9fafe9de396e))
* Hide password field after entering an SSO email ([#11419](https://github.com/ParabolInc/parabol/issues/11419)) ([ed0f9a8](https://github.com/ParabolInc/parabol/commit/ed0f9a8f2b3429f807391f07b21b4ab3de96fd42))
* track background music activity ([#11408](https://github.com/ParabolInc/parabol/issues/11408)) ([3a3357b](https://github.com/ParabolInc/parabol/commit/3a3357b1aadefcf61e91eba4e9ccf3fde32eea66))

## [10.8.0](https://github.com/ParabolInc/parabol/compare/v10.7.2...v10.8.0) (2025-06-11)


### Added

* **pages:** RBAC  ([#11412](https://github.com/ParabolInc/parabol/issues/11412)) ([ce0f3ce](https://github.com/ParabolInc/parabol/commit/ce0f3ceff4fbdef0644ec142949fe3fb9db9f1e7))


### Fixed

* reduce MS Teams error logs ([#11413](https://github.com/ParabolInc/parabol/issues/11413)) ([94d8818](https://github.com/ParabolInc/parabol/commit/94d8818384c361538bb5d4f1b675310baff7e25c))
* show meeting series without active meetings in dash ([#11367](https://github.com/ParabolInc/parabol/issues/11367)) ([0321138](https://github.com/ParabolInc/parabol/commit/03211381faeb7cfdbf081367e00ffcd7bdad105e))


### Changed

* improve recurring badge readability ([#11400](https://github.com/ParabolInc/parabol/issues/11400)) ([498e26a](https://github.com/ParabolInc/parabol/commit/498e26a38f717f189c62efde1ce4eb26ad500b44))

## [10.7.2](https://github.com/ParabolInc/parabol/compare/v10.7.1...v10.7.2) (2025-06-09)


### Fixed

* disappearing reflections on phase change ([#11404](https://github.com/ParabolInc/parabol/issues/11404)) ([6775c2e](https://github.com/ParabolInc/parabol/commit/6775c2e45e211bc7ddb106b05a4980e03d6dfcd9))


### Changed

* hide tips on mobile ([#11405](https://github.com/ParabolInc/parabol/issues/11405)) ([52432f8](https://github.com/ParabolInc/parabol/commit/52432f830c2fa3346e57a4e35e54f3d2d30178d9))

## [10.7.1](https://github.com/ParabolInc/parabol/compare/v10.7.0...v10.7.1) (2025-06-06)


### Fixed

* update track imports ([#11401](https://github.com/ParabolInc/parabol/issues/11401)) ([4fb0e25](https://github.com/ParabolInc/parabol/commit/4fb0e25e1e0cead472921569eafad8dd85addc70))

## [10.7.0](https://github.com/ParabolInc/parabol/compare/v10.6.0...v10.7.0) (2025-06-05)


### Added

* add background music for viewer ([#11341](https://github.com/ParabolInc/parabol/issues/11341)) ([1761a9a](https://github.com/ParabolInc/parabol/commit/1761a9a1663a20ca1dd709d4ab1a8879411f6a58))


### Fixed

* Revert "feat(pages): RBAC and Drag-n-Drop ([#11374](https://github.com/ParabolInc/parabol/issues/11374))" ([#11395](https://github.com/ParabolInc/parabol/issues/11395)) ([697f6dc](https://github.com/ParabolInc/parabol/commit/697f6dc04c4493c4620d8f312d5d74b16815f490))

## [10.6.0](https://github.com/ParabolInc/parabol/compare/v10.5.4...v10.6.0) (2025-06-04)


### Added

* **pages:** RBAC and Drag-n-Drop ([#11374](https://github.com/ParabolInc/parabol/issues/11374)) ([a127958](https://github.com/ParabolInc/parabol/commit/a12795817ae66fd925f46aa8bfae4f35554c25b7))

## [10.5.4](https://github.com/ParabolInc/parabol/compare/v10.5.3...v10.5.4) (2025-06-03)


### Fixed

* fix in OrgTeamMembers where {teamName} is not a valid HTML ([#11383](https://github.com/ParabolInc/parabol/issues/11383)) ([2ecd59e](https://github.com/ParabolInc/parabol/commit/2ecd59e8663d2506a2c62edfa7785d97d89e9b6d))
* ungrouped reflection layout issue on kanban ([#11311](https://github.com/ParabolInc/parabol/issues/11311)) ([9a68c5f](https://github.com/ParabolInc/parabol/commit/9a68c5fc42f7d8b5b92405db8a0f3a61f887686c))

## [10.5.3](https://github.com/ParabolInc/parabol/compare/v10.5.2...v10.5.3) (2025-06-03)


### Changed

* lock all meetings of unpaid orgs ([#11365](https://github.com/ParabolInc/parabol/issues/11365)) ([fdbe122](https://github.com/ParabolInc/parabol/commit/fdbe122d9b08e43def839c255428def05f67f14f))

## [10.5.2](https://github.com/ParabolInc/parabol/compare/v10.5.1...v10.5.2) (2025-06-02)


### Fixed

* fix suUserCount after DB schema migration ([#11376](https://github.com/ParabolInc/parabol/issues/11376)) ([c58a54c](https://github.com/ParabolInc/parabol/commit/c58a54caf5805a364e0ac912f95a33914427ec2e))
* **orgAdmin:** move editable team name component to the team members page ([#11357](https://github.com/ParabolInc/parabol/issues/11357)) ([0a4002c](https://github.com/ParabolInc/parabol/commit/0a4002c3d6140f8fd456efd8d11600cebbce05fa))
* show correct emoji suggestion for :) and :( ([#11368](https://github.com/ParabolInc/parabol/issues/11368)) ([120b0fd](https://github.com/ParabolInc/parabol/commit/120b0fd91182143bcf5b66d78a985189ceea5119))


### Changed

* improve SAML error message for wrong IdP settings ([#11372](https://github.com/ParabolInc/parabol/issues/11372)) ([604a1f1](https://github.com/ParabolInc/parabol/commit/604a1f1956fa53811f23ca3e9d8096d0b830da1e))
* replace clsx with cn ([#11336](https://github.com/ParabolInc/parabol/issues/11336)) ([3167f2a](https://github.com/ParabolInc/parabol/commit/3167f2a4308809236c6364256de4753dc22359f2))

## [10.5.1](https://github.com/ParabolInc/parabol/compare/v10.5.0...v10.5.1) (2025-05-26)


### Fixed

* set message in lockOrganizations ([#11363](https://github.com/ParabolInc/parabol/issues/11363)) ([1ef583c](https://github.com/ParabolInc/parabol/commit/1ef583c008cd0e1dfb5416505a1315834cc2ca2e))

## [10.5.0](https://github.com/ParabolInc/parabol/compare/v10.4.1...v10.5.0) (2025-05-26)


### Added

* **chore:** update the placeholder text for reflections ([#11351](https://github.com/ParabolInc/parabol/issues/11351)) ([95280b8](https://github.com/ParabolInc/parabol/commit/95280b86d262cfed6d6b68c343e5b99b25b293c3))


### Fixed

* disable unsafe webpack cache ([#11361](https://github.com/ParabolInc/parabol/issues/11361)) ([ebaf9dd](https://github.com/ParabolInc/parabol/commit/ebaf9dd379356564571f52cfadc7df9dcfa3a625))
* integration logo sizing ([#11354](https://github.com/ParabolInc/parabol/issues/11354)) ([d7e8056](https://github.com/ParabolInc/parabol/commit/d7e80568c3ef8cbd2475aab819e64cf4fc6cffa7))
* return missing Organization.isPaid field ([#11360](https://github.com/ParabolInc/parabol/issues/11360)) ([7f61578](https://github.com/ParabolInc/parabol/commit/7f6157830e85ec6e9262ec5f7e38eb382bc6ed72))


### Changed

* **deps:** bump samlify from 2.9.1 to 2.10.0 ([#11350](https://github.com/ParabolInc/parabol/issues/11350)) ([b0b841d](https://github.com/ParabolInc/parabol/commit/b0b841d0f596761c23d94c970ef7163b2aee938a))
* Normalize tier in Postgres ([#11024](https://github.com/ParabolInc/parabol/issues/11024)) ([32f6983](https://github.com/ParabolInc/parabol/commit/32f6983838a5bae6e5da94a54f61cb551c999829))

## [10.4.1](https://github.com/ParabolInc/parabol/compare/v10.4.0...v10.4.1) (2025-05-21)


### Fixed

* limit the Azure DevOps work items fetched ([#11345](https://github.com/ParabolInc/parabol/issues/11345)) ([6a11049](https://github.com/ParabolInc/parabol/commit/6a110495ab9839bc09b9e26a7687137cf7278269))
* ScopePhaseArea styling ([#11349](https://github.com/ParabolInc/parabol/issues/11349)) ([d8fcdd0](https://github.com/ParabolInc/parabol/commit/d8fcdd0daa567c1d6733f32cf34e318af6db6927))


### Changed

* Remove leftover debug output ([#11346](https://github.com/ParabolInc/parabol/issues/11346)) ([a5254ab](https://github.com/ParabolInc/parabol/commit/a5254abfa7de0f4ca2476203e5ee22b449e64b7b))

## [10.4.0](https://github.com/ParabolInc/parabol/compare/v10.3.6...v10.4.0) (2025-05-16)


### Added

* adds the Linear integration ([#11217](https://github.com/ParabolInc/parabol/issues/11217)) ([18f7457](https://github.com/ParabolInc/parabol/commit/18f7457720d09f929e54f6cf19b054135441078e))
* **orgAdmin:** org admin can rename a team in org teams view ([#11331](https://github.com/ParabolInc/parabol/issues/11331)) ([81c63e0](https://github.com/ParabolInc/parabol/commit/81c63e062617f4ea301c9ca0449c3624f9e73bee))


### Fixed

* **metrics:** add metric for page insights generated ([#11332](https://github.com/ParabolInc/parabol/issues/11332)) ([8af9230](https://github.com/ParabolInc/parabol/commit/8af92304999918f877c18e5cf4dd80d0994df36a))


### Changed

* make chronos debug output optional ([#11334](https://github.com/ParabolInc/parabol/issues/11334)) ([6745673](https://github.com/ParabolInc/parabol/commit/6745673a2e0dfb9097ce7b93b12a27e7ec4a037b))

## [10.3.6](https://github.com/ParabolInc/parabol/compare/v10.3.5...v10.3.6) (2025-05-13)


### Fixed

* mark wrapped resolvers ([#11325](https://github.com/ParabolInc/parabol/issues/11325)) ([7cd2e93](https://github.com/ParabolInc/parabol/commit/7cd2e935e33a4d4b8b78beb82176909f600e7efa))
* **MS Teams:** Updates incorrect service name from `mattermost` to `msTeams` ([#11314](https://github.com/ParabolInc/parabol/issues/11314)) ([03c20d0](https://github.com/ParabolInc/parabol/commit/03c20d06371b6e2b18514d930d18be004cdeeaeb))
* **orgAdmin:** enable org admins to rename & update scope of meeting templates ([#11326](https://github.com/ParabolInc/parabol/issues/11326)) ([c6b0f0a](https://github.com/ParabolInc/parabol/commit/c6b0f0a754de78979fee0af2480267af38b4e336))


### Changed

* fail on pgtyped errors ([#11324](https://github.com/ParabolInc/parabol/issues/11324)) ([33a676d](https://github.com/ParabolInc/parabol/commit/33a676ddcfc52499da91cbdd73cd73d91eebc077))

## [10.3.5](https://github.com/ParabolInc/parabol/compare/v10.3.4...v10.3.5) (2025-05-09)


### Fixed

* gitlab name in summary ([#11320](https://github.com/ParabolInc/parabol/issues/11320)) ([2158778](https://github.com/ParabolInc/parabol/commit/21587780445dac786234acca3fea59734e430b8c))

## [10.3.4](https://github.com/ParabolInc/parabol/compare/v10.3.3...v10.3.4) (2025-05-09)


### Fixed

* bump kysely ([#11308](https://github.com/ParabolInc/parabol/issues/11308)) ([9c62de2](https://github.com/ParabolInc/parabol/commit/9c62de20d57f4d1727f96e5e49248810c303fd7b))
* Mattermost relay compiler in dev ([#11305](https://github.com/ParabolInc/parabol/issues/11305)) ([2c3f61f](https://github.com/ParabolInc/parabol/commit/2c3f61f72935f1368ad36bd0f6d03652654953e9))
* show resource names in webpack dev build ([#11306](https://github.com/ParabolInc/parabol/issues/11306)) ([bec910d](https://github.com/ParabolInc/parabol/commit/bec910dafe1fe5dbe8d6b8e14fdf03bcb38875cb))


### Changed

* cleanup Mattermost webhook handler ([#11312](https://github.com/ParabolInc/parabol/issues/11312)) ([dbe200e](https://github.com/ParabolInc/parabol/commit/dbe200e9d9cab8802e88e87edec68f5388a9645b))
* **Mattermost Plugin:** improve not logged in experience ([#11313](https://github.com/ParabolInc/parabol/issues/11313)) ([fcac5ac](https://github.com/ParabolInc/parabol/commit/fcac5ac8b40ea696d94b31ccefcdd0b76ce2b30c))

## [10.3.3](https://github.com/ParabolInc/parabol/compare/v10.3.2...v10.3.3) (2025-05-06)


### Fixed

* await tick in chronos to not run it in parallel ([#11303](https://github.com/ParabolInc/parabol/issues/11303)) ([8168e2f](https://github.com/ParabolInc/parabol/commit/8168e2f6e037cb4ebda59b7b510f64d154bc3815))
* db:start command created the dev folder with the current user ([#11242](https://github.com/ParabolInc/parabol/issues/11242)) ([43c7166](https://github.com/ParabolInc/parabol/commit/43c716693afb679022c8a56f3e03d284696c4d64))

## [10.3.2](https://github.com/ParabolInc/parabol/compare/v10.3.1...v10.3.2) (2025-05-06)


### Fixed

* can push task card to integration ([#11275](https://github.com/ParabolInc/parabol/issues/11275)) ([91f85b9](https://github.com/ParabolInc/parabol/commit/91f85b9af894a8cefe8ea218631a5fb976da5b3f))
* **Mattermost:** fix notifications ([#11299](https://github.com/ParabolInc/parabol/issues/11299)) ([96da6ab](https://github.com/ParabolInc/parabol/commit/96da6aba1f44bcfae57461d9b188452132a7ce62))
* **Mattermost:** use x-application-authorization header ([#11297](https://github.com/ParabolInc/parabol/issues/11297)) ([a7db165](https://github.com/ParabolInc/parabol/commit/a7db165281d924e2a105323222faaa49beac8abc))

## [10.3.1](https://github.com/ParabolInc/parabol/compare/v10.3.0...v10.3.1) (2025-05-06)


### Fixed

* do not bump parabol-client dependency in package.json ([#11294](https://github.com/ParabolInc/parabol/issues/11294)) ([3960282](https://github.com/ParabolInc/parabol/commit/3960282008274107088d2192fce5ea8db18bd9ee))

## [10.3.0](https://github.com/ParabolInc/parabol/compare/v10.2.0...v10.3.0) (2025-05-05)


### Added

* migrate from yarn to pnpm ([#11240](https://github.com/ParabolInc/parabol/issues/11240)) ([6f2a86a](https://github.com/ParabolInc/parabol/commit/6f2a86a742e468821fdc7d0273d39fd695218e62))


### Fixed

* catch AbortError on fetch ([#11291](https://github.com/ParabolInc/parabol/issues/11291)) ([02dea43](https://github.com/ParabolInc/parabol/commit/02dea4322a3c654fb0fb23f11ebfef32d35231bf))
* only call wsHandler message if socket is open ([#11281](https://github.com/ParabolInc/parabol/issues/11281)) ([5e12162](https://github.com/ParabolInc/parabol/commit/5e12162f2d31f7563ada40dbf5a76299584b6ced))

## [10.2.0](https://github.com/ParabolInc/parabol/compare/v10.1.10...v10.2.0) (2025-05-01)


### Added

* dump on sigusr2 ([#11285](https://github.com/ParabolInc/parabol/issues/11285)) ([ab61ff9](https://github.com/ParabolInc/parabol/commit/ab61ff9775df98cc23cac63484200b68b0ad8764))


### Fixed

* improve error handling for websocket connections in safari  ([#11282](https://github.com/ParabolInc/parabol/issues/11282)) ([271d1d5](https://github.com/ParabolInc/parabol/commit/271d1d579e4a74acf1920ef59aebd8d4a5f59838))
* remove resolver-level tracing for DD debugging ([#11284](https://github.com/ParabolInc/parabol/issues/11284)) ([ea755b6](https://github.com/ParabolInc/parabol/commit/ea755b6f61578e5fd91e834041f975976f93db56))

## [10.1.10](https://github.com/ParabolInc/parabol/compare/v10.1.9...v10.1.10) (2025-04-30)


### Fixed

* dont show person is typing if anonymous comment ([#11266](https://github.com/ParabolInc/parabol/issues/11266)) ([2e88e02](https://github.com/ParabolInc/parabol/commit/2e88e026a22df7081f864f53159a3135836a95a1))
* elect chronos leader per tick ([#11272](https://github.com/ParabolInc/parabol/issues/11272)) ([ba9e0f0](https://github.com/ParabolInc/parabol/commit/ba9e0f01be7d2c09d2297cf53477d55eb336653b))
* ensure process recurrence runs sequentially ([#11277](https://github.com/ParabolInc/parabol/issues/11277)) ([319c317](https://github.com/ParabolInc/parabol/commit/319c31745e841e68292c1d20f7c39d9f420ec60b))

## [10.1.9](https://github.com/ParabolInc/parabol/compare/v10.1.8...v10.1.9) (2025-04-28)


### Fixed

* leader election on interval ([#11267](https://github.com/ParabolInc/parabol/issues/11267)) ([dd7e16e](https://github.com/ParabolInc/parabol/commit/dd7e16e449ac73d3c826a7a6c77abd85f9a99342))

## [10.1.8](https://github.com/ParabolInc/parabol/compare/v10.1.7...v10.1.8) (2025-04-28)


### Fixed

* Node 22 type fixes ([#11260](https://github.com/ParabolInc/parabol/issues/11260)) ([5e6e582](https://github.com/ParabolInc/parabol/commit/5e6e58236b5f35e8daf8a9b95bcdf31c9e99f8c0))
* Switch to @whatwg/fetch throughout the server ([#11263](https://github.com/ParabolInc/parabol/issues/11263)) ([f31bdd7](https://github.com/ParabolInc/parabol/commit/f31bdd7e5079967fdf9e29b5527cd8cb1ab38f5f))

## [10.1.7](https://github.com/ParabolInc/parabol/compare/v10.1.6...v10.1.7) (2025-04-25)


### Fixed

* disconnectAllSockets accepts an input parameters for the disconnect window ([#11247](https://github.com/ParabolInc/parabol/issues/11247)) ([7ffd28f](https://github.com/ParabolInc/parabol/commit/7ffd28fd2181af0e348ab1317028c0675f14a21c))

## [10.1.6](https://github.com/ParabolInc/parabol/compare/v10.1.5...v10.1.6) (2025-04-24)


### Fixed

* revert back to @whatwg-node/fetch ([#11252](https://github.com/ParabolInc/parabol/issues/11252)) ([6285bcf](https://github.com/ParabolInc/parabol/commit/6285bcf3e2f304eaf8a456df5a65d05a6f442f97))

## [10.1.5](https://github.com/ParabolInc/parabol/compare/v10.1.4...v10.1.5) (2025-04-24)


### Fixed

* Dragging reflections would crash if subscription did not work ([#11241](https://github.com/ParabolInc/parabol/issues/11241)) ([30258ed](https://github.com/ParabolInc/parabol/commit/30258ed8e6c0c270f107104b164c289799e6862b))
* Handle publish taking longer than 30s ([#11248](https://github.com/ParabolInc/parabol/issues/11248)) ([d39702c](https://github.com/ParabolInc/parabol/commit/d39702c33ae6f87a29d05a941f89fc5c1d7cd52e))

## [10.1.4](https://github.com/ParabolInc/parabol/compare/v10.1.3...v10.1.4) (2025-04-23)


### Fixed

* pageInsights set initial prompt on load ([#11236](https://github.com/ParabolInc/parabol/issues/11236)) ([4f7ca84](https://github.com/ParabolInc/parabol/commit/4f7ca84b1c7cfeb0680ef56554b89f0edc828098))

## [10.1.3](https://github.com/ParabolInc/parabol/compare/v10.1.2...v10.1.3) (2025-04-23)


### Fixed

* bump sentry from v7 to v9 ([#11231](https://github.com/ParabolInc/parabol/issues/11231)) ([762ddde](https://github.com/ParabolInc/parabol/commit/762ddde4e44e3b8aeff9b51c79c4dece13174f26))

## [10.1.2](https://github.com/ParabolInc/parabol/compare/v10.1.1...v10.1.2) (2025-04-23)


### Fixed

* dump sockets before dumping heap ([#11213](https://github.com/ParabolInc/parabol/issues/11213)) ([d3d0d58](https://github.com/ParabolInc/parabol/commit/d3d0d58d9d43c49b171b0a10b6360886417c2e55))
* group titles sometimes load indefinitely until refresh ([#11196](https://github.com/ParabolInc/parabol/issues/11196)) ([c205e6e](https://github.com/ParabolInc/parabol/commit/c205e6e62a2fca5ddfbfcd3274dd53288e6d3743))
* udpaterecurrencesetting return type ([#11230](https://github.com/ParabolInc/parabol/issues/11230)) ([4c7c81a](https://github.com/ParabolInc/parabol/commit/4c7c81aa28f41fc792f0871a09b2377773f4c65d))
* upgrade module-federation/enhanced to fix koa vulnerability ([#11225](https://github.com/ParabolInc/parabol/issues/11225)) ([39350cf](https://github.com/ParabolInc/parabol/commit/39350cf0c13a8b380303a68d5099c7fdd76e1fe4))


### Changed

* Add Self Managed GitLab to the Enterprise benefits list ([#11220](https://github.com/ParabolInc/parabol/issues/11220)) ([d66c619](https://github.com/ParabolInc/parabol/commit/d66c6199db5edd97fdb940a72981160f43853539))
* Use Parabol URL from environment for Mattermost Plugin ([#11226](https://github.com/ParabolInc/parabol/issues/11226)) ([1454e80](https://github.com/ParabolInc/parabol/commit/1454e80e3951f1173617965a3dd492745644342b))

## [10.1.1](https://github.com/ParabolInc/parabol/compare/v10.1.0...v10.1.1) (2025-04-18)


### Fixed

* bump node version ([#11209](https://github.com/ParabolInc/parabol/issues/11209)) ([c8bd950](https://github.com/ParabolInc/parabol/commit/c8bd950b674d80bce3dddd4ddeb5da4405f772f8))
* remove referece to dispose fn ([#11215](https://github.com/ParabolInc/parabol/issues/11215)) ([def8f55](https://github.com/ParabolInc/parabol/commit/def8f553b80c4d51405b08723dbc91c3f59f26d7))

## [10.1.0](https://github.com/ParabolInc/parabol/compare/v10.0.2...v10.1.0) (2025-04-16)


### Added

* streaming page insights ([#11191](https://github.com/ParabolInc/parabol/issues/11191)) ([a30c0f7](https://github.com/ParabolInc/parabol/commit/a30c0f73416d1c7b694ad9d6fad175f25043c6e3))


### Fixed

* listitem updates inside insights ([#11204](https://github.com/ParabolInc/parabol/issues/11204)) ([a735922](https://github.com/ParabolInc/parabol/commit/a735922b73fb6f2c2a429826cb9e348034c41a9a))

## [10.0.2](https://github.com/ParabolInc/parabol/compare/v10.0.1...v10.0.2) (2025-04-16)


### Fixed

* terminate client WS if server does not respond ([#11198](https://github.com/ParabolInc/parabol/issues/11198)) ([fa89159](https://github.com/ParabolInc/parabol/commit/fa891593b143d643e4c53e030aa90d9cf6ace20e))

## [10.0.1](https://github.com/ParabolInc/parabol/compare/v10.0.0...v10.0.1) (2025-04-16)


### Fixed

* chronos primary lock ([#11193](https://github.com/ParabolInc/parabol/issues/11193)) ([60ebd77](https://github.com/ParabolInc/parabol/commit/60ebd7788a5f0f866ba1198b6da012cbd7ac1157))

## [10.0.0](https://github.com/ParabolInc/parabol/compare/v9.1.5...v10.0.0) (2025-04-15)


### ⚠ BREAKING CHANGES

* run chronos on the primary webserver ([#11189](https://github.com/ParabolInc/parabol/issues/11189))

### Added

* run chronos on the primary webserver ([#11189](https://github.com/ParabolInc/parabol/issues/11189)) ([f4493b8](https://github.com/ParabolInc/parabol/commit/f4493b8ecfe2cdfe47d53994f6a4ef11efa28ce4))

## Prior Major Version Changelogs

We try to keep this CHANGELOG limited to only the current major version.
For past major version revision history, please refer to one of the following
linked documents:

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
