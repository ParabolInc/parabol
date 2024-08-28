# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [7.45.0](https://github.com/ParabolInc/parabol/compare/v7.44.0...v7.45.0) (2024-08-28)


### Added

* add ai summary to demo ([#10160](https://github.com/ParabolInc/parabol/issues/10160)) ([089a537](https://github.com/ParabolInc/parabol/commit/089a537899ac2ca9e71906b570146a1564233b1c))

## [7.44.0](https://github.com/ParabolInc/parabol/compare/v7.43.8...v7.44.0) (2024-08-27)


### Added

* upgrade suggest groups openai models ([#10153](https://github.com/ParabolInc/parabol/issues/10153)) ([34d5194](https://github.com/ParabolInc/parabol/commit/34d519467dfcfdfbc5c13781ca257917faf9eb1a))


### Changed

* **rethinkdb:** SlackAuth ([#10154](https://github.com/ParabolInc/parabol/issues/10154)) ([420f072](https://github.com/ParabolInc/parabol/commit/420f07270177e36a837f138eb203f2b6b56fd730))
* **rethinkdb:** SlackNotification ([#10163](https://github.com/ParabolInc/parabol/issues/10163)) ([1043859](https://github.com/ParabolInc/parabol/commit/1043859fe2b09dde80786271897f49276cd5aba7))

## [7.43.8](https://github.com/ParabolInc/parabol/compare/v7.43.7...v7.43.8) (2024-08-22)


### Fixed

* no team leads ([#10145](https://github.com/ParabolInc/parabol/issues/10145)) ([a1599e9](https://github.com/ParabolInc/parabol/commit/a1599e90e90df1e4e32963fe304a0f85a0af020d))
* **orgAdmins:** archived teams should be removed from the OrgTeams view ([#10142](https://github.com/ParabolInc/parabol/issues/10142)) ([c70b87a](https://github.com/ParabolInc/parabol/commit/c70b87a4561b1742ae726dd08f47811b3f1bd4ff))
* **orgAdmins:** Billing leaders should not see all teams in the org ([#10141](https://github.com/ParabolInc/parabol/issues/10141)) ([cd570ac](https://github.com/ParabolInc/parabol/commit/cd570acd3a9aebb9b09e6139263a5ef85d406dc0))
* use period end instead of due at ([#10151](https://github.com/ParabolInc/parabol/issues/10151)) ([6492679](https://github.com/ParabolInc/parabol/commit/6492679641bede9265b7df57295ad79caf3eadc9))


### Changed

* update contributing doc ([#10148](https://github.com/ParabolInc/parabol/issues/10148)) ([5a95f62](https://github.com/ParabolInc/parabol/commit/5a95f622f91ee6b992f37d5feb5bda850f82cf0b))

## [7.43.7](https://github.com/ParabolInc/parabol/compare/v7.43.6...v7.43.7) (2024-08-16)


### Changed

* **rethinkdb:** AgendaItem: Phase 3 ([#10109](https://github.com/ParabolInc/parabol/issues/10109)) ([bd802d5](https://github.com/ParabolInc/parabol/commit/bd802d52866498310fe45cc951d059b2f30b9da6))

## [7.43.6](https://github.com/ParabolInc/parabol/compare/v7.43.5...v7.43.6) (2024-08-16)


### Fixed

* add missing ID ([#10136](https://github.com/ParabolInc/parabol/issues/10136)) ([62abfa0](https://github.com/ParabolInc/parabol/commit/62abfa0c047383a2922957f859dab484abafa2b4))

## [7.43.5](https://github.com/ParabolInc/parabol/compare/v7.43.4...v7.43.5) (2024-08-16)


### Fixed

* handle empty array to PG. fixup error handling ([#10133](https://github.com/ParabolInc/parabol/issues/10133)) ([ae28cde](https://github.com/ParabolInc/parabol/commit/ae28cdef4e02b91a1ac4ce67d26cfed2f8a4beda))

## [7.43.4](https://github.com/ParabolInc/parabol/compare/v7.43.3...v7.43.4) (2024-08-15)


### Fixed

* action meetings that had templates. wtf ([#10130](https://github.com/ParabolInc/parabol/issues/10130)) ([7c5e532](https://github.com/ParabolInc/parabol/commit/7c5e5327d5acce8a02661a7d1c5db2bfa1857992))

## [7.43.3](https://github.com/ParabolInc/parabol/compare/v7.43.2...v7.43.3) (2024-08-15)


### Changed

* **rethinkdb:** AgendaItem: Phase 1 ([#10108](https://github.com/ParabolInc/parabol/issues/10108)) ([27e68c3](https://github.com/ParabolInc/parabol/commit/27e68c3b44f28944fd12bd10b66b2ca0f4dcf330))
* **rethinkdb:** MeetingSettings: Phase 3 ([#10090](https://github.com/ParabolInc/parabol/issues/10090)) ([7aa172b](https://github.com/ParabolInc/parabol/commit/7aa172bed5df7bdfdf981a920c19d4bcce9710e2))

## [7.43.2](https://github.com/ParabolInc/parabol/compare/v7.43.1...v7.43.2) (2024-08-14)


### Fixed

* email-meeting-summaries ([#10104](https://github.com/ParabolInc/parabol/issues/10104)) ([5debeb9](https://github.com/ParabolInc/parabol/commit/5debeb959c7b6c9fbbf2f8a20a0377bb09efc3e0))

## [7.43.1](https://github.com/ParabolInc/parabol/compare/v7.43.0...v7.43.1) (2024-08-12)


### Changed

* **rethinkdb:** MeetingSettings: Phase 2 ([#10089](https://github.com/ParabolInc/parabol/issues/10089)) ([dfc6422](https://github.com/ParabolInc/parabol/commit/dfc6422532ea2f39b1773d66154d304527a07371))

## [7.43.0](https://github.com/ParabolInc/parabol/compare/v7.42.2...v7.43.0) (2024-08-12)


### Added

* update meeting summary UI ([#10081](https://github.com/ParabolInc/parabol/issues/10081)) ([bf1851e](https://github.com/ParabolInc/parabol/commit/bf1851e9ebfe88aa470952b1daf053a83c04c865))


### Changed

* **rethinkdb:** Invoice: Remove ([#10086](https://github.com/ParabolInc/parabol/issues/10086)) ([10164a8](https://github.com/ParabolInc/parabol/commit/10164a8a43850c9ca80042a151b4da6020ad37d6))
* **rethinkdb:** MeetingSettings: Phase 1 ([#10088](https://github.com/ParabolInc/parabol/issues/10088)) ([40d8c8c](https://github.com/ParabolInc/parabol/commit/40d8c8c15b9804a5ee2ef49649893cdc5dfdd665))

## [7.42.2](https://github.com/ParabolInc/parabol/compare/v7.42.1...v7.42.2) (2024-08-08)


### Fixed

* Do not add suggested actions multiple times for autojoin ([#10096](https://github.com/ParabolInc/parabol/issues/10096)) ([445a897](https://github.com/ParabolInc/parabol/commit/445a89796b9a060cb4ab571a2cf06b5be20ca3b6))

## [7.42.1](https://github.com/ParabolInc/parabol/compare/v7.42.0...v7.42.1) (2024-08-08)


### Fixed

* accept invite vialotes constraint on suggested action ([#10093](https://github.com/ParabolInc/parabol/issues/10093)) ([2f587ac](https://github.com/ParabolInc/parabol/commit/2f587ac7730a81d9bf14070d0ea7f8f60ab0caa5))

## [7.42.0](https://github.com/ParabolInc/parabol/compare/v7.41.2...v7.42.0) (2024-08-08)


### Added

* generate a summary of meeting summaries ([#10017](https://github.com/ParabolInc/parabol/issues/10017)) ([dbb3497](https://github.com/ParabolInc/parabol/commit/dbb34970740a34a3a4489641c4701334fa183a00))
* generate new meeting summaries for a team ([#10050](https://github.com/ParabolInc/parabol/issues/10050)) ([c497d9e](https://github.com/ParabolInc/parabol/commit/c497d9ec63d5e327ce9f1e664c3bc955869d07ae))


### Fixed

* Avoid refetching project template for ADO ([#10077](https://github.com/ParabolInc/parabol/issues/10077)) ([510c56e](https://github.com/ParabolInc/parabol/commit/510c56ee8f878e0661fe99172e5301eddfa573e9))
* Don't fail acceptTeamInvitation for duplicate suggested actions ([#10091](https://github.com/ParabolInc/parabol/issues/10091)) ([fe6310c](https://github.com/ParabolInc/parabol/commit/fe6310c04364431a5f99b23fe38a3492e4f30ad2))
* rename Insight migration ([#10087](https://github.com/ParabolInc/parabol/issues/10087)) ([41fc268](https://github.com/ParabolInc/parabol/commit/41fc26856c2217bd7b4035d09b6d04b8e9d60ef6))


### Changed

* cleanup selectors ([#10078](https://github.com/ParabolInc/parabol/issues/10078)) ([0a6534d](https://github.com/ParabolInc/parabol/commit/0a6534dfa85fbb921666a5c5ee2ef3d21161114f))

## [7.41.2](https://github.com/ParabolInc/parabol/compare/v7.41.1...v7.41.2) (2024-08-05)


### Fixed

* Fetching more than 200 Azure DevOps issues ([#10073](https://github.com/ParabolInc/parabol/issues/10073)) ([5829a11](https://github.com/ParabolInc/parabol/commit/5829a1149a751deddc2b9346a350c92c7e079b24))


### Changed

* **rethinkdb:** SuggestedAction: Phase 3 ([#10043](https://github.com/ParabolInc/parabol/issues/10043)) ([6c0cc36](https://github.com/ParabolInc/parabol/commit/6c0cc36c75a3094ce181b5fac83fe9a1c064fb53))

## [7.41.1](https://github.com/ParabolInc/parabol/compare/v7.41.0...v7.41.1) (2024-08-02)


### Changed

* **rethinkdb:** SuggestedAction: Phase 2 ([#10042](https://github.com/ParabolInc/parabol/issues/10042)) ([3bc68e0](https://github.com/ParabolInc/parabol/commit/3bc68e05497a8ee18a024c1f3b0d9e3268dc18a2))

## [7.41.0](https://github.com/ParabolInc/parabol/compare/v7.40.2...v7.41.0) (2024-08-02)


### Added

* **orgAdmin:** org admins can archive teams ([#10022](https://github.com/ParabolInc/parabol/issues/10022)) ([31cd317](https://github.com/ParabolInc/parabol/commit/31cd317b906e2f02e3c87fc1cb3bedf77c160bb8))


### Fixed

* check signal for build exit code ([#10063](https://github.com/ParabolInc/parabol/issues/10063)) ([4207f7d](https://github.com/ParabolInc/parabol/commit/4207f7d0d925d0b8360a0e4e704edae96a46f85d))
* Fix error in start meeting if the user has no teams ([#10056](https://github.com/ParabolInc/parabol/issues/10056)) ([e20aefd](https://github.com/ParabolInc/parabol/commit/e20aefd15c7d92b3ada0436ce41ca78f3ad600fd))
* nest-graphql-endpoint support graphql v16 ([#10066](https://github.com/ParabolInc/parabol/issues/10066)) ([2c27e13](https://github.com/ParabolInc/parabol/commit/2c27e13cc234d78cad10b551bec6258e508270f2))
* null not distinct ([#10067](https://github.com/ParabolInc/parabol/issues/10067)) ([e6204a7](https://github.com/ParabolInc/parabol/commit/e6204a75194e310ee1ceb89a15d2e23cb6cfeccf))


### Changed

* Add orgId to IntegrationProvider ([#6014](https://github.com/ParabolInc/parabol/issues/6014)) ([6819e90](https://github.com/ParabolInc/parabol/commit/6819e90d40c17761c5f7a0159c4de1dd344bc531))

## [7.40.2](https://github.com/ParabolInc/parabol/compare/v7.40.1...v7.40.2) (2024-08-01)


### Fixed

* discussion mentioned can be triggered by all meetings ([#10060](https://github.com/ParabolInc/parabol/issues/10060)) ([b777958](https://github.com/ParabolInc/parabol/commit/b7779580b0717c42a10d58ac06143e2a0d66298a))

## [7.40.1](https://github.com/ParabolInc/parabol/compare/v7.40.0...v7.40.1) (2024-08-01)


### Fixed

* **build:** build prod exits with code 1 if anything goes wrong ([#10016](https://github.com/ParabolInc/parabol/issues/10016)) ([1ed6a82](https://github.com/ParabolInc/parabol/commit/1ed6a82312f4aa63a3b46eed7645bd27a23d4d7f))


### Changed

* **docker-stack:** force network to be called parabol on the single-tenant compose stack ([#10041](https://github.com/ParabolInc/parabol/issues/10041)) ([8b3b1b8](https://github.com/ParabolInc/parabol/commit/8b3b1b80e436f33ae64580ec71c7ed098e076875))
* **rethinkdb:** SuggestedAction: Phase 1 ([#10035](https://github.com/ParabolInc/parabol/issues/10035)) ([d00da10](https://github.com/ParabolInc/parabol/commit/d00da10595e85bd6cd7004b621e17efb2522b995))
* update @radix-ui/react-alert-dialog  ([#9986](https://github.com/ParabolInc/parabol/issues/9986)) ([936f1f6](https://github.com/ParabolInc/parabol/commit/936f1f62fc474e94618ebb64dbbdd8678706a984))
* upgrade GraphQL to v16 ([#10052](https://github.com/ParabolInc/parabol/issues/10052)) ([a27769c](https://github.com/ParabolInc/parabol/commit/a27769c56ce5f49b4186c47c364a9261f04c01ba))

## [7.40.0](https://github.com/ParabolInc/parabol/compare/v7.39.3...v7.40.0) (2024-07-26)


### Added

* nav updates ([#9973](https://github.com/ParabolInc/parabol/issues/9973)) ([2dd490a](https://github.com/ParabolInc/parabol/commit/2dd490ac75578f73d7a7b3e1f8ccfb1cd2164884))


### Fixed

* Disable SAML on downgrade to starter ([#10026](https://github.com/ParabolInc/parabol/issues/10026)) ([fa52c46](https://github.com/ParabolInc/parabol/commit/fa52c4638629fcf9c5c3453798d1320b9d8da2dd))


### Changed

* **deps:** bump braces from 3.0.2 to 3.0.3 ([#9843](https://github.com/ParabolInc/parabol/issues/9843)) ([0f6d8a4](https://github.com/ParabolInc/parabol/commit/0f6d8a40ad7e8490ba9503b56c5bc9e9a20620c2))
* migrate EmailVerification to pg ([#9492](https://github.com/ParabolInc/parabol/issues/9492)) ([a653a61](https://github.com/ParabolInc/parabol/commit/a653a61b279631aa66d461ebd2012c4136358bd0))
* **rethinkdb:** TemplateDimension: One-shot ([#10033](https://github.com/ParabolInc/parabol/issues/10033)) ([77e163a](https://github.com/ParabolInc/parabol/commit/77e163add65765641936bd56b83aa91f58e5b21a))
* **SDL:** refactor _legacy.graphql into individual typeDefs ([#10019](https://github.com/ParabolInc/parabol/issues/10019)) ([f8b029d](https://github.com/ParabolInc/parabol/commit/f8b029d60b78e50e8afa5f0a0f44c863afce753a))

## [7.39.3](https://github.com/ParabolInc/parabol/compare/v7.39.2...v7.39.3) (2024-07-25)


### Changed

* **rethinkdb:** TemplateScale: One-shot ([#10021](https://github.com/ParabolInc/parabol/issues/10021)) ([0c6c8e7](https://github.com/ParabolInc/parabol/commit/0c6c8e79dfbbac93362b3db640b008e32ba701b3))

## [7.39.2](https://github.com/ParabolInc/parabol/compare/v7.39.1...v7.39.2) (2024-07-24)


### Fixed

* bump pm2 version ([#10027](https://github.com/ParabolInc/parabol/issues/10027)) ([0bb8ead](https://github.com/ParabolInc/parabol/commit/0bb8ead2adc52f64ad30ef57891791e1b3dd4ac1))


### Changed

* **rethinkdb:** TeamMember: Phase 3 ([#10003](https://github.com/ParabolInc/parabol/issues/10003)) ([73a5881](https://github.com/ParabolInc/parabol/commit/73a5881709f9345767c2a233cbe28716b6c3b8e1))

## [7.39.1](https://github.com/ParabolInc/parabol/compare/v7.39.0...v7.39.1) (2024-07-23)


### Changed

* **rethinkdb:** TeamMember: Phase 2 ([#9993](https://github.com/ParabolInc/parabol/issues/9993)) ([90de32f](https://github.com/ParabolInc/parabol/commit/90de32f702849a92be28dff42188445947a54325))

## [7.39.0](https://github.com/ParabolInc/parabol/compare/v7.38.11...v7.39.0) (2024-07-23)


### Added

* GCal event series for Standup ([#9959](https://github.com/ParabolInc/parabol/issues/9959)) ([8a6659a](https://github.com/ParabolInc/parabol/commit/8a6659a2373a101a970b2fb2a1004c0e21c85f65))


### Changed

* Fix test ([#10013](https://github.com/ParabolInc/parabol/issues/10013)) ([23c8048](https://github.com/ParabolInc/parabol/commit/23c8048eb88916d5f2021dc0e830fd3b953452e6))
* Move more integration GraphQL types to SDL ([#10015](https://github.com/ParabolInc/parabol/issues/10015)) ([1279971](https://github.com/ParabolInc/parabol/commit/12799719081e53fdf0976005dabf851fc2908c42))
* Reduce Azure DevOps scope ([#9999](https://github.com/ParabolInc/parabol/issues/9999)) ([e6a3c7d](https://github.com/ParabolInc/parabol/commit/e6a3c7d12b0f4e7a3b7caa4fe62ab81764c9f577))
* upgrade from gpt-3.5-turbo to gpt-4o-mini ([#10002](https://github.com/ParabolInc/parabol/issues/10002)) ([b816727](https://github.com/ParabolInc/parabol/commit/b816727460620637f49027a1b32e47d3a2676152))

## [7.38.11](https://github.com/ParabolInc/parabol/compare/v7.38.10...v7.38.11) (2024-07-19)


### Fixed

* Filipino checkin greeting ([#9997](https://github.com/ParabolInc/parabol/issues/9997)) ([5c45379](https://github.com/ParabolInc/parabol/commit/5c453794fa3ebb6f1948a2f6c8c7f70be2a0d009))


### Changed

* fix broken build mig file ([#10006](https://github.com/ParabolInc/parabol/issues/10006)) ([892cbd6](https://github.com/ParabolInc/parabol/commit/892cbd654d030a6884a4c50cecf6fb5244e153c8))
* move some integrations to SDL pattern ([#10000](https://github.com/ParabolInc/parabol/issues/10000)) ([6d01097](https://github.com/ParabolInc/parabol/commit/6d01097ef68bbbe33eea1faf1367d7ad6120f1db))
* **rethinkdb:** QueryMap: One-shot ([#10005](https://github.com/ParabolInc/parabol/issues/10005)) ([28553e4](https://github.com/ParabolInc/parabol/commit/28553e49c64206fde3e88d47ac48175639b8b6cb))
* **rethinkdb:** TaskHistory: One-shot ([#10004](https://github.com/ParabolInc/parabol/issues/10004)) ([7100a23](https://github.com/ParabolInc/parabol/commit/7100a231fc6bbc750398daec03d882e5afc7a57c))
* **rethinkdb:** TeamMember: Phase 1 ([#9979](https://github.com/ParabolInc/parabol/issues/9979)) ([b0c2cf2](https://github.com/ParabolInc/parabol/commit/b0c2cf2aa40aa08c8de24bfdcb2a9a150178271e))

## [7.38.10](https://github.com/ParabolInc/parabol/compare/v7.38.9...v7.38.10) (2024-07-17)


### Fixed

* colors of the prompts for the threat level retro match now the prompts' names ([#9956](https://github.com/ParabolInc/parabol/issues/9956)) ([0287026](https://github.com/ParabolInc/parabol/commit/02870268ea8b57e31aec28295cd6d5bac9797b8c))
* SAML return values from dataloader ([#9991](https://github.com/ParabolInc/parabol/issues/9991)) ([4f883fe](https://github.com/ParabolInc/parabol/commit/4f883fe7e557d4f6d121bc11ab68b30646d3d5e4))


### Changed

* parallelize codecheck ([#9983](https://github.com/ParabolInc/parabol/issues/9983)) ([cec7063](https://github.com/ParabolInc/parabol/commit/cec70635bb76dafb4bd71f661268268e34467e3c))

## [7.38.9](https://github.com/ParabolInc/parabol/compare/v7.38.8...v7.38.9) (2024-07-16)


### Fixed

* **postgresql:** install postgresql-server-dev-16 in the local postgres Docker image ([4d71de4](https://github.com/ParabolInc/parabol/commit/4d71de4a6804c819223e73eb85b47a55c2bccac8))
* pull pgvector from image ([#9981](https://github.com/ParabolInc/parabol/issues/9981)) ([f4a9f11](https://github.com/ParabolInc/parabol/commit/f4a9f11ff652a24edd2d92fb714bc8d293f7d76f))

## [7.38.8](https://github.com/ParabolInc/parabol/compare/v7.38.7...v7.38.8) (2024-07-15)


### Fixed

* add ClearAll dataloader method ([#9975](https://github.com/ParabolInc/parabol/issues/9975)) ([63bf930](https://github.com/ParabolInc/parabol/commit/63bf930989f1493f54d36407a990863519b80528))
* if the content of a task is only spaces, it gets deleted as if i… ([#9968](https://github.com/ParabolInc/parabol/issues/9968)) ([59eb73f](https://github.com/ParabolInc/parabol/commit/59eb73f78c2b9aebaca7f3562d9af1148e37c0ba))


### Changed

* **postgresql:** upgrade to v16 ([#9976](https://github.com/ParabolInc/parabol/issues/9976)) ([3e9e05b](https://github.com/ParabolInc/parabol/commit/3e9e05bc12ca6ddfdb50911157c92931c7a4895c))
* **rethinkdb:** OrganizationUser: Phase 3 ([#9965](https://github.com/ParabolInc/parabol/issues/9965)) ([0cff6dc](https://github.com/ParabolInc/parabol/commit/0cff6dcb7308b851b14eeeba08fd6229a59a228c))

## [7.38.7](https://github.com/ParabolInc/parabol/compare/v7.38.6...v7.38.7) (2024-07-11)


### Changed

* **rethinkdb:** OrganizationUser: Phase 2 ([#9953](https://github.com/ParabolInc/parabol/issues/9953)) ([89d4c4f](https://github.com/ParabolInc/parabol/commit/89d4c4faf3ee1152d7aa390792c713bcd150a416))

## [7.38.6](https://github.com/ParabolInc/parabol/compare/v7.38.5...v7.38.6) (2024-07-11)


### Changed

* Make meeting series naming consistent ([#9928](https://github.com/ParabolInc/parabol/issues/9928)) ([97bfc0f](https://github.com/ParabolInc/parabol/commit/97bfc0fad786577534c6519ef4654d3e587e228f))
* **rethinkdb:** OrganizationUser: Phase 1 ([#9952](https://github.com/ParabolInc/parabol/issues/9952)) ([f63c16e](https://github.com/ParabolInc/parabol/commit/f63c16e8fc17e1f7a34cc300667bafc993c85500))

## [7.38.5](https://github.com/ParabolInc/parabol/compare/v7.38.4...v7.38.5) (2024-07-11)


### Fixed

* Missing email summary for retros ([#9960](https://github.com/ParabolInc/parabol/issues/9960)) ([b4a9129](https://github.com/ParabolInc/parabol/commit/b4a91292cf941895d4766fbea545436101689a3c))

## [7.38.4](https://github.com/ParabolInc/parabol/compare/v7.38.3...v7.38.4) (2024-07-10)


### Changed

* **rethinkdb:** Organization: Phase 3 ([#9933](https://github.com/ParabolInc/parabol/issues/9933)) ([70084f8](https://github.com/ParabolInc/parabol/commit/70084f86b1832dc087b0bf7eb279253b61dacf01))

## [7.38.3](https://github.com/ParabolInc/parabol/compare/v7.38.2...v7.38.3) (2024-07-09)


### Changed

* **rethinkdb:** phase 4 of RetroReflection, RetroReflectionGroup and TimelineEvent ([#9943](https://github.com/ParabolInc/parabol/issues/9943)) ([151b029](https://github.com/ParabolInc/parabol/commit/151b0298013837c912bd2c58226519196d800a94))

## [7.38.2](https://github.com/ParabolInc/parabol/compare/v7.38.1...v7.38.2) (2024-07-08)


### Fixed

* Read embedder URL from env ([#9936](https://github.com/ParabolInc/parabol/issues/9936)) ([0a60ff9](https://github.com/ParabolInc/parabol/commit/0a60ff9b59b33d65ac532d80799f3e7425ee5e54))


### Changed

* **client:** when a release happens, links to the specific tag version ([#9937](https://github.com/ParabolInc/parabol/issues/9937)) ([9081e38](https://github.com/ParabolInc/parabol/commit/9081e38f2f44c87941abf35e97b30942f6c9ccd7))
* **postgres:** Postgres upgraded to 15.7 and pgvector to 0.7.0 ([#9941](https://github.com/ParabolInc/parabol/issues/9941)) ([ef6e626](https://github.com/ParabolInc/parabol/commit/ef6e62629a9eb1b9b4aec75b83ca004cf02919fc))
* **rethinkdb:** Organization: Phase 2 ([#9931](https://github.com/ParabolInc/parabol/issues/9931)) ([5baad4c](https://github.com/ParabolInc/parabol/commit/5baad4c9843a0189f40decfbcbd8ea7810599ea1))

## [7.38.1](https://github.com/ParabolInc/parabol/compare/v7.38.0...v7.38.1) (2024-07-04)


### Fixed

* Allow starting recurring meetings without GCal ([#9920](https://github.com/ParabolInc/parabol/issues/9920)) ([3f2ca48](https://github.com/ParabolInc/parabol/commit/3f2ca482aef98cf07a7f27b6a3872c9505735334))
* connectionContext always available ([#9923](https://github.com/ParabolInc/parabol/issues/9923)) ([1dce636](https://github.com/ParabolInc/parabol/commit/1dce6366ae968718dfa72c44553201a016863213))
* handle failed 3DS payments ([#9924](https://github.com/ParabolInc/parabol/issues/9924)) ([4663e9e](https://github.com/ParabolInc/parabol/commit/4663e9ea28f36dcf10bfe21347912865d22a8872))


### Changed

* **gitignore:** ignore anything on the backups folder ([068f91e](https://github.com/ParabolInc/parabol/commit/068f91e33e0d3c160c67f52f8008a177eb5c326d))
* Read Gitlab server URL from env for prime integrations ([#9910](https://github.com/ParabolInc/parabol/issues/9910)) ([830235d](https://github.com/ParabolInc/parabol/commit/830235ddb5afe4d3e0731181c76930ec0307609d))
* **rethinkdb:** Organization: Phase 1 ([#9883](https://github.com/ParabolInc/parabol/issues/9883)) ([6bb5fb2](https://github.com/ParabolInc/parabol/commit/6bb5fb2c2cfc0ba77679633acd2a21ac04fcbfd3))
* Show only available integrations ([#9908](https://github.com/ParabolInc/parabol/issues/9908)) ([04bfa6c](https://github.com/ParabolInc/parabol/commit/04bfa6c69c07be8a190542db4a5fb907e43d67ad))

## [7.38.0](https://github.com/ParabolInc/parabol/compare/v7.37.8...v7.38.0) (2024-07-02)


### Added

* Add search template mutation ([#9802](https://github.com/ParabolInc/parabol/issues/9802)) ([486f670](https://github.com/ParabolInc/parabol/commit/486f6703a997c827ffcd157c13e3fa1321e977ed))


### Fixed

* Allow to start recurrence for existing Standups ([#9909](https://github.com/ParabolInc/parabol/issues/9909)) ([ae577e2](https://github.com/ParabolInc/parabol/commit/ae577e28a791350f20dbd29779511f75f439224c))
* Avoid adding embedding jobs without metadata id ([#9881](https://github.com/ParabolInc/parabol/issues/9881)) ([4e2fec1](https://github.com/ParabolInc/parabol/commit/4e2fec1ea0e1b9eb442a799b0d3a2d66ef40772b))
* bugs during upgrade/downgrade ([#9919](https://github.com/ParabolInc/parabol/issues/9919)) ([c67a6a8](https://github.com/ParabolInc/parabol/commit/c67a6a87efc35fcb8f41e388d451b1a784a045e2))
* remove ai from summary url if no ai env var ([#9895](https://github.com/ParabolInc/parabol/issues/9895)) ([4413142](https://github.com/ParabolInc/parabol/commit/4413142e55c94388e1cfe78503cc420d2945c334))
* remove Organization.teams field from gql ([#9918](https://github.com/ParabolInc/parabol/issues/9918)) ([55b2dfb](https://github.com/ParabolInc/parabol/commit/55b2dfb425f89135a39bb38b02b5bc955ea2e5a0))
* speed up team upgrade ([#9902](https://github.com/ParabolInc/parabol/issues/9902)) ([d91f649](https://github.com/ParabolInc/parabol/commit/d91f649918ed471bc37332abdefcc6e07d737e6d))


### Changed

* Fix debug output when retrying after Cloudflare error ([#9912](https://github.com/ParabolInc/parabol/issues/9912)) ([d17345f](https://github.com/ParabolInc/parabol/commit/d17345ff90bc88cba673fbd3a9efb76848556449))
* remove contact us message for team users that want to downgrade ([#9903](https://github.com/ParabolInc/parabol/issues/9903)) ([7e90ac2](https://github.com/ParabolInc/parabol/commit/7e90ac2d1ba2144271779982272160c7c1b0df33))

## [7.37.8](https://github.com/ParabolInc/parabol/compare/v7.37.7...v7.37.8) (2024-06-27)


### Fixed

* timeline ordering ([#9898](https://github.com/ParabolInc/parabol/issues/9898)) ([9f5f38c](https://github.com/ParabolInc/parabol/commit/9f5f38c250fbb1d0af4aaed8526c19f0fc6fd111))

## [7.37.7](https://github.com/ParabolInc/parabol/compare/v7.37.6...v7.37.7) (2024-06-27)


### Changed

* **rethinkdb:** TimelineEvent: Phase 3 ([#9876](https://github.com/ParabolInc/parabol/issues/9876)) ([77b56ad](https://github.com/ParabolInc/parabol/commit/77b56ad296bd3ff69f2a8f3440a34a7b5f34c0cf))

## [7.37.6](https://github.com/ParabolInc/parabol/compare/v7.37.5...v7.37.6) (2024-06-27)


### Fixed

* can scroll public teams modal ([#9880](https://github.com/ParabolInc/parabol/issues/9880)) ([b4231b5](https://github.com/ParabolInc/parabol/commit/b4231b5e249b853c49bf2ac7bc736b7e47447956))
* download pdf shows multiple pages ([#9889](https://github.com/ParabolInc/parabol/issues/9889)) ([edb7e58](https://github.com/ParabolInc/parabol/commit/edb7e5882a0fcf0be6bae7fc21fa174b2d9b6195))
* User can change team in Activity Library ([#9893](https://github.com/ParabolInc/parabol/issues/9893)) ([ce7e8bb](https://github.com/ParabolInc/parabol/commit/ce7e8bb6aea40d053e707b40c2b9b5bfdc981702))

## [7.37.5](https://github.com/ParabolInc/parabol/compare/v7.37.4...v7.37.5) (2024-06-26)


### Fixed

* handle sql null equalities ([#9884](https://github.com/ParabolInc/parabol/issues/9884)) ([87363fa](https://github.com/ParabolInc/parabol/commit/87363fa4168ac97869bd5b71571c7ecc5c7fb903))


### Changed

* **rethinkdb:** TimelineEvent: Phase 2 ([#9875](https://github.com/ParabolInc/parabol/issues/9875)) ([1c8b116](https://github.com/ParabolInc/parabol/commit/1c8b116c15818f328e448467b789c9f3f3c11c12))

## [7.37.4](https://github.com/ParabolInc/parabol/compare/v7.37.3...v7.37.4) (2024-06-26)


### Fixed

* Don't reset failed embedding jobs ([#9877](https://github.com/ParabolInc/parabol/issues/9877)) ([882443c](https://github.com/ParabolInc/parabol/commit/882443c60c80ddc74e45b9ba7a375db43a0d4494))
* refactor new meeting team dropdown ([#9679](https://github.com/ParabolInc/parabol/issues/9679)) ([0300ce5](https://github.com/ParabolInc/parabol/commit/0300ce5241e2b4dee848ad5978e97e1c802510cd))


### Changed

* **rethinkdb:** RetroReflection: Phase 3 ([#9867](https://github.com/ParabolInc/parabol/issues/9867)) ([7b8f505](https://github.com/ParabolInc/parabol/commit/7b8f50549df0b1e1251fe8275c41c602d072e441))
* **rethinkdb:** TimelineEvent: Phase 1 ([#9871](https://github.com/ParabolInc/parabol/issues/9871)) ([c6a028b](https://github.com/ParabolInc/parabol/commit/c6a028bc357ee411e42f68e0f5beeddadf6fe6fd))

## [7.37.3](https://github.com/ParabolInc/parabol/compare/v7.37.2...v7.37.3) (2024-06-25)


### Changed

* **rethinkdb:** RetroReflection: Phase 2 ([#9834](https://github.com/ParabolInc/parabol/issues/9834)) ([ab1e3bd](https://github.com/ParabolInc/parabol/commit/ab1e3bdb7334b2254ab9513ee907c3e71754d016))

## [7.37.2](https://github.com/ParabolInc/parabol/compare/v7.37.1...v7.37.2) (2024-06-25)


### Changed

* **rethinkdb:** RetroReflection: Phase 1 ([#9820](https://github.com/ParabolInc/parabol/issues/9820)) ([92247eb](https://github.com/ParabolInc/parabol/commit/92247ebeb0afa7910d2d930d0f26d1ee80e5880a))

## [7.37.1](https://github.com/ParabolInc/parabol/compare/v7.37.0...v7.37.1) (2024-06-25)


### Fixed

* ensure dashboard sidebar animates smoothly ([#9865](https://github.com/ParabolInc/parabol/issues/9865)) ([73cdb7c](https://github.com/ParabolInc/parabol/commit/73cdb7cc64844f0a5baad81202695d518897d176))
* remove AI UI if user doesn't have access to AI ([#9856](https://github.com/ParabolInc/parabol/issues/9856)) ([95431b2](https://github.com/ParabolInc/parabol/commit/95431b26f534e000fa0e2113f8cd490f96c88982))

## [7.37.0](https://github.com/ParabolInc/parabol/compare/v7.36.0...v7.37.0) (2024-06-24)


### Added

* Add MeetingTemplate update embeddings trigger ([#9838](https://github.com/ParabolInc/parabol/issues/9838)) ([87e0d86](https://github.com/ParabolInc/parabol/commit/87e0d8607ded642859bd23acbc4cab2d87171b9d))
* Create embeddings for meeting templates ([#9776](https://github.com/ParabolInc/parabol/issues/9776)) ([095cf71](https://github.com/ParabolInc/parabol/commit/095cf71348bd486a71e1f19f48be0718cbca9840))
* update dashboard nav item styles ([#9795](https://github.com/ParabolInc/parabol/issues/9795)) ([71b17c2](https://github.com/ParabolInc/parabol/commit/71b17c2d05d1f75e6eff98e94d45953ad9907c6b))
* Update MeetingTemplate.updatedAt on prompt changes ([#9829](https://github.com/ParabolInc/parabol/issues/9829)) ([e614253](https://github.com/ParabolInc/parabol/commit/e614253d55aef39cb14f8c73ba160ee74701be1d))


### Fixed

* add meeting block is now 70px ([#9848](https://github.com/ParabolInc/parabol/issues/9848)) ([8ab3b72](https://github.com/ParabolInc/parabol/commit/8ab3b72be6b9aa51da8ba9d84225051e299fd7b9))
* clicking scope link does not affect checkbox ([#9859](https://github.com/ParabolInc/parabol/issues/9859)) ([b79943d](https://github.com/ParabolInc/parabol/commit/b79943d3efe198a820ce9a1fe740d5dd30e1ea73))
* hide ai icebreaker ui for non ai users ([#9824](https://github.com/ParabolInc/parabol/issues/9824)) ([6cf4098](https://github.com/ParabolInc/parabol/commit/6cf4098e572494e7db59d20fe9faaa72e9285568))
* Retry S3 upload after cloudflare error ([#9819](https://github.com/ParabolInc/parabol/issues/9819)) ([bd37d85](https://github.com/ParabolInc/parabol/commit/bd37d85ed95f4d0186b129421c2b1e5dedef3ea8))
* update promote team member copy ([#9849](https://github.com/ParabolInc/parabol/issues/9849)) ([de659aa](https://github.com/ParabolInc/parabol/commit/de659aa9f1a2ce406a133527ff4ab74fad951c18))


### Changed

* Avoid undefined in embeddings for Poker scales ([#9854](https://github.com/ParabolInc/parabol/issues/9854)) ([f9ca53b](https://github.com/ParabolInc/parabol/commit/f9ca53bd440be1ef16189a893f04028a5ce40d37))
* **ci:** release-to jobs for both staging and production will notify Slack whenever they fail ([#9850](https://github.com/ParabolInc/parabol/issues/9850)) ([4604716](https://github.com/ParabolInc/parabol/commit/4604716afa1b84a6b567f16f74bc168139259a16))
* **deps:** bump @grpc/grpc-js from 1.10.6 to 1.10.9 ([#9840](https://github.com/ParabolInc/parabol/issues/9840)) ([6aec87f](https://github.com/ParabolInc/parabol/commit/6aec87f7ec4d4abc1b395552161f4cbaf85334de))
* Reduce language detection threshold for MeetingTemplates ([#9855](https://github.com/ParabolInc/parabol/issues/9855)) ([03bd7dd](https://github.com/ParabolInc/parabol/commit/03bd7dda258e39d8e2687d1b8833ea60c82cec4f))
* remove summary from retro reflection group ([#9851](https://github.com/ParabolInc/parabol/issues/9851)) ([ecc9cb1](https://github.com/ParabolInc/parabol/commit/ecc9cb1ecfb220b6e8004cb03fa9ae578c59fde4))
* Update fullText when embedding is older than reference ([#9857](https://github.com/ParabolInc/parabol/issues/9857)) ([71484a3](https://github.com/ParabolInc/parabol/commit/71484a39661b648923de83d2d2ce3c9257d8ab2d))
* Update MeetingTemplate embeddings on insert ([#9853](https://github.com/ParabolInc/parabol/issues/9853)) ([8ab679c](https://github.com/ParabolInc/parabol/commit/8ab679c9032586cacbd8d3382d58b23c8d765c52))

## [7.36.0](https://github.com/ParabolInc/parabol/compare/v7.35.1...v7.36.0) (2024-06-10)


### Added

* security banner concept ([#9780](https://github.com/ParabolInc/parabol/issues/9780)) ([b683dc8](https://github.com/ParabolInc/parabol/commit/b683dc83426bfa96eee20b0ceb4d90640b9eb9b6))


### Fixed

* Add teamId index to SuggestedAction ([#9831](https://github.com/ParabolInc/parabol/issues/9831)) ([eb88af6](https://github.com/ParabolInc/parabol/commit/eb88af6fbafb19e748803fd6423ba17be0e51e74))


### Changed

* refactor ReflectionGroup to SDL pattern ([#9807](https://github.com/ParabolInc/parabol/issues/9807)) ([695646c](https://github.com/ParabolInc/parabol/commit/695646c6885c31e2049a1ac76fd3f4b9b589f5da))

## [7.35.1](https://github.com/ParabolInc/parabol/compare/v7.35.0...v7.35.1) (2024-06-04)


### Fixed

* remove custom activity badge ([#9812](https://github.com/ParabolInc/parabol/issues/9812)) ([652a9c0](https://github.com/ParabolInc/parabol/commit/652a9c034267f9c53f4cf9c04b4f29b6f854eb1c))


### Changed

* read ReflectionGroups from PG ([#9801](https://github.com/ParabolInc/parabol/issues/9801)) ([52b80b5](https://github.com/ParabolInc/parabol/commit/52b80b5cdb7fa4834004516bc8fc997fda9c3369))

## [7.35.0](https://github.com/ParabolInc/parabol/compare/v7.34.0...v7.35.0) (2024-05-30)


### Added

* type safety for gql perms ([#9798](https://github.com/ParabolInc/parabol/issues/9798)) ([712f79e](https://github.com/ParabolInc/parabol/commit/712f79eb81087b3a86301de3e611703a8ef46826))


### Fixed

* clear kudos received notifications ([#9805](https://github.com/ParabolInc/parabol/issues/9805)) ([74d8dbc](https://github.com/ParabolInc/parabol/commit/74d8dbc76366959be4274bde1d12d7978a146a2c))

## [7.34.0](https://github.com/ParabolInc/parabol/compare/v7.33.0...v7.34.0) (2024-05-30)


### Added

* Add Jira Server to Your Work ([#9794](https://github.com/ParabolInc/parabol/issues/9794)) ([eec025e](https://github.com/ParabolInc/parabol/commit/eec025e3e22202c0c4c5630d2e6a75db76e3008f))


### Changed

* Allow global Jira Server integration provider ([#9796](https://github.com/ParabolInc/parabol/issues/9796)) ([051e51c](https://github.com/ParabolInc/parabol/commit/051e51c7746dfb50c4853b07ecc5bf548bd99a4e))
* remove kudos ([#9785](https://github.com/ParabolInc/parabol/issues/9785)) ([23d48c4](https://github.com/ParabolInc/parabol/commit/23d48c48c01471be8e1332765f5d7cd9f0168954))

## [7.33.0](https://github.com/ParabolInc/parabol/compare/v7.32.1...v7.33.0) (2024-05-29)


### Added

* **stripe:** handle Stripe subscription events ([#9768](https://github.com/ParabolInc/parabol/issues/9768)) ([2243667](https://github.com/ParabolInc/parabol/commit/224366762fcc11b1bfb3140317f444a10e5c0838))
* update plan upgrade CTA label ([#9769](https://github.com/ParabolInc/parabol/issues/9769)) ([413f5b6](https://github.com/ParabolInc/parabol/commit/413f5b6349a3c7689d6dbf6b2b49df99d6b68412))
* update promote team copy ([#9767](https://github.com/ParabolInc/parabol/issues/9767)) ([462a7f4](https://github.com/ParabolInc/parabol/commit/462a7f45eac7193a3c64f5971a7ecec085dffb25))
* write equality checker to file store ([#9786](https://github.com/ParabolInc/parabol/issues/9786)) ([adcabbc](https://github.com/ParabolInc/parabol/commit/adcabbc186ebbbd124f0a596fead9b85b035f438))


### Fixed

* bump trebuchet-client to latest version ([#9797](https://github.com/ParabolInc/parabol/issues/9797)) ([da350e7](https://github.com/ParabolInc/parabol/commit/da350e73705604277cc0faa81b6dab9010927d4c))
* team lead can view teams in org settings ([#9739](https://github.com/ParabolInc/parabol/issues/9739)) ([2699c3d](https://github.com/ParabolInc/parabol/commit/2699c3db7f2ca86257c6e5da475ec47af473c8a9))


### Changed

* Update processRecurrence tests ([#9770](https://github.com/ParabolInc/parabol/issues/9770)) ([222d6f9](https://github.com/ParabolInc/parabol/commit/222d6f94b9387dfbcff347f2bbcac8eef98bfe97))

## [7.32.1](https://github.com/ParabolInc/parabol/compare/v7.32.0...v7.32.1) (2024-05-22)


### Fixed

* Revert @aws-sdk/client-s3 upgrade ([#9763](https://github.com/ParabolInc/parabol/issues/9763)) ([8fc0ec1](https://github.com/ParabolInc/parabol/commit/8fc0ec11f8e45033c5291feef59d298b36dbfc7c))

## [7.32.0](https://github.com/ParabolInc/parabol/compare/v7.31.0...v7.32.0) (2024-05-21)


### Added

* add favorite activities UI to activity library ([#9680](https://github.com/ParabolInc/parabol/issues/9680)) ([d6a775d](https://github.com/ParabolInc/parabol/commit/d6a775d4e8f5383588938e163b1e44025afa6624))
* add logic that lets users favorite a template ([#9713](https://github.com/ParabolInc/parabol/issues/9713)) ([4558e14](https://github.com/ParabolInc/parabol/commit/4558e143c98c2ceab197b7c00670cc56ae7c6436))
* saml upload ([#9750](https://github.com/ParabolInc/parabol/issues/9750)) ([5c40fcf](https://github.com/ParabolInc/parabol/commit/5c40fcfb1d6df9ac32c2f2277735169f0e1ae95d))
* **single-tenant-host:** Embedder and Text Embeddings Inference added to the stack ([#9753](https://github.com/ParabolInc/parabol/issues/9753)) ([5ec8f45](https://github.com/ParabolInc/parabol/commit/5ec8f457f44780036da79b54136f3c68c5bb052c))


### Fixed

* close websocket with reason on invalid token ([#9744](https://github.com/ParabolInc/parabol/issues/9744)) ([a5d4bad](https://github.com/ParabolInc/parabol/commit/a5d4badf63781ddf9023fcc169d4b90f0f9d646f))
* **dev-stack:** update text-embeddings-inference to 1.2.2 ([#9754](https://github.com/ParabolInc/parabol/issues/9754)) ([1c8fa84](https://github.com/ParabolInc/parabol/commit/1c8fa84444dc361d6bb8938d55accad31be2b6e7))
* fix the issue where a successful upgrade won't refresh the billing page ([#9740](https://github.com/ParabolInc/parabol/issues/9740)) ([9a904d3](https://github.com/ParabolInc/parabol/commit/9a904d3a35b0f82ffd67d6e7d4853b40cfc4f234))
* Send correct websocket status code ([#9760](https://github.com/ParabolInc/parabol/issues/9760)) ([ca20d75](https://github.com/ParabolInc/parabol/commit/ca20d75d86b467eef64c7e08419434a7f4be5946))
* Update remove user from org copy ([#9759](https://github.com/ParabolInc/parabol/issues/9759)) ([a39cd41](https://github.com/ParabolInc/parabol/commit/a39cd41baa3a696600af5299b281fbb2729fa7af))


### Changed

* Trace RRule ([#9756](https://github.com/ParabolInc/parabol/issues/9756)) ([341772a](https://github.com/ParabolInc/parabol/commit/341772af9da5923e7c22b8a253aaca0b2aeab7c5))
* update tutorial card thumbnail & video links ([#9746](https://github.com/ParabolInc/parabol/issues/9746)) ([28c7432](https://github.com/ParabolInc/parabol/commit/28c743274df3c8ed97e3e8dbe2677a58483a851e))

## [7.31.0](https://github.com/ParabolInc/parabol/compare/v7.30.4...v7.31.0) (2024-05-08)


### Added

* increase team subscription to $8 ([#9727](https://github.com/ParabolInc/parabol/issues/9727)) ([9d2fa5f](https://github.com/ParabolInc/parabol/commit/9d2fa5f4a53cecb3748406012ca1bd0eeaa6800c))


### Fixed

* Handle invitation links with invalid auth token ([#9741](https://github.com/ParabolInc/parabol/issues/9741)) ([162de5e](https://github.com/ParabolInc/parabol/commit/162de5e87865faa190e5bbe16e25432aeb29e58b))
* only query templates when a user clicks the options menu ([#9651](https://github.com/ParabolInc/parabol/issues/9651)) ([7c75eb1](https://github.com/ParabolInc/parabol/commit/7c75eb1816162394dd2362e32d985521e860fd54))
* org admin can change team lead ([#9742](https://github.com/ParabolInc/parabol/issues/9742)) ([d5520ae](https://github.com/ParabolInc/parabol/commit/d5520aebc6b518382510eb1ef2c5c4c10dad70e6))


### Changed

* More processRecurrence tracing ([#9736](https://github.com/ParabolInc/parabol/issues/9736)) ([881546c](https://github.com/ParabolInc/parabol/commit/881546c2240edb5be399e2b25e2d3e108d61f9fc))
* remove ai summary from discussion thread ([#9708](https://github.com/ParabolInc/parabol/issues/9708)) ([2123159](https://github.com/ParabolInc/parabol/commit/2123159e718395a63589ce4f76578e271d1b2c9b))
* remove discussion prompt from summary ([#9711](https://github.com/ParabolInc/parabol/issues/9711)) ([a02c935](https://github.com/ParabolInc/parabol/commit/a02c935d1f16f1ec6e4be410ac826fd239f36179))

## [7.30.4](https://github.com/ParabolInc/parabol/compare/v7.30.3...v7.30.4) (2024-05-07)


### Changed

* add more granular process recurrence tracing ([#9728](https://github.com/ParabolInc/parabol/issues/9728)) ([85d4e22](https://github.com/ParabolInc/parabol/commit/85d4e22576083e89a655ac507f744cb1482e1506))
* Remove deprecated userId from Atmosphere ([#9720](https://github.com/ParabolInc/parabol/issues/9720)) ([b4f21d6](https://github.com/ParabolInc/parabol/commit/b4f21d6db7ee0d0b17815d1a0d7b7c86ac0ef3bb))

## [7.30.3](https://github.com/ParabolInc/parabol/compare/v7.30.2...v7.30.3) (2024-05-07)


### Changed

* Add some processRecurrence tracing ([#9723](https://github.com/ParabolInc/parabol/issues/9723)) ([6c4369d](https://github.com/ParabolInc/parabol/commit/6c4369dd2648611883e09f7353c03d9d24ff1b84))

## [7.30.2](https://github.com/ParabolInc/parabol/compare/v7.30.1...v7.30.2) (2024-05-07)


### Fixed

* remove logs from embedder ([#9718](https://github.com/ParabolInc/parabol/issues/9718)) ([93b26bb](https://github.com/ParabolInc/parabol/commit/93b26bb4fd94615d683f1f9fb69386f6104005fd))


### Changed

* Gracefully shutdown the embedder ([#9693](https://github.com/ParabolInc/parabol/issues/9693)) ([695ccad](https://github.com/ParabolInc/parabol/commit/695ccadd5f67e57786b65a036e9368c27c9b619c))

## [7.30.1](https://github.com/ParabolInc/parabol/compare/v7.30.0...v7.30.1) (2024-05-02)


### Fixed

* presign MeetingTemplate.illustrationUrl ([#9705](https://github.com/ParabolInc/parabol/issues/9705)) ([1736e43](https://github.com/ParabolInc/parabol/commit/1736e43297ab5359f044872ce08cddb4ca9883ee))
* Refactor active meeting dropdown to get rid of some edge case bugs ([#9658](https://github.com/ParabolInc/parabol/issues/9658)) ([0dca699](https://github.com/ParabolInc/parabol/commit/0dca699556d0e671617dbac0fdbddb98a8b2237e))


### Changed

* [Snyk] Upgrade graphql from 15.7.2 to 15.8.0 ([#9639](https://github.com/ParabolInc/parabol/issues/9639)) ([723a28f](https://github.com/ParabolInc/parabol/commit/723a28f0dc3e4f55200091ec795af05faaad731a))
* Add custom label to templates ([#9703](https://github.com/ParabolInc/parabol/issues/9703)) ([e61473e](https://github.com/ParabolInc/parabol/commit/e61473e53b2ddbbb5eb2b7ee3078b866781fcf5b))
* **deps:** bump ejs from 3.1.8 to 3.1.10 ([#9699](https://github.com/ParabolInc/parabol/issues/9699)) ([acab843](https://github.com/ParabolInc/parabol/commit/acab84340e377bd6a64e6335b5c2e6bacb72f5a4))

## [7.30.0](https://github.com/ParabolInc/parabol/compare/v7.29.1...v7.30.0) (2024-05-01)


### Added

* support private S3 buckets ([#9697](https://github.com/ParabolInc/parabol/issues/9697)) ([db17c9d](https://github.com/ParabolInc/parabol/commit/db17c9dfdbf3dfa01dfc06087eda686792d8d63b))


### Fixed

* remove oneOnOne column in Team table ([#9696](https://github.com/ParabolInc/parabol/issues/9696)) ([aa97e05](https://github.com/ParabolInc/parabol/commit/aa97e05df97f9592d5a6366b298d1cb99c1533e3))

## [7.29.1](https://github.com/ParabolInc/parabol/compare/v7.29.0...v7.29.1) (2024-04-30)


### Fixed

* copy fonts from static ([#9690](https://github.com/ParabolInc/parabol/issues/9690)) ([9e6947a](https://github.com/ParabolInc/parabol/commit/9e6947ae42d9f0dd20aba6c982e0ec8512c8eb94))
* install plex on system ([#9689](https://github.com/ParabolInc/parabol/issues/9689)) ([95a95a1](https://github.com/ParabolInc/parabol/commit/95a95a1748f142a7ff25bdcf1aa1ac2e3f1d9de4))
* Optimize processRecurrence ([#9670](https://github.com/ParabolInc/parabol/issues/9670)) ([eb6e608](https://github.com/ParabolInc/parabol/commit/eb6e608f5d4e6ae3b683b621d2090102b5879b45))


### Changed

* bump packages core-js humanize-duration ([#9687](https://github.com/ParabolInc/parabol/issues/9687)) ([f066ab0](https://github.com/ParabolInc/parabol/commit/f066ab016f01afdd3916b2f52d669499fe454754))
* **docker:** fonts are managed with the rest of app related stuff ([#9692](https://github.com/ParabolInc/parabol/issues/9692)) ([fd30cfa](https://github.com/ParabolInc/parabol/commit/fd30cfaca79100268e0231a92ef97fd4ba7b902b))

## [7.29.0](https://github.com/ParabolInc/parabol/compare/v7.28.1...v7.29.0) (2024-04-29)


### Added

* initial avatars on the fly ([#9675](https://github.com/ParabolInc/parabol/issues/9675)) ([e783662](https://github.com/ParabolInc/parabol/commit/e7836627f9a36315af9b8bbd262e60f46b680920))

## [7.28.1](https://github.com/ParabolInc/parabol/compare/v7.28.0...v7.28.1) (2024-04-29)


### Fixed

* handle 0 discussions ([#9682](https://github.com/ParabolInc/parabol/issues/9682)) ([cedc91c](https://github.com/ParabolInc/parabol/commit/cedc91c9febb47d7b2fa5c24b7a6012b06a4cf95))
* Sidebar in start custom activity ([#9647](https://github.com/ParabolInc/parabol/issues/9647)) ([a1658d8](https://github.com/ParabolInc/parabol/commit/a1658d8e02534e90a5da1a30860995c4aa714fe2))


### Changed

* Remove adhoc teams ([#9678](https://github.com/ParabolInc/parabol/issues/9678)) ([b28ccc2](https://github.com/ParabolInc/parabol/commit/b28ccc2f62614d903c1f268d98d5923de5d6e1f8))

## [7.28.0](https://github.com/ParabolInc/parabol/compare/v7.27.2...v7.28.0) (2024-04-25)


### Added

* **orgAdmin:** org admin can promote others to org admin ([#9655](https://github.com/ParabolInc/parabol/issues/9655)) ([01372bc](https://github.com/ParabolInc/parabol/commit/01372bc29b14681db8094c0b55cc3d3f2f2418ea))
* roll out ai icebreakers ([#9660](https://github.com/ParabolInc/parabol/issues/9660)) ([898e1fd](https://github.com/ParabolInc/parabol/commit/898e1fddfa342014d8db162215babe8079652f84))


### Fixed

* can update gcal start datetime ([#9668](https://github.com/ParabolInc/parabol/issues/9668)) ([42c432e](https://github.com/ParabolInc/parabol/commit/42c432eb0ea9112ef28652d75cc784c3b3dd79fd))
* Increase process recurrence timeout ([#9665](https://github.com/ParabolInc/parabol/issues/9665)) ([f4e0cda](https://github.com/ParabolInc/parabol/commit/f4e0cda947c5407a651a73f6675cca27a2ea55dd))
* remove premium badges from activity library cards ([#9669](https://github.com/ParabolInc/parabol/issues/9669)) ([f3f0588](https://github.com/ParabolInc/parabol/commit/f3f058803b16ec06840a0b673d8299663ff3d533))
* support PG reconnects ([#9663](https://github.com/ParabolInc/parabol/issues/9663)) ([32574a6](https://github.com/ParabolInc/parabol/commit/32574a650697a3ee5e43aac33478c9ac7eab6966))
* Threaded reply input does not immediately close ([#9652](https://github.com/ParabolInc/parabol/issues/9652)) ([9944ac0](https://github.com/ParabolInc/parabol/commit/9944ac046c0ea2186be149147ca630190d92faef))


### Changed

* remove noTemplateLimit flag ([#9631](https://github.com/ParabolInc/parabol/issues/9631)) ([fb76d9a](https://github.com/ParabolInc/parabol/commit/fb76d9a3ec977e886dcc778b96fc2a5abfd4716c))
* update activity library custom tab empty state ([#9666](https://github.com/ParabolInc/parabol/issues/9666)) ([240e78d](https://github.com/ParabolInc/parabol/commit/240e78d9c7003b748a4c31353e869278c2bb528c))

## [7.27.2](https://github.com/ParabolInc/parabol/compare/v7.27.1...v7.27.2) (2024-04-17)


### Fixed

* change retro group schema to allow for rethinkdb table migration ([#9653](https://github.com/ParabolInc/parabol/issues/9653)) ([0092d0b](https://github.com/ParabolInc/parabol/commit/0092d0baf6852e820384ae114f59e23294fed0e9))

## [7.27.1](https://github.com/ParabolInc/parabol/compare/v7.27.0...v7.27.1) (2024-04-16)


### Fixed

* add prettier-plugin-organize-imports ([#9637](https://github.com/ParabolInc/parabol/issues/9637)) ([7d1086d](https://github.com/ParabolInc/parabol/commit/7d1086d4c1e5b0466617b007bb96c6642b4d5015))
* margin spacing on hover ([#9635](https://github.com/ParabolInc/parabol/issues/9635)) ([4f25cba](https://github.com/ParabolInc/parabol/commit/4f25cba7393f28bb2f0269db1b1916e9792df4a7))
* Migrate webpack dev server settings to v5 ([#9644](https://github.com/ParabolInc/parabol/issues/9644)) ([a21f1d0](https://github.com/ParabolInc/parabol/commit/a21f1d0895aaf987299104891e2b9c2e343a1635))
* vuln patch for undici ([#9622](https://github.com/ParabolInc/parabol/issues/9622)) ([c2a3a43](https://github.com/ParabolInc/parabol/commit/c2a3a4300c94da8c3dcf5edc33c2e2b38df8686f))


### Changed

* add ip-to-server script dir to zip file ([#9645](https://github.com/ParabolInc/parabol/issues/9645)) ([19a6689](https://github.com/ParabolInc/parabol/commit/19a66898f841905b801161a9576385d6480d631e))
* **docker:** delete all files used by old PPMIs and old Docker images ([#9648](https://github.com/ParabolInc/parabol/issues/9648)) ([a01cf2b](https://github.com/ParabolInc/parabol/commit/a01cf2bd2324fe62fa4af3044f06c94d6f14b087))
* fix ironbank action file copy ([#9638](https://github.com/ParabolInc/parabol/issues/9638)) ([e3635ee](https://github.com/ParabolInc/parabol/commit/e3635ee335f59c1be0ca43c254a15e126e6e24d5))
* Improve Activity Library focus and hover states ([#9626](https://github.com/ParabolInc/parabol/issues/9626)) ([6f1c1d9](https://github.com/ParabolInc/parabol/commit/6f1c1d9378536bd212032c84e0f35e074cca0941))
* migration reflection groups to pg ([#9514](https://github.com/ParabolInc/parabol/issues/9514)) ([ddb4244](https://github.com/ParabolInc/parabol/commit/ddb424480b7bb45c0aaae65afb0264c7b9a30091))
* Remove old template editing logic ([#9627](https://github.com/ParabolInc/parabol/issues/9627)) ([8552d43](https://github.com/ParabolInc/parabol/commit/8552d43e63fa1cf548da54460c49947d5772ae61))

## [7.27.0](https://github.com/ParabolInc/parabol/compare/v7.26.0...v7.27.0) (2024-04-11)


### Added

* Make top team templates clickable ([#9630](https://github.com/ParabolInc/parabol/issues/9630)) ([e4f8d49](https://github.com/ParabolInc/parabol/commit/e4f8d49c544be1d37388596b1afa086d9eb30a5c))
* Release activity library for everyone ([#9617](https://github.com/ParabolInc/parabol/issues/9617)) ([92a1dbd](https://github.com/ParabolInc/parabol/commit/92a1dbd18dc25c0046f573a3e46158f5cecdbf17))
* release recurring retros ([#9625](https://github.com/ParabolInc/parabol/issues/9625)) ([a4f10d1](https://github.com/ParabolInc/parabol/commit/a4f10d193bb38990d8400183c6d320522d2db71e))


### Fixed

* Only list available categories in edit template ([#9628](https://github.com/ParabolInc/parabol/issues/9628)) ([fba3b80](https://github.com/ParabolInc/parabol/commit/fba3b80bfdbdb5ab368117a4f3f6bbe4742d1607))
* use radix-ui for avatars ([#9633](https://github.com/ParabolInc/parabol/issues/9633)) ([38c8e61](https://github.com/ParabolInc/parabol/commit/38c8e61bcc6a199abf0165f49bb0dd7d693962e3))


### Changed

* Add absolute date tooltip in history ([#9629](https://github.com/ParabolInc/parabol/issues/9629)) ([65f3119](https://github.com/ParabolInc/parabol/commit/65f311920432416f547e83831cfcdfef2dc570af))
* remove old new meeting dialog ([#9621](https://github.com/ParabolInc/parabol/issues/9621)) ([b337d17](https://github.com/ParabolInc/parabol/commit/b337d17ff41c4ab4179073ed2eb59a1244998180))

## [7.26.0](https://github.com/ParabolInc/parabol/compare/v7.25.4...v7.26.0) (2024-04-10)


### Added

* related discussions refactor ([#9557](https://github.com/ParabolInc/parabol/issues/9557)) ([15a54fb](https://github.com/ParabolInc/parabol/commit/15a54fbbb24ece533c8d20422950b0839969500b))


### Fixed

* bump prettier version ([#9618](https://github.com/ParabolInc/parabol/issues/9618)) ([82ac337](https://github.com/ParabolInc/parabol/commit/82ac337949e6767728a695a7c60f14b4257c5334))


### Changed

* disable change template ui if phase complete ([#9592](https://github.com/ParabolInc/parabol/issues/9592)) ([fc1b9e7](https://github.com/ParabolInc/parabol/commit/fc1b9e7e364c15fafa19d502b061c96cc1e07837))
* remove build steps from readme and reference build.yml ([#9558](https://github.com/ParabolInc/parabol/issues/9558)) ([0e06d1f](https://github.com/ParabolInc/parabol/commit/0e06d1fcabaf563583a0c4776857ec1b0d07cf7b))

## [7.25.4](https://github.com/ParabolInc/parabol/compare/v7.25.3...v7.25.4) (2024-04-09)


### Fixed

* Revert "[Snyk] Upgrade graphql from 15.7.2 to 15.8.0 ([#9569](https://github.com/ParabolInc/parabol/issues/9569))" ([#9614](https://github.com/ParabolInc/parabol/issues/9614)) ([ecc2cdc](https://github.com/ParabolInc/parabol/commit/ecc2cdc4b67e1788763af601984e1cbf76f02235))

## [7.25.3](https://github.com/ParabolInc/parabol/compare/v7.25.2...v7.25.3) (2024-04-09)


### Fixed

* Add AuthIdentityMicrosoft ([#9612](https://github.com/ParabolInc/parabol/issues/9612)) ([e3d8b38](https://github.com/ParabolInc/parabol/commit/e3d8b3899845b565e91259217e96f222d116b70c))
* remove top level graphql-relay dependency ([#9611](https://github.com/ParabolInc/parabol/issues/9611)) ([72fc294](https://github.com/ParabolInc/parabol/commit/72fc2940bb912f9c81056d2d3ac539602a6aa8b2))


### Changed

* **segment:** remove Segment ([#9599](https://github.com/ParabolInc/parabol/issues/9599)) ([537a8af](https://github.com/ParabolInc/parabol/commit/537a8afce7702251337bc8946a6703c25d668133))

## [7.25.2](https://github.com/ParabolInc/parabol/compare/v7.25.1...v7.25.2) (2024-04-08)


### Fixed

* return 100 gitlab pipeline jobs ([#9607](https://github.com/ParabolInc/parabol/issues/9607)) ([7a26009](https://github.com/ParabolInc/parabol/commit/7a26009931fdb55d298390eb7871937d3a09eca7))

## [7.25.1](https://github.com/ParabolInc/parabol/compare/v7.25.0...v7.25.1) (2024-04-08)


### Fixed

* fallback for missing avatar images ([#9603](https://github.com/ParabolInc/parabol/issues/9603)) ([1a7e298](https://github.com/ParabolInc/parabol/commit/1a7e298a6fbd4c6a06acdfdca4d815029811178f))
* fix an issue where upcoming invoice doesn't have the nextPeriodCharges field ([#9580](https://github.com/ParabolInc/parabol/issues/9580)) ([cb52596](https://github.com/ParabolInc/parabol/commit/cb52596c2f69b4b6e1641654610bb2335cefd0f2))
* fix the issue where timer doesn't work in TEAM_HEALTH phase ([#9597](https://github.com/ParabolInc/parabol/issues/9597)) ([96f29b5](https://github.com/ParabolInc/parabol/commit/96f29b56e7a5bd63cb8ec5c879a7c2fb80ef803d))
* type error in invite email ([#9606](https://github.com/ParabolInc/parabol/issues/9606)) ([6ead321](https://github.com/ParabolInc/parabol/commit/6ead321741734cff47a953b3b1ac1e8999f16594))


### Changed

* Add inviter name to invite email subject ([#9604](https://github.com/ParabolInc/parabol/issues/9604)) ([cd5a3a8](https://github.com/ParabolInc/parabol/commit/cd5a3a844a90d5160f11ff38ee63b3db87894b20))
* update ironbank GH action to copy ip-to-server-id script ([#9594](https://github.com/ParabolInc/parabol/issues/9594)) ([89aeea3](https://github.com/ParabolInc/parabol/commit/89aeea362ac46d365cb2ff9ab9971c30f816103c))

## [7.25.0](https://github.com/ParabolInc/parabol/compare/v7.24.1...v7.25.0) (2024-04-04)


### Added

* update pricing page with template changes ([#9596](https://github.com/ParabolInc/parabol/issues/9596)) ([01f69de](https://github.com/ParabolInc/parabol/commit/01f69de9eb809ef16ac954e5d75ac884b11f8342))


### Fixed

* Add graphql-relay to predeploy ([#9595](https://github.com/ParabolInc/parabol/issues/9595)) ([b92d96e](https://github.com/ParabolInc/parabol/commit/b92d96e2972560ee16f83d90a82ebbb946e39dc0))
* Don't reuse another team members integrated task ([#9600](https://github.com/ParabolInc/parabol/issues/9600)) ([9794033](https://github.com/ParabolInc/parabol/commit/9794033249ee5c20a8f014a8b5ae38ce87294ead))
* **single-tenant:** application upgrades do not need --profile databases ([#9593](https://github.com/ParabolInc/parabol/issues/9593)) ([9486587](https://github.com/ParabolInc/parabol/commit/9486587c9f7d4b1c40a0eff549e819ed4565aa23))
* trim inet address ([#9598](https://github.com/ParabolInc/parabol/issues/9598)) ([c6da00c](https://github.com/ParabolInc/parabol/commit/c6da00c06929d377b8b698c82352559d1da85467))


### Changed

* **deps-dev:** bump webpack-dev-middleware from 4.0.2 to 5.3.4 ([#9561](https://github.com/ParabolInc/parabol/issues/9561)) ([dbc9f09](https://github.com/ParabolInc/parabol/commit/dbc9f091a4c93efc0eca24c5cd42b80bae95cff3))
* **deps:** bump express from 4.18.2 to 4.19.2 ([#9566](https://github.com/ParabolInc/parabol/issues/9566)) ([8ab86b4](https://github.com/ParabolInc/parabol/commit/8ab86b4cd8698ba6f0a4cdec8eca2bf31a290599))
* **deps:** bump follow-redirects from 1.15.2 to 1.15.6 ([#9536](https://github.com/ParabolInc/parabol/issues/9536)) ([e372f5f](https://github.com/ParabolInc/parabol/commit/e372f5f7bccd0a2fd1b4fea414610ad12fe0ec89))
* **deps:** bump jose from 4.14.4 to 4.15.5 ([#9515](https://github.com/ParabolInc/parabol/issues/9515)) ([c312f48](https://github.com/ParabolInc/parabol/commit/c312f4821698ae7966dee8889a0c8c3353733dcc))
* Remove one on one meeting type ([#9590](https://github.com/ParabolInc/parabol/issues/9590)) ([415d03b](https://github.com/ParabolInc/parabol/commit/415d03b2ce5216608a2dd144166666013d1752a0))

## [7.24.1](https://github.com/ParabolInc/parabol/compare/v7.24.0...v7.24.1) (2024-04-02)


### Fixed

* embedder doesn't dive deep into schema ([#9582](https://github.com/ParabolInc/parabol/issues/9582)) ([8cdd901](https://github.com/ParabolInc/parabol/commit/8cdd9014c3277905605c6544de92d9ac2833a6e9))
* embedder errors in embed length ([#9584](https://github.com/ParabolInc/parabol/issues/9584)) ([341b4b7](https://github.com/ParabolInc/parabol/commit/341b4b797ec6444066244f25916803e64c03258c))
* Fetch CORS resources from network ([#9586](https://github.com/ParabolInc/parabol/issues/9586)) ([b6ddfa5](https://github.com/ParabolInc/parabol/commit/b6ddfa5755394633e83dadd0178234ef740454ea))

## [7.24.0](https://github.com/ParabolInc/parabol/compare/v7.23.1...v7.24.0) (2024-03-29)


### Added

* prepare embedder for Production ([#9517](https://github.com/ParabolInc/parabol/issues/9517)) ([538c95c](https://github.com/ParabolInc/parabol/commit/538c95ce4dc7d4839b3e813006cb20e1b7d1d1c8))


### Changed

* fix tsconfig problems ([#9579](https://github.com/ParabolInc/parabol/issues/9579)) ([d1af0f1](https://github.com/ParabolInc/parabol/commit/d1af0f164c629e8fc075278cd63475e8913f4295))

## [7.23.1](https://github.com/ParabolInc/parabol/compare/v7.23.0...v7.23.1) (2024-03-28)


### Fixed

* ensure pool is callable after custom template migration ([#9572](https://github.com/ParabolInc/parabol/issues/9572)) ([0d30206](https://github.com/ParabolInc/parabol/commit/0d30206b154b60f11b23708c9315e9960d4825bb))
* remove destroyAll from add custom templates migration ([5baf3b7](https://github.com/ParabolInc/parabol/commit/5baf3b7584f8f578284baa7e47eb5e264e99ad53))

## [7.23.0](https://github.com/ParabolInc/parabol/compare/v7.22.4...v7.23.0) (2024-03-26)


### Added

* add functionality to change templates during a retro ([#9544](https://github.com/ParabolInc/parabol/issues/9544)) ([e6434e1](https://github.com/ParabolInc/parabol/commit/e6434e181a864b2e61428f55a98994fb1137ac8f))
* allow 2 custom templates for every user ([#9518](https://github.com/ParabolInc/parabol/issues/9518)) ([2352669](https://github.com/ParabolInc/parabol/commit/2352669ea516a3d764d63af77211fbb4c0a02563))
* make invoice row title more clear to understand ([#9551](https://github.com/ParabolInc/parabol/issues/9551)) ([9be96eb](https://github.com/ParabolInc/parabol/commit/9be96eb206d367e550b97831621c8b2aee4fc355))
* release AzureDevOps integration ([#9531](https://github.com/ParabolInc/parabol/issues/9531)) ([87c84a2](https://github.com/ParabolInc/parabol/commit/87c84a2cca1a4d94629291d1325948b3c6cfb790))
* switch template UI ([#9093](https://github.com/ParabolInc/parabol/issues/9093)) ([2171065](https://github.com/ParabolInc/parabol/commit/21710656b6d689b286759ea495ff334b7ce86adf))


### Fixed

* **admin:** fix an issue where ORG_ADMIN cannot see members from team they are not in ([#9560](https://github.com/ParabolInc/parabol/issues/9560)) ([ef0fbc2](https://github.com/ParabolInc/parabol/commit/ef0fbc2da853e2248a16ff2a2ce37c1f85f07f1a))
* Removed broken Rally links and fixed Youtube links ([#9332](https://github.com/ParabolInc/parabol/issues/9332)) ([5e98234](https://github.com/ParabolInc/parabol/commit/5e98234efca84e7ebcb653f3d71d229a88797a8d))


### Changed

* [Snyk] Upgrade core-js from 3.8.1 to 3.36.0 ([#9519](https://github.com/ParabolInc/parabol/issues/9519)) ([ab47ce4](https://github.com/ParabolInc/parabol/commit/ab47ce46c768f927c9d71d0a52a049df93b51ba4))
* [Snyk] Upgrade dotenv from 8.0.0 to 8.6.0 ([#9494](https://github.com/ParabolInc/parabol/issues/9494)) ([1e22931](https://github.com/ParabolInc/parabol/commit/1e22931c25c297e4697ea0e585d888c7b2738cfc))
* [Snyk] Upgrade graphql-typed from 0.6.1 to 0.7.2 ([#9522](https://github.com/ParabolInc/parabol/issues/9522)) ([0ce1384](https://github.com/ParabolInc/parabol/commit/0ce1384b418f2a48971b732b548b9b93f8882e6c))
* [Snyk] Upgrade react-dom-confetti from 0.0.10 to 0.2.0 ([#9520](https://github.com/ParabolInc/parabol/issues/9520)) ([ef68915](https://github.com/ParabolInc/parabol/commit/ef6891569f468469c64041d0c97555d76c2657d3))
* [Snyk] Upgrade react-swipeable-views-core from 0.13.1 to 0.14.0 ([#9521](https://github.com/ParabolInc/parabol/issues/9521)) ([3e42d9b](https://github.com/ParabolInc/parabol/commit/3e42d9b155e171ec54f8d4b0cfddc1ace67cb754))
* fix update snyk pr action ([#9564](https://github.com/ParabolInc/parabol/issues/9564)) ([092e5d9](https://github.com/ParabolInc/parabol/commit/092e5d95bf75ce2db772669971e28f22e6ee8679))
* **github:** DevOps review if docker folder is modified or release-please-config is changed ([#9562](https://github.com/ParabolInc/parabol/issues/9562)) ([d18d754](https://github.com/ParabolInc/parabol/commit/d18d75485116c883d72456ac51b817a044a38b4d))
* refactor add template mutation to the new sdl pattern ([#9533](https://github.com/ParabolInc/parabol/issues/9533)) ([fe71841](https://github.com/ParabolInc/parabol/commit/fe718413fa2d19afa660cc944d30a1284d6c2b18))
* Roll out AIGeneratedDiscussion to all users ([#9554](https://github.com/ParabolInc/parabol/issues/9554)) ([b8fa708](https://github.com/ParabolInc/parabol/commit/b8fa7088e610ab1a920d1b5522cd46ad28e2f715))

## [7.22.4](https://github.com/ParabolInc/parabol/compare/v7.22.3...v7.22.4) (2024-03-20)


### Changed

* **ci:** Gitlab deployment access token changed ([4ba2c9e](https://github.com/ParabolInc/parabol/commit/4ba2c9eb059325aedfaf6a4b87fae9054245f83a))

## [7.22.3](https://github.com/ParabolInc/parabol/compare/v7.22.2...v7.22.3) (2024-03-19)


### Fixed

* Activity library illustrations in Firefox ([#9549](https://github.com/ParabolInc/parabol/issues/9549)) ([00a1ca2](https://github.com/ParabolInc/parabol/commit/00a1ca2977cd1117b030aa538f526a24ca395ac9))
* **build-ci:** docker-build-push action fixed ([f16c21f](https://github.com/ParabolInc/parabol/commit/f16c21ffcfd99f98b49846951e561c4afeebbdf2))
* Configure trusted proxies ([#9548](https://github.com/ParabolInc/parabol/issues/9548)) ([24df17b](https://github.com/ParabolInc/parabol/commit/24df17bf3f0979ab65f785e95711ba53158ecb42))
* **parabol-ubi:** references to local files corrected ([41f5654](https://github.com/ParabolInc/parabol/commit/41f5654bc3046f770893c6840d4843ff58bce087))


### Changed

* Remove random team names ([#9543](https://github.com/ParabolInc/parabol/issues/9543)) ([fe128f0](https://github.com/ParabolInc/parabol/commit/fe128f017f01148ebd132fd532a771c6ab80ef16))
* **repo-structure:** Docker images and stacks organized and clarified ([#9530](https://github.com/ParabolInc/parabol/issues/9530)) ([6fca12c](https://github.com/ParabolInc/parabol/commit/6fca12c814f471ef33954381ee562cbbb4b93d67))

## [7.22.2](https://github.com/ParabolInc/parabol/compare/v7.22.1...v7.22.2) (2024-03-18)


### Fixed

* Only read the first ip of the x-forwarded-for header ([#9545](https://github.com/ParabolInc/parabol/issues/9545)) ([081f7a0](https://github.com/ParabolInc/parabol/commit/081f7a09a94a3ce2d23816e801c745040737364f))
* **snyk-ci:** removed toLowerCase function as it does not exit ([2c98ca1](https://github.com/ParabolInc/parabol/commit/2c98ca1c71bb223d736a9d259f1d6314b8579c35))
* use base ref for migrition order check ([#9542](https://github.com/ParabolInc/parabol/issues/9542)) ([0217e11](https://github.com/ParabolInc/parabol/commit/0217e11147201759db85a1df010bc3d4d291b202))


### Changed

* add GH Action, on Snyk PRs commit yarn.lock ([#9534](https://github.com/ParabolInc/parabol/issues/9534)) ([bd907a9](https://github.com/ParabolInc/parabol/commit/bd907a915a1848b17ff9385c70de072390f54cf5))

## [7.22.1](https://github.com/ParabolInc/parabol/compare/v7.22.0...v7.22.1) (2024-03-14)


### Fixed

* node-loader that ignores public path ([#9537](https://github.com/ParabolInc/parabol/issues/9537)) ([1009ede](https://github.com/ParabolInc/parabol/commit/1009edefba19b1caec0b8f9708aa468d565fc225))


### Changed

* migrate FailedAuthRequest to pg ([#9500](https://github.com/ParabolInc/parabol/issues/9500)) ([efc0dc9](https://github.com/ParabolInc/parabol/commit/efc0dc9d090f2bcd03d5abedc04a5507addb2f6e))
* migrate ScheduledJob from rethinkdb to pg ([#9490](https://github.com/ParabolInc/parabol/issues/9490)) ([5c39fde](https://github.com/ParabolInc/parabol/commit/5c39fde04c6e8b5c31d70258d4ef7f548aa28298))

## [7.22.0](https://github.com/ParabolInc/parabol/compare/v7.21.0...v7.22.0) (2024-03-13)


### Added

* Add team sections to the Custom category in activity library ([#9511](https://github.com/ParabolInc/parabol/issues/9511)) ([2338414](https://github.com/ParabolInc/parabol/commit/233841498bf997343f3d94e443104973078bf736))
* added additinal check-in questions ([10c6f69](https://github.com/ParabolInc/parabol/commit/10c6f6932008fcca434d1b6a73c288aea88768d5))
* managing teams ([#9285](https://github.com/ParabolInc/parabol/issues/9285)) ([f351cf9](https://github.com/ParabolInc/parabol/commit/f351cf9f5a894fe019f331cc0ec6f012a0779c42))
* Recurring GCal event dialog ([#9506](https://github.com/ParabolInc/parabol/issues/9506)) ([fc4429c](https://github.com/ParabolInc/parabol/commit/fc4429c85dd9610d3fdadf83882c2dbdd88f424f))
* Release MS Teams integration ([#9527](https://github.com/ParabolInc/parabol/issues/9527)) ([1ed2796](https://github.com/ParabolInc/parabol/commit/1ed279673fdaa7a21a995677c7e2b0e6a7c41f96))


### Fixed

* Korean greeting corrected ([#9525](https://github.com/ParabolInc/parabol/issues/9525)) ([10c6f69](https://github.com/ParabolInc/parabol/commit/10c6f6932008fcca434d1b6a73c288aea88768d5))
* Make hasGCalError optional ([#9526](https://github.com/ParabolInc/parabol/issues/9526)) ([9350b93](https://github.com/ParabolInc/parabol/commit/9350b93b7a2a6f48e0af712cc0a6edbb8395004c))
* recreate lockfile ([#9516](https://github.com/ParabolInc/parabol/issues/9516)) ([af47966](https://github.com/ParabolInc/parabol/commit/af47966d6c07b295536327a3ee4d6bac1fece57b))


### Changed

* **ci:** add capability to manually generate Docker Images ([#9524](https://github.com/ParabolInc/parabol/issues/9524)) ([88bf97f](https://github.com/ParabolInc/parabol/commit/88bf97f6ff3e820d49a24e9a8a8cf4dbab46b22c))
* **gh-actions:** reporting status to Slack if test or build GH Actions fail ([#9512](https://github.com/ParabolInc/parabol/issues/9512)) ([e7539d1](https://github.com/ParabolInc/parabol/commit/e7539d152ccfb5fbe12bdcb9b5ce3cc64fd2955c))
* Remove Add Activity button from discussions ([#9528](https://github.com/ParabolInc/parabol/issues/9528)) ([37bd20c](https://github.com/ParabolInc/parabol/commit/37bd20cf8e073d353e3b3dffb5f3037c199adf67))

## [7.21.0](https://github.com/ParabolInc/parabol/compare/v7.20.0...v7.21.0) (2024-03-06)


### Added

* make all templates free ([#9503](https://github.com/ParabolInc/parabol/issues/9503)) ([6762ebc](https://github.com/ParabolInc/parabol/commit/6762ebc4068f9062091db7f8d467fecf60388d63))
* saml login no email, auth design fixups ([#9507](https://github.com/ParabolInc/parabol/issues/9507)) ([4ce391e](https://github.com/ParabolInc/parabol/commit/4ce391e53a11cbd174bf67364db29128afe72092))


### Fixed

* upgrade graphql-jit from 0.7.4 to 0.8.4 ([#9495](https://github.com/ParabolInc/parabol/issues/9495)) ([fe1ad43](https://github.com/ParabolInc/parabol/commit/fe1ad434a990ffbfb5c52863988e7f4406d2ac84))
* upgrade oy-vey from 0.11.2 to 0.12.1 ([#9497](https://github.com/ParabolInc/parabol/issues/9497)) ([1751731](https://github.com/ParabolInc/parabol/commit/17517318502b5aaa0849c8d03c4e068f5da92e82))
* upgrade sharp from 0.32.6 to 0.33.2 ([#9493](https://github.com/ParabolInc/parabol/issues/9493)) ([9fff933](https://github.com/ParabolInc/parabol/commit/9fff93397e35e2bfeb8f4fbc34c8d535284551eb))


### Changed

* bump ts node ([#9498](https://github.com/ParabolInc/parabol/issues/9498)) ([58c5817](https://github.com/ParabolInc/parabol/commit/58c5817463bcb73dbcaa83b05a0d2a201262de77))
* put server assets on CDN ([#9278](https://github.com/ParabolInc/parabol/issues/9278)) ([06c1f7e](https://github.com/ParabolInc/parabol/commit/06c1f7eec63c6de343181ee1324635c2ae8d286a))
* remove pg-typed part 1 ([#9508](https://github.com/ParabolInc/parabol/issues/9508)) ([5dfe26b](https://github.com/ParabolInc/parabol/commit/5dfe26b29753f881dc54c35d6dfa15e894f3726a))
* Update reviewers ([#9504](https://github.com/ParabolInc/parabol/issues/9504)) ([a95fb88](https://github.com/ParabolInc/parabol/commit/a95fb88b9a76e04eb73630404e29e6325dcf1a12))

## [7.20.0](https://github.com/ParabolInc/parabol/compare/v7.19.7...v7.20.0) (2024-03-01)


### Added

* OpenAIGeneration model for embedder ([#9474](https://github.com/ParabolInc/parabol/issues/9474)) ([807e347](https://github.com/ParabolInc/parabol/commit/807e34718d8a7939b7be84438900ef200a6ca896))


### Fixed

* support single-tenant saml record ([#9486](https://github.com/ParabolInc/parabol/issues/9486)) ([4e2e2ca](https://github.com/ParabolInc/parabol/commit/4e2e2ca00f237a7a8c94dc2e7f0d2f7d9ef9210d))

## [7.19.7](https://github.com/ParabolInc/parabol/compare/v7.19.6...v7.19.7) (2024-02-29)


### Fixed

* **docker-build:** home folder is /home/node now ([#9482](https://github.com/ParabolInc/parabol/issues/9482)) ([2ff4a6e](https://github.com/ParabolInc/parabol/commit/2ff4a6e6328bf437a31e9ac7984af4a55aae3d11))

## [7.19.6](https://github.com/ParabolInc/parabol/compare/v7.19.5...v7.19.6) (2024-02-29)


### Fixed

* After parameter for meetingCount was ignored ([#9479](https://github.com/ParabolInc/parabol/issues/9479)) ([052acd1](https://github.com/ParabolInc/parabol/commit/052acd14035fe7c96af8d17ca4763be91d863a80))


### Changed

* **docker-build:** simplify the docker build process and reduce docker image size ([#9447](https://github.com/ParabolInc/parabol/issues/9447)) ([5e356c2](https://github.com/ParabolInc/parabol/commit/5e356c2566db8e32e45a1393e1b1ea27c4be0a5c))

## [7.19.5](https://github.com/ParabolInc/parabol/compare/v7.19.4...v7.19.5) (2024-02-29)


### Fixed

* Fix seasonal templates for leap years ([#9476](https://github.com/ParabolInc/parabol/issues/9476)) ([419d104](https://github.com/ParabolInc/parabol/commit/419d104757d905c468d6a72ce607430d01f3b97f))

## [7.19.4](https://github.com/ParabolInc/parabol/compare/v7.19.3...v7.19.4) (2024-02-28)


### Fixed

* Fetch Jira projects in parallel ([#9456](https://github.com/ParabolInc/parabol/issues/9456)) ([9cec00a](https://github.com/ParabolInc/parabol/commit/9cec00a5fd0b46c73ebdde27e6d966b485216132))
* limit invites from spammers ([#9416](https://github.com/ParabolInc/parabol/issues/9416)) ([5b9526c](https://github.com/ParabolInc/parabol/commit/5b9526c092f7f8675ad2a442da4440e2507cbdcc))
* packages/server/package.json to reduce vulnerabilities ([#9298](https://github.com/ParabolInc/parabol/issues/9298)) ([fd75d3f](https://github.com/ParabolInc/parabol/commit/fd75d3f2a907888bb461d55ac945d9449071a414))
* packages/server/package.json to reduce vulnerabilities ([#9392](https://github.com/ParabolInc/parabol/issues/9392)) ([fd833f5](https://github.com/ParabolInc/parabol/commit/fd833f541ef7f915b40331c9d12e94243c8fa24f))
* packages/server/package.json to reduce vulnerabilities ([#9434](https://github.com/ParabolInc/parabol/issues/9434)) ([1e0075e](https://github.com/ParabolInc/parabol/commit/1e0075e843ce3cf52966a0b77293d72f1d9c60b9))
* replace lone surrogates in draft-js content ([#9415](https://github.com/ParabolInc/parabol/issues/9415)) ([00092ec](https://github.com/ParabolInc/parabol/commit/00092ec55659d1441e9566d501940dcc6fcf07f4))


### Changed

* add upload to GCS step in ironbank ([#9471](https://github.com/ParabolInc/parabol/issues/9471)) ([7bfec91](https://github.com/ParabolInc/parabol/commit/7bfec9188a42b38eb69930fdd86e6fb39249ed7e))
* **deps:** bump es5-ext from 0.10.62 to 0.10.64 ([#9457](https://github.com/ParabolInc/parabol/issues/9457)) ([92f0be9](https://github.com/ParabolInc/parabol/commit/92f0be917d4bd182bc6ea249f5dc40c05b98320a))
* **deps:** bump follow-redirects from 1.14.8 to 1.15.4 ([#9312](https://github.com/ParabolInc/parabol/issues/9312)) ([9441b27](https://github.com/ParabolInc/parabol/commit/9441b2727deefb7e27e4015f37d64ff933415c8d))

## [7.19.3](https://github.com/ParabolInc/parabol/compare/v7.19.2...v7.19.3) (2024-02-28)


### Fixed

* force push 5 ([#9467](https://github.com/ParabolInc/parabol/issues/9467)) ([581f0cf](https://github.com/ParabolInc/parabol/commit/581f0cfa2255bbeb438c53b2b5f4d8ceb6a0b0cc))

## [7.19.2](https://github.com/ParabolInc/parabol/compare/v7.19.1...v7.19.2) (2024-02-28)


### Fixed

* mrege origin/production strategy ([#9465](https://github.com/ParabolInc/parabol/issues/9465)) ([9e90b9d](https://github.com/ParabolInc/parabol/commit/9e90b9df95b8505c0e1e50d4e8e4f18c73ef17cd))

## [7.19.1](https://github.com/ParabolInc/parabol/compare/v7.19.0...v7.19.1) (2024-02-27)


### Fixed

* checkout prod before merging it ([#9463](https://github.com/ParabolInc/parabol/issues/9463)) ([7bd8803](https://github.com/ParabolInc/parabol/commit/7bd880314f6f48c897a9a708b2d6435b257fae90))

## [7.19.0](https://github.com/ParabolInc/parabol/compare/v7.18.1...v7.19.0) (2024-02-27)


### Added

* embedder service ([#9417](https://github.com/ParabolInc/parabol/issues/9417)) ([55faa17](https://github.com/ParabolInc/parabol/commit/55faa17ada5b1bd49182a29341b3465a82d2ddfd))

## [7.18.1](https://github.com/ParabolInc/parabol/compare/v7.18.0...v7.18.1) (2024-02-27)


### Changed

* no force-push to prod ([#9401](https://github.com/ParabolInc/parabol/issues/9401)) ([6d46e1b](https://github.com/ParabolInc/parabol/commit/6d46e1b2aab6731493de2d2547c88ae3921393f0))

## [7.18.0](https://github.com/ParabolInc/parabol/compare/v7.17.0...v7.18.0) (2024-02-27)


### Added

* **standalone-deployment:** Standalone host deployment improved and documented ([#9445](https://github.com/ParabolInc/parabol/issues/9445)) ([61ba015](https://github.com/ParabolInc/parabol/commit/61ba015c8310a72b7e89c64be081cd2f399fc721))
* support env-defined saml issuer for PPMIs ([#9455](https://github.com/ParabolInc/parabol/issues/9455)) ([92ab5be](https://github.com/ParabolInc/parabol/commit/92ab5be298ceb19ca8718c67a0c9da8728b6b0bf))


### Changed

* Associate logs with traces ([#9444](https://github.com/ParabolInc/parabol/issues/9444)) ([c77925b](https://github.com/ParabolInc/parabol/commit/c77925b1c0e07afc428022008143b8b7f4002280))

## [7.17.0](https://github.com/ParabolInc/parabol/compare/v7.16.0...v7.17.0) (2024-02-21)


### Added

* Add Google calendar meeting series for recurrence ([#9380](https://github.com/ParabolInc/parabol/issues/9380)) ([02dc6fa](https://github.com/ParabolInc/parabol/commit/02dc6fa6e4687021bb46a6774eb5f0be859e4d3f))
* remove team template limit ([#9424](https://github.com/ParabolInc/parabol/issues/9424)) ([f042628](https://github.com/ParabolInc/parabol/commit/f042628fef5bbdbf566c49bab729f5b9dec058f1))


### Fixed

* Increase the number of projects fetched per request from Atlassian ([#9435](https://github.com/ParabolInc/parabol/issues/9435)) ([b0b76f9](https://github.com/ParabolInc/parabol/commit/b0b76f9f45789f60b55243f78eba7b656c751658))


### Changed

* **deps:** bump ip from 1.1.8 to 1.1.9 ([#9442](https://github.com/ParabolInc/parabol/issues/9442)) ([c2a31e6](https://github.com/ParabolInc/parabol/commit/c2a31e6b8ef2c4f4d375323f8afbef6874024593))
* **env vars:** Stripe vars moved to the Integrations section ([#9427](https://github.com/ParabolInc/parabol/issues/9427)) ([a0af0c1](https://github.com/ParabolInc/parabol/commit/a0af0c1230a1dbc93a28977d6d61180319220c88))
* fix misleading `isLead` field name on `Team` ([#9413](https://github.com/ParabolInc/parabol/issues/9413)) ([c0a2fdf](https://github.com/ParabolInc/parabol/commit/c0a2fdf8fb3deaa34f7935ae8a87d30f43381ecd))

## [7.16.0](https://github.com/ParabolInc/parabol/compare/v7.15.2...v7.16.0) (2024-02-14)


### Added

* speed up ai search ([#9421](https://github.com/ParabolInc/parabol/issues/9421)) ([9584170](https://github.com/ParabolInc/parabol/commit/95841706d233558d7012781f391b639e8651a244))


### Fixed

* not all jira projects are displayed in the list if there are a lot of them ([#9422](https://github.com/ParabolInc/parabol/issues/9422)) ([867ad5e](https://github.com/ParabolInc/parabol/commit/867ad5e37bd28410e339daa6dd183c52582da64a))


### Changed

* add embeddings table migration ([#9372](https://github.com/ParabolInc/parabol/issues/9372)) ([012ca77](https://github.com/ParabolInc/parabol/commit/012ca77c5c050df9bd3711332d21d40026018284))
* bump node to v20.11.0 ([#9410](https://github.com/ParabolInc/parabol/issues/9410)) ([51f28a1](https://github.com/ParabolInc/parabol/commit/51f28a10e5c7708035c74478baa1e931bcf4fc8a))
* update 3d secure card number in release_test.md ([#9394](https://github.com/ParabolInc/parabol/issues/9394)) ([84d183f](https://github.com/ParabolInc/parabol/commit/84d183f149edfa7d4e76e05d29eeb298e7587634))

## [7.15.2](https://github.com/ParabolInc/parabol/compare/v7.15.1...v7.15.2) (2024-02-08)


### Fixed

* fix kudos in standups in nested lists ([#9412](https://github.com/ParabolInc/parabol/issues/9412)) ([7e78d20](https://github.com/ParabolInc/parabol/commit/7e78d20f33c86f3f0323f316512295378934b511))


### Changed

* Add more Atlassian logging ([#9405](https://github.com/ParabolInc/parabol/issues/9405)) ([d8f006c](https://github.com/ParabolInc/parabol/commit/d8f006cda39bcb7d89a1f13b839794eaee3f0c01))

## [7.15.1](https://github.com/ParabolInc/parabol/compare/v7.15.0...v7.15.1) (2024-02-06)


### Fixed

* **env:** typo in AZURE_DEVOPS vars ([#9396](https://github.com/ParabolInc/parabol/issues/9396)) ([7de7514](https://github.com/ParabolInc/parabol/commit/7de751463532d7e42c61b5fdb9ab5d0dc8348841))
* fix accepting invite always required email verification ([#9404](https://github.com/ParabolInc/parabol/issues/9404)) ([58f5f97](https://github.com/ParabolInc/parabol/commit/58f5f9706a7c14f20e72fc6be9ab208f52939c91))
* handle all types of errors in sendToSentry ([#9387](https://github.com/ParabolInc/parabol/issues/9387)) ([3b5d4eb](https://github.com/ParabolInc/parabol/commit/3b5d4ebfd2cee575c903036f06cb57dafb22f87c))


### Changed

* **deps:** bump nodemailer ([#9399](https://github.com/ParabolInc/parabol/issues/9399)) ([342968d](https://github.com/ParabolInc/parabol/commit/342968d3a5f622e704e3677322d1bcdc6f2e2749))
* update Ironbank GH action dependencies ([#9393](https://github.com/ParabolInc/parabol/issues/9393)) ([886ce6f](https://github.com/ParabolInc/parabol/commit/886ce6f203fceb4b90fcd95ddc1972ea23556dfe))

## [7.15.0](https://github.com/ParabolInc/parabol/compare/v7.14.0...v7.15.0) (2024-01-30)


### Added

* Add meeting series end options for retros ([#9370](https://github.com/ParabolInc/parabol/issues/9370)) ([715ed47](https://github.com/ParabolInc/parabol/commit/715ed47a180cd70c494f7cae397b455f04adea50))
* add notifications for mention in reflections and show kudos preview ([#9354](https://github.com/ParabolInc/parabol/issues/9354)) ([a7f9b5d](https://github.com/ParabolInc/parabol/commit/a7f9b5df4c7c6a66b5b5856e56968e5b94579911))
* add slack notification for mention and kudos in reflections ([#9377](https://github.com/ParabolInc/parabol/issues/9377)) ([bd0347b](https://github.com/ParabolInc/parabol/commit/bd0347b8e91c57092d6a30ab4a28a151d06bac3b))
* Allow retro meeting series naming ([#9348](https://github.com/ParabolInc/parabol/issues/9348)) ([894b716](https://github.com/ParabolInc/parabol/commit/894b71663cbb62c8008aa54f1dbe920b8cb56c85))
* Release team insights ([#9385](https://github.com/ParabolInc/parabol/issues/9385)) ([7505fc3](https://github.com/ParabolInc/parabol/commit/7505fc33edd21e44396395122789a3dee66e414c))
* support globs for org approvals ([#9367](https://github.com/ParabolInc/parabol/issues/9367)) ([822ee57](https://github.com/ParabolInc/parabol/commit/822ee57800b3acc8eac76be5cae612c90eb94d94))


### Fixed

* add suggested vscode extensions ([#9382](https://github.com/ParabolInc/parabol/issues/9382)) ([d991532](https://github.com/ParabolInc/parabol/commit/d9915321fb58b6e364629be79a11713eaf6d9a6f))
* fix recreating invite link in case of expiration ([#9222](https://github.com/ParabolInc/parabol/issues/9222)) ([027579e](https://github.com/ParabolInc/parabol/commit/027579ef961713963ef630d25502cd5299170d46))
* fix slack resonse replied anonymous notification ([#9390](https://github.com/ParabolInc/parabol/issues/9390)) ([1717936](https://github.com/ParabolInc/parabol/commit/17179361395b744641e597ab1d7e1d6dc43828ee))

## [7.14.0](https://github.com/ParabolInc/parabol/compare/v7.13.3...v7.14.0) (2024-01-23)


### Added

* Add recurring retros ([#9311](https://github.com/ParabolInc/parabol/issues/9311)) ([df2e992](https://github.com/ParabolInc/parabol/commit/df2e992c982ad4c8bcf57a9c1552e28ea05e6e70))
* support SERVER_SECRET rotations gracefully ([#9360](https://github.com/ParabolInc/parabol/issues/9360)) ([53fe4c9](https://github.com/ParabolInc/parabol/commit/53fe4c91182f9846bde6b162604c9d7bf04c5266))


### Fixed

* handle breaking syntax in pr body ([#9368](https://github.com/ParabolInc/parabol/issues/9368)) ([310659e](https://github.com/ParabolInc/parabol/commit/310659e21a35ae3378441bc6480d1bc694b893fb))
* render activity library tooltip ([#9376](https://github.com/ParabolInc/parabol/issues/9376)) ([d561fb3](https://github.com/ParabolInc/parabol/commit/d561fb314fb11ce83004ba58a3a13ab059823c57))


### Changed

* Prettify "Time's up" Slack message ([#9352](https://github.com/ParabolInc/parabol/issues/9352)) ([73aac5f](https://github.com/ParabolInc/parabol/commit/73aac5fa399937c391a56d0d0f37a0938d2b097b))

## [7.13.3](https://github.com/ParabolInc/parabol/compare/v7.13.2...v7.13.3) (2024-01-18)


### Fixed

* support edge cases in release to prod ([#9364](https://github.com/ParabolInc/parabol/issues/9364)) ([006d714](https://github.com/ParabolInc/parabol/commit/006d7143b4d9ed82d402b9886c9537335ae3ff47))

## [7.13.2](https://github.com/ParabolInc/parabol/compare/v7.13.1...v7.13.2) (2024-01-18)


### Fixed

* contents: write for gh actions ([#9361](https://github.com/ParabolInc/parabol/issues/9361)) ([d1c3719](https://github.com/ParabolInc/parabol/commit/d1c37195bebcecb5005cc1b92a8859b59faafaed))

## [7.13.1](https://github.com/ParabolInc/parabol/compare/v7.13.0...v7.13.1) (2024-01-18)


### Fixed

* create release branch as head ([#9356](https://github.com/ParabolInc/parabol/issues/9356)) ([5089e4c](https://github.com/ParabolInc/parabol/commit/5089e4cf3bfc0fe5d2799aba3367ed8e55765d4b))
* new branch debug ([#9358](https://github.com/ParabolInc/parabol/issues/9358)) ([7c11b6a](https://github.com/ParabolInc/parabol/commit/7c11b6a54f09f655e851b05da55af0fad77e9e12))
* release-to-staging create branch to act as a the PR head ([#9359](https://github.com/ParabolInc/parabol/issues/9359)) ([3a7145e](https://github.com/ParabolInc/parabol/commit/3a7145ef02c3de3ff3cb62cd1dcc47daa746987b))


### Changed

* embedder add pgvector (and fixes) ([#9341](https://github.com/ParabolInc/parabol/issues/9341)) ([0fae983](https://github.com/ParabolInc/parabol/commit/0fae983c24b44da86a89d1721b8f20d6fb016aa6))

## [7.13.0](https://github.com/ParabolInc/parabol/compare/v7.12.4...v7.13.0) (2024-01-18)


### Added

* Add custom category to activity library ([#9319](https://github.com/ParabolInc/parabol/issues/9319)) ([5af8726](https://github.com/ParabolInc/parabol/commit/5af87262907fd293d88b29bd42ed503655487c02))
* adding integrations to team view tabs ([#8985](https://github.com/ParabolInc/parabol/issues/8985)) ([2140f61](https://github.com/ParabolInc/parabol/commit/2140f6184d3d5ad719e914dd87e04cf966d4ee9d))
* ai template recommendation ([#9223](https://github.com/ParabolInc/parabol/issues/9223)) ([32591f1](https://github.com/ParabolInc/parabol/commit/32591f1d38e66cd9f878556897cfa673d48f59c1))
* **kudos:** enable mentions in retro reflections ([#9284](https://github.com/ParabolInc/parabol/issues/9284)) ([bd8f696](https://github.com/ParabolInc/parabol/commit/bd8f6962f18ff45e1dc87b8b117829704065a052))
* **kudos:** send kudos at the end of the retro ([#9288](https://github.com/ParabolInc/parabol/issues/9288)) ([aef83a7](https://github.com/ParabolInc/parabol/commit/aef83a7231f777ebd59f33b0b86b4fce9485bbee))
* **kudos:** show snackbar when reflection with kudos created ([#9334](https://github.com/ParabolInc/parabol/issues/9334)) ([6a8224b](https://github.com/ParabolInc/parabol/commit/6a8224b61074b9d86ec78b90943d20698a0fd3ec))
* remove unnecessary github oauth scopes ([#8786](https://github.com/ParabolInc/parabol/issues/8786)) ([c9d4110](https://github.com/ParabolInc/parabol/commit/c9d411052b8dfacef7312090eb68f3931a45c7a7))
* update activity library quick start ([#9350](https://github.com/ParabolInc/parabol/issues/9350)) ([3aa04e6](https://github.com/ParabolInc/parabol/commit/3aa04e6bf242e9a25f6436134e6eae27d05cd534))


### Fixed

* Allow multiple "*New Template" ([#9320](https://github.com/ParabolInc/parabol/issues/9320)) ([3d81c3f](https://github.com/ParabolInc/parabol/commit/3d81c3f246218bd45a8046cbe27d24d369b4f6be))
* Docker build readme updated with the correct PostgreSQL version ([#9330](https://github.com/ParabolInc/parabol/issues/9330)) ([5fde915](https://github.com/ParabolInc/parabol/commit/5fde915d06bfa44b6008f9d0ba4546612de09760))
* fix broken demo summary ([#9351](https://github.com/ParabolInc/parabol/issues/9351)) ([62d24f1](https://github.com/ParabolInc/parabol/commit/62d24f11591f4822a850a6cf940a6b6e32dae09b))
* gh action release switch head to version tag ([#9349](https://github.com/ParabolInc/parabol/issues/9349)) ([dee7525](https://github.com/ParabolInc/parabol/commit/dee75252d2cc5baa7f95bab043bb5f5a520eca67))
* highlight team dash in sidebar regardless of tab ([#9333](https://github.com/ParabolInc/parabol/issues/9333)) ([8db6770](https://github.com/ParabolInc/parabol/commit/8db6770518ef63d496c45c2312ba67f0d1a9e7b4))
* Show correct template owner for ex-team members ([#9331](https://github.com/ParabolInc/parabol/issues/9331)) ([57cf084](https://github.com/ParabolInc/parabol/commit/57cf0840cc89509210f3e6a8e0732b7b8f5c4b0b))


### Changed

* Add recurring retros feature flag ([#9347](https://github.com/ParabolInc/parabol/issues/9347)) ([9db9485](https://github.com/ParabolInc/parabol/commit/9db9485fd5fb1e72f4d12b3d0914cd9939675ad0))
* **configuration:** .env with the minimal configuration to make the application work ([#9335](https://github.com/ParabolInc/parabol/issues/9335)) ([7723292](https://github.com/ParabolInc/parabol/commit/7723292e612491bf97102c7ea1b58b2a49329301))
* Distribute assignSURole ([#9353](https://github.com/ParabolInc/parabol/issues/9353)) ([6871fad](https://github.com/ParabolInc/parabol/commit/6871fad4dbe74b6dbd3c9ecb2967aa99bcbfa825))
* prepare start and endRetrospective for recurrence ([#9318](https://github.com/ParabolInc/parabol/issues/9318)) ([8eb807d](https://github.com/ParabolInc/parabol/commit/8eb807d5f03c19be0a2803b187266014a0e746f5))
* Update code review guidelines ([#9307](https://github.com/ParabolInc/parabol/issues/9307)) ([334efc9](https://github.com/ParabolInc/parabol/commit/334efc9fcb853552115974d695bb297594219b55))

## [7.12.4](https://github.com/ParabolInc/parabol/compare/v7.12.3...v7.12.4) (2024-01-11)


### Fixed

* default to empty instead of null ([#9325](https://github.com/ParabolInc/parabol/issues/9325)) ([87b023c](https://github.com/ParabolInc/parabol/commit/87b023cd44c8a9d60f9ce2553394cf6c198bc335))

## [7.12.3](https://github.com/ParabolInc/parabol/compare/v7.12.2...v7.12.3) (2024-01-10)


### Fixed

* gh release staging debug ([#9322](https://github.com/ParabolInc/parabol/issues/9322)) ([383c722](https://github.com/ParabolInc/parabol/commit/383c72294370ca843936f624174f3367849156c7))

## [7.12.2](https://github.com/ParabolInc/parabol/compare/v7.12.1...v7.12.2) (2024-01-10)


### Fixed

* longer timeout for unplayable job ([#9321](https://github.com/ParabolInc/parabol/issues/9321)) ([60320e4](https://github.com/ParabolInc/parabol/commit/60320e488f1ad9bd8a85ce66e77387dd32a17cbd))


### Changed

* Convert GraphQL meeting types to use codegen ([#9306](https://github.com/ParabolInc/parabol/issues/9306)) ([dc6be15](https://github.com/ParabolInc/parabol/commit/dc6be15a2818065353e8e3b45e50fd54a7b6ba5c))

## [7.12.1](https://github.com/ParabolInc/parabol/compare/v7.12.0...v7.12.1) (2024-01-09)


### Fixed

* release to staging debug [#4](https://github.com/ParabolInc/parabol/issues/4) ([#9315](https://github.com/ParabolInc/parabol/issues/9315)) ([ba32950](https://github.com/ParabolInc/parabol/commit/ba32950624420a45d749d04898316a38566656ee))

## [7.12.0](https://github.com/ParabolInc/parabol/compare/v7.11.2...v7.12.0) (2024-01-09)


### Added

* **kudos:** send kudos by text in standups ([#9259](https://github.com/ParabolInc/parabol/issues/9259)) ([371d5f6](https://github.com/ParabolInc/parabol/commit/371d5f6a90471c2e974d495d01b8a5cf062c0024))


### Fixed

* add pr write permission to CI ([#9313](https://github.com/ParabolInc/parabol/issues/9313)) ([463bc96](https://github.com/ParabolInc/parabol/commit/463bc96ae34363966434280af8922399d3715cf0))
* Fix kudosSent analytics ([#9310](https://github.com/ParabolInc/parabol/issues/9310)) ([193151d](https://github.com/ParabolInc/parabol/commit/193151d10bc12e6856c865725493edb4c5071727))


### Changed

* Change email summary setting copy to be clearer ([#9303](https://github.com/ParabolInc/parabol/issues/9303)) ([176ce1e](https://github.com/ParabolInc/parabol/commit/176ce1e195715a91b7620e8ef8072fb110a6ef11))
* **deps:** bump tj-actions/changed-files in /.github/workflows ([#9299](https://github.com/ParabolInc/parabol/issues/9299)) ([8de6b80](https://github.com/ParabolInc/parabol/commit/8de6b803653a8bab84d23c67db91db04a0ff44d1))
* disable autoJoin test ([#9304](https://github.com/ParabolInc/parabol/issues/9304)) ([61d6842](https://github.com/ParabolInc/parabol/commit/61d6842dd67917c701726837de117fdcd900ea8f))
* document SOCKET_PORT environment ([#9309](https://github.com/ParabolInc/parabol/issues/9309)) ([0d4d7db](https://github.com/ParabolInc/parabol/commit/0d4d7db593bb651ae5fa11613fe2a20ae333088b))
* **meeting-inception:** use retrosInDisguise flag for displaying add an activity button ([#9297](https://github.com/ParabolInc/parabol/issues/9297)) ([126a1a0](https://github.com/ParabolInc/parabol/commit/126a1a0b182e90fa736e6cf06662e472a6555522))

## [7.11.2](https://github.com/ParabolInc/parabol/compare/v7.11.1...v7.11.2) (2023-12-20)


### Fixed

* release-to-staging debugging 2 ([#9295](https://github.com/ParabolInc/parabol/issues/9295)) ([f1e5433](https://github.com/ParabolInc/parabol/commit/f1e543321f7a99dc3469bef7ee34c093147987ec))

## [7.11.1](https://github.com/ParabolInc/parabol/compare/v7.11.0...v7.11.1) (2023-12-20)


### Fixed

* Fix duplicate organizations for teams with auto join ([#9290](https://github.com/ParabolInc/parabol/issues/9290)) ([e5971c4](https://github.com/ParabolInc/parabol/commit/e5971c44d40118b66f0a32b862dc380ac03b03c4))
* release-to-staging debug ([#9294](https://github.com/ParabolInc/parabol/issues/9294)) ([71e438d](https://github.com/ParabolInc/parabol/commit/71e438dab7b33f01b951abcec481360147933075))

## [7.11.0](https://github.com/ParabolInc/parabol/compare/v7.10.0...v7.11.0) (2023-12-20)


### Added

* added option to modify icebreakers with ai ([#9268](https://github.com/ParabolInc/parabol/issues/9268)) ([70db85f](https://github.com/ParabolInc/parabol/commit/70db85fb1627478b8851a6f63a59caf920a1ab74))
* **admin:** Org Admin permissions - billing leader and team lead permissions ([#9195](https://github.com/ParabolInc/parabol/issues/9195)) ([fb05fdd](https://github.com/ParabolInc/parabol/commit/fb05fddc99a0ece301e5c072becd52666399c8a4))
* release checkout flow ([#9245](https://github.com/ParabolInc/parabol/issues/9245)) ([1c4d9d1](https://github.com/ParabolInc/parabol/commit/1c4d9d15197713cf429b73c3a748747c3de73fd8))
* Show new meeting snack also on summary page ([#9231](https://github.com/ParabolInc/parabol/issues/9231)) ([42bde5e](https://github.com/ParabolInc/parabol/commit/42bde5e90c7e29ed264af1568b4e74b758a19c3f))


### Fixed

* activity library colour imports ([#9277](https://github.com/ParabolInc/parabol/issues/9277)) ([b9ddeff](https://github.com/ParabolInc/parabol/commit/b9ddeff458c22698dc15e7e37e0394f4cecddd3f))
* activity library settings mobile ([#9275](https://github.com/ParabolInc/parabol/issues/9275)) ([f3ab591](https://github.com/ParabolInc/parabol/commit/f3ab591aaf166cc525bf5eab6afd5748c6a36f50))
* grab auth token before await ([#9292](https://github.com/ParabolInc/parabol/issues/9292)) ([86db0dc](https://github.com/ParabolInc/parabol/commit/86db0dce0ff4356588064ac0c6a3ec3219528fab))
* gracefully remove consumer from redis on sigterm ([#9252](https://github.com/ParabolInc/parabol/issues/9252)) ([fd273bb](https://github.com/ParabolInc/parabol/commit/fd273bbe175e64bd5ccaa4eb842ef3daf205ef65))
* Prompt to join org without organization feature flags ([#9280](https://github.com/ParabolInc/parabol/issues/9280)) ([117cd57](https://github.com/ParabolInc/parabol/commit/117cd57f3d62a22d6fe512ffe836a2ff4724249f))
* shake some images from server bundle ([#9267](https://github.com/ParabolInc/parabol/issues/9267)) ([8520063](https://github.com/ParabolInc/parabol/commit/8520063c7835bb5a685e83eabd735ee694d76486))
* Update organization on accept invite ([#9281](https://github.com/ParabolInc/parabol/issues/9281)) ([9c3f372](https://github.com/ParabolInc/parabol/commit/9c3f37245b2b8856d410bcba512ae25e2ba1e64b))


### Changed

* Automatically add devops to changes in .env.example ([c35f716](https://github.com/ParabolInc/parabol/commit/c35f716fad63262b017e9b979a33622e7b5ad5e2))
* Check SERVER_ID in generateUID ([#9270](https://github.com/ParabolInc/parabol/issues/9270)) ([7b8ead0](https://github.com/ParabolInc/parabol/commit/7b8ead0b34d09baa8c9a2ccd05eedc62e040ddee))
* efficient webpack bundles ([#9256](https://github.com/ParabolInc/parabol/issues/9256)) ([01d04fc](https://github.com/ParabolInc/parabol/commit/01d04fcd4b47df78c40f517d3fcd14755ef639b2))
* keep release process in GitHub ([#9165](https://github.com/ParabolInc/parabol/issues/9165)) ([b5a7e58](https://github.com/ParabolInc/parabol/commit/b5a7e58e455bcdaaa41eafa93b2af8c64ed700ff))
* rename services in datadog trace ([#9048](https://github.com/ParabolInc/parabol/issues/9048)) ([108dc46](https://github.com/ParabolInc/parabol/commit/108dc46d3aa355524d6eabdd5e1c336350c65c5a))
* Restrict prompt to join org to a smaller set of orgs ([#9265](https://github.com/ParabolInc/parabol/issues/9265)) ([8cbc121](https://github.com/ParabolInc/parabol/commit/8cbc12182c45a2050048e088555a30dea3e0198d))
* Reuse data loader for analytics ([#9239](https://github.com/ParabolInc/parabol/issues/9239)) ([b4821d2](https://github.com/ParabolInc/parabol/commit/b4821d25efe8f3a067f75a0fc68a1fbe0fe92359))
* Update auto-request-reviewer workflow ([e581bc8](https://github.com/ParabolInc/parabol/commit/e581bc82ec306ad3c581ac369b026db94476edf8))
* webpack client and server in parallel ([#9279](https://github.com/ParabolInc/parabol/issues/9279)) ([fb34aa1](https://github.com/ParabolInc/parabol/commit/fb34aa1e92b84be014d19763adfd155d0b5df346))

## [7.10.0](https://github.com/ParabolInc/parabol/compare/v7.9.0...v7.10.0) (2023-12-04)


### Added

* add tooltip to activity library card ([#9236](https://github.com/ParabolInc/parabol/issues/9236)) ([f8511b2](https://github.com/ParabolInc/parabol/commit/f8511b21cac91d7bf3cace828ceb337848bb3ee8))
* gcal invite all by default ([#9260](https://github.com/ParabolInc/parabol/issues/9260)) ([1e71688](https://github.com/ParabolInc/parabol/commit/1e71688e0d711e945ed373b2448b58c067e2f4b3))
* remove gcal flag ([#9251](https://github.com/ParabolInc/parabol/issues/9251)) ([9961e63](https://github.com/ParabolInc/parabol/commit/9961e6305287040179e6a2382f6ad6c9c3035d35))
* update activity library card UI ([#9168](https://github.com/ParabolInc/parabol/issues/9168)) ([662ec2b](https://github.com/ParabolInc/parabol/commit/662ec2bee8ecbb71ce2d6e5718450130eee8bcac))


### Fixed

* cork all http write methods ([#9261](https://github.com/ParabolInc/parabol/issues/9261)) ([d9b6554](https://github.com/ParabolInc/parabol/commit/d9b6554dce372e82a4ef9ba1b4db77d9f4ae1285))
* increases integration icon visibility ([#9164](https://github.com/ParabolInc/parabol/issues/9164)) ([b9bcd69](https://github.com/ParabolInc/parabol/commit/b9bcd6914a8940600a2a5ac886ba2cf64201aa43))


### Changed

* Cleanup Slack/Mattermost/MSTeams notifiers ([#9240](https://github.com/ParabolInc/parabol/issues/9240)) ([3bf4b81](https://github.com/ParabolInc/parabol/commit/3bf4b8102cd21a7a7130c028044d8c2251bfab14))
* **dx:** allow any branch with hotfix prefix to build ([#9263](https://github.com/ParabolInc/parabol/issues/9263)) ([619c07c](https://github.com/ParabolInc/parabol/commit/619c07ce3c6eb884d3896a53deab210db2feef84))
* **env-file:** ununsed variables removed ([#9249](https://github.com/ParabolInc/parabol/issues/9249)) ([c155c12](https://github.com/ParabolInc/parabol/commit/c155c12486d3e07384b280b79ec0a0e216343243))
* **metrics:** add metrics to track search query in AL ([#9235](https://github.com/ParabolInc/parabol/issues/9235)) ([bfaccd8](https://github.com/ParabolInc/parabol/commit/bfaccd8154c7a4c4229adce8bf25e5ffc8d11ef0))

## [7.9.0](https://github.com/ParabolInc/parabol/compare/v7.8.1...v7.9.0) (2023-11-29)


### Added

* Add Microsoft login ([#8984](https://github.com/ParabolInc/parabol/issues/8984)) ([c719112](https://github.com/ParabolInc/parabol/commit/c7191125a036d1cc2d9a2a32867dfbf7e34a5219))
* Free trial mutations ([#9132](https://github.com/ParabolInc/parabol/issues/9132)) ([7367b94](https://github.com/ParabolInc/parabol/commit/7367b947189ab734bd3e216b28004b2798cb15a7))
* **kudos:** display notification when kudos received ([#9199](https://github.com/ParabolInc/parabol/issues/9199)) ([8f0e72f](https://github.com/ParabolInc/parabol/commit/8f0e72f829378734069905d8dbe50f691e26e076))
* node update v20.9.0 LTS, req rethinkdb-ts and uWS version bump ([#9232](https://github.com/ParabolInc/parabol/issues/9232)) ([5cc7423](https://github.com/ParabolInc/parabol/commit/5cc742310bd39a3742f6c87316fcab6ba97a0b9a))


### Fixed

* author should be nullable when comment was anonymous ([#9233](https://github.com/ParabolInc/parabol/issues/9233)) ([d67aca2](https://github.com/ParabolInc/parabol/commit/d67aca2d49adbba646b6cf580864ede9ecfffc18))
* release please build add systemtap ([#9241](https://github.com/ParabolInc/parabol/issues/9241)) ([3e0aef3](https://github.com/ParabolInc/parabol/commit/3e0aef3cf2129dfc496a5c14b27b5cb258aa94f4))
* systemtap path ([#9242](https://github.com/ParabolInc/parabol/issues/9242)) ([1d6cca2](https://github.com/ParabolInc/parabol/commit/1d6cca263d4615e5dc41f981ddac4968d57c0af6))


### Changed

* Fix formatting ([#9244](https://github.com/ParabolInc/parabol/issues/9244)) ([275c404](https://github.com/ParabolInc/parabol/commit/275c4045db621b2f87d7735376f1a7f13a99ffea))
* **kudos:** add kudos record when adding emoji reaction ([#9169](https://github.com/ParabolInc/parabol/issues/9169)) ([cecdbe4](https://github.com/ParabolInc/parabol/commit/cecdbe437b10104ce93c29d2245c41d00a96ef49))
* **kudos:** add kudos team settings ([#9163](https://github.com/ParabolInc/parabol/issues/9163)) ([97fba6c](https://github.com/ParabolInc/parabol/commit/97fba6c6933d39625edd2a3e1ae6a20cec6296cc))
* Sorted .env.example and added more documentation ([#9104](https://github.com/ParabolInc/parabol/issues/9104)) ([a26050e](https://github.com/ParabolInc/parabol/commit/a26050ec5ef9ac5a7a3a36805dda2ed0431e6368))

## [7.8.1](https://github.com/ParabolInc/parabol/compare/v7.8.0...v7.8.1) (2023-11-20)


### Fixed

* can auto join with saml login ([#9189](https://github.com/ParabolInc/parabol/issues/9189)) ([22a6cbb](https://github.com/ParabolInc/parabol/commit/22a6cbbdc33314c2063ff4771ba3b525db7eb153))

## [7.8.0](https://github.com/ParabolInc/parabol/compare/v7.7.0...v7.8.0) (2023-11-20)


### Added

* add GCS as a FileStore ([#8493](https://github.com/ParabolInc/parabol/issues/8493)) ([9c33025](https://github.com/ParabolInc/parabol/commit/9c330250d00ef30e6439ac089c634300058a46ba))
* **admin:** Base Org Admin role ([#9194](https://github.com/ParabolInc/parabol/issues/9194)) ([0fdef2d](https://github.com/ParabolInc/parabol/commit/0fdef2d8371be3f65326e28af4a585bc500f0ed3))


### Fixed

* Avoid caching permissions with different arguments ([#8670](https://github.com/ParabolInc/parabol/issues/8670)) ([a6dcd7f](https://github.com/ParabolInc/parabol/commit/a6dcd7fa3ff0b2688067c2f11b393d6d1bf368be))
* **demo:** Don't show top bar or sidebar on demo summary ([#9190](https://github.com/ParabolInc/parabol/issues/9190)) ([a147fa3](https://github.com/ParabolInc/parabol/commit/a147fa34af958a74facde516347d9a8b91e6aa72))
* replace saas url with calculated value for PPMIs ([#9186](https://github.com/ParabolInc/parabol/issues/9186)) ([40872db](https://github.com/ParabolInc/parabol/commit/40872db66596d775949ed08c29a5bd27d456a5f7))
* sort team names alphabetically ([#9187](https://github.com/ParabolInc/parabol/issues/9187)) ([238195d](https://github.com/ParabolInc/parabol/commit/238195db4ff7ec325a753c8f444de814495b7f09))


### Changed

* Handle migration conflicts ([#9166](https://github.com/ParabolInc/parabol/issues/9166)) ([f3aa90d](https://github.com/ParabolInc/parabol/commit/f3aa90dde5faa880014b88a65edbbf603a40200c))
* Users with noTemplateLimit flag can create custom templates ([#9162](https://github.com/ParabolInc/parabol/issues/9162)) ([e150daf](https://github.com/ParabolInc/parabol/commit/e150daf007d4b881265ca0d60245bbf2d03f5454))

## [7.7.0](https://github.com/ParabolInc/parabol/compare/v7.6.7...v7.7.0) (2023-11-13)


### Added

* fix custom template border ([#9131](https://github.com/ParabolInc/parabol/issues/9131)) ([67f8746](https://github.com/ParabolInc/parabol/commit/67f8746c6493e19a32d6e49cb2531e22cab2e6be))


### Changed

* Add SAML setup to new checkout flow ([#9178](https://github.com/ParabolInc/parabol/issues/9178)) ([0434ff3](https://github.com/ParabolInc/parabol/commit/0434ff365c92a1b0db06fa48cf13cc181996beaa))
* Apply no template limit feature flag to some new users ([#9129](https://github.com/ParabolInc/parabol/issues/9129)) ([d45244d](https://github.com/ParabolInc/parabol/commit/d45244d72be5e802a26eb695601ec6f4e9bfe5be))
* Show helpful message in team settings for non-leads ([#9127](https://github.com/ParabolInc/parabol/issues/9127)) ([4d03361](https://github.com/ParabolInc/parabol/commit/4d033616bcdb56a50edd060e25a6d1448de7c278))
* Users with noTemplateLimit flag can use paid templates ([#9160](https://github.com/ParabolInc/parabol/issues/9160)) ([3fc4cab](https://github.com/ParabolInc/parabol/commit/3fc4cabf7eaa392ca276e10da373d16e8c7c6754))

## [7.6.7](https://github.com/ParabolInc/parabol/compare/v7.6.6...v7.6.7) (2023-11-08)


### Fixed

* test, build, release. first pass ([#9138](https://github.com/ParabolInc/parabol/issues/9138)) ([99f9099](https://github.com/ParabolInc/parabol/commit/99f9099ecdff6e8906f1a17285acb8bb8d591fee))


## [7.6.0](https://github.com/ParabolInc/parabol/compare/v7.5.0...v7.6.0) (2023-11-07)


### Added

* **chore:** Add an option to archive all done tasks ([#8958](https://github.com/ParabolInc/parabol/issues/8958)) ([b06f241](https://github.com/ParabolInc/parabol/commit/b06f241e391fc1ae867f7c178660ddeaaf7fb510))
* create ironbank s3 artifacts manual GH ([#9124](https://github.com/ParabolInc/parabol/issues/9124)) ([2df02b2](https://github.com/ParabolInc/parabol/commit/2df02b28becb1dcf83a50888c35366a2f8a10691))
* public teams ([#9057](https://github.com/ParabolInc/parabol/issues/9057)) ([b8c703c](https://github.com/ParabolInc/parabol/commit/b8c703cf38ee2e499703f92778a49f712d2d6f4c))


### Fixed

* autoJoin needs refresh ([#9128](https://github.com/ParabolInc/parabol/issues/9128)) ([678308f](https://github.com/ParabolInc/parabol/commit/678308f2c18da890008e3262519036676ff6affa))
* reference to SendClientSideEvent ([#9119](https://github.com/ParabolInc/parabol/issues/9119)) ([1607fb6](https://github.com/ParabolInc/parabol/commit/1607fb697c048051973e7c7913ca43d77e5aa0a6))
* unable to create org ([#9125](https://github.com/ParabolInc/parabol/issues/9125)) ([27a9efb](https://github.com/ParabolInc/parabol/commit/27a9efbbfd680febbe8f06203dab8e53e5e1fb56))


### Changed

* Add getVerifiedOrgIds tests ([#9036](https://github.com/ParabolInc/parabol/issues/9036)) ([ad6c4ef](https://github.com/ParabolInc/parabol/commit/ad6c4ef64e4a943069b62ed8f58cebd73110d3f6))
* don't lock org in case of failed payment ([#9055](https://github.com/ParabolInc/parabol/issues/9055)) ([78437d1](https://github.com/ParabolInc/parabol/commit/78437d151228db8c46140bb6fac068c6147fd107))
* **github-templates:** Release Test issue template now shows how to check e-mail verifications using debug mail provider. ([#9121](https://github.com/ParabolInc/parabol/issues/9121)) ([46e27d1](https://github.com/ParabolInc/parabol/commit/46e27d1b4ead5ab92a386d45409e8d1cfb572651))
* ironbank github action, update permissions, add proper cp path ([4e4c3ab](https://github.com/ParabolInc/parabol/commit/4e4c3ab6e322ed8eab74019c099a36e4f6cec987))
* ironbank github action, update permissions, add proper cp path ([#9126](https://github.com/ParabolInc/parabol/issues/9126)) ([4e4c3ab](https://github.com/ParabolInc/parabol/commit/4e4c3ab6e322ed8eab74019c099a36e4f6cec987))
* **metrics:** Segment dependency cleanup ([#9092](https://github.com/ParabolInc/parabol/issues/9092)) ([c23494f](https://github.com/ParabolInc/parabol/commit/c23494fb8f18a59dc2ce87dde2c04438c572abdc))
* **Snyk:** Security upgrade mailgun.js from 7.0.4 to 9.3.0 ([#9073](https://github.com/ParabolInc/parabol/issues/9073)) ([5969b41](https://github.com/ParabolInc/parabol/commit/5969b41030df45827d6f44794b604eedc4d7f1eb))
* update sign up redirect destination ([#9071](https://github.com/ParabolInc/parabol/issues/9071)) ([b361515](https://github.com/ParabolInc/parabol/commit/b361515d23ae490b3b5398eb7cec32511d6d8aed))

## [7.5.0](https://github.com/ParabolInc/parabol/compare/v7.4.2...v7.5.0) (2023-11-02)


### Added

* More templates are free now ([#9090](https://github.com/ParabolInc/parabol/issues/9090)) ([7d7c39c](https://github.com/ParabolInc/parabol/commit/7d7c39c10ae016794b2e4c1c8f302467409fc5b9))

## [7.4.2](https://github.com/ParabolInc/parabol/compare/v7.4.1...v7.4.2) (2023-11-02)


### Fixed

* gracefully handle reconnects when servers upgrade ([#9080](https://github.com/ParabolInc/parabol/issues/9080)) ([55b780a](https://github.com/ParabolInc/parabol/commit/55b780a9200336d53d88a0eb2e0971cdb16715d3))

## [7.4.1](https://github.com/ParabolInc/parabol/compare/v7.4.0...v7.4.1) (2023-11-02)


### Fixed

* restore missing pm2.config.js ([#9099](https://github.com/ParabolInc/parabol/issues/9099)) ([596fda7](https://github.com/ParabolInc/parabol/commit/596fda7e96ab873d6f553ab3228cb14b28974f5c))


### Changed

* remove dokku artifacts ([#9095](https://github.com/ParabolInc/parabol/issues/9095)) ([c208222](https://github.com/ParabolInc/parabol/commit/c208222f4b53b07769b9d6441b02c2664cfeb732))

## [7.4.0](https://github.com/ParabolInc/parabol/compare/v7.3.1...v7.4.0) (2023-11-01)


### Added

* adds MoSCoW and RICE prioritization templates ([#9072](https://github.com/ParabolInc/parabol/issues/9072)) ([941ffe1](https://github.com/ParabolInc/parabol/commit/941ffe1a417564a6eafa2d0919ca1758d51f5aa1))


### Fixed

* e-mail love@parabol.com replaced by love@parabol.co ([#9084](https://github.com/ParabolInc/parabol/issues/9084)) ([25cb311](https://github.com/ParabolInc/parabol/commit/25cb311754919a8c483423f7a4fbe93e6db8253b))


### Changed

* **metrics:** Disable client side Segment metrics ([#9067](https://github.com/ParabolInc/parabol/issues/9067)) ([ceb073e](https://github.com/ParabolInc/parabol/commit/ceb073ef1636450d4c3842e3416a13393fda8855))

## [7.3.1](https://github.com/ParabolInc/parabol/compare/v7.3.0...v7.3.1) (2023-10-31)


### Fixed

* do not fail installing service worker on fetch fail ([#9082](https://github.com/ParabolInc/parabol/issues/9082)) ([aad4f05](https://github.com/ParabolInc/parabol/commit/aad4f050232f67456e68472b7ee269eb7aab73b3))

## [7.3.0](https://github.com/ParabolInc/parabol/compare/v7.2.1...v7.3.0) (2023-10-30)


### Added

* autoJoin verified users to team ([#8883](https://github.com/ParabolInc/parabol/issues/8883)) ([af68684](https://github.com/ParabolInc/parabol/commit/af6868486b7bd6772a5b06b91037e2a889eda9cc))
* **zoom-transcription:** split transcript into speaker & words ([#8995](https://github.com/ParabolInc/parabol/issues/8995)) ([f43f6f1](https://github.com/ParabolInc/parabol/commit/f43f6f182b7f5b61dbc1891215f207ace1434e16))
* **zoom-transcription:** UI improvements ([#8993](https://github.com/ParabolInc/parabol/issues/8993)) ([c478e09](https://github.com/ParabolInc/parabol/commit/c478e099a31131f90ebadaa24e16522c2fc324c2))


### Changed

* **auto-join:** verify org founder or billing leads ([#8989](https://github.com/ParabolInc/parabol/issues/8989)) ([6d7e26e](https://github.com/ParabolInc/parabol/commit/6d7e26e0487da49636e63212c16d67c54c3152b1))
* **circleci:** deleted the CircleCI script ([#9070](https://github.com/ParabolInc/parabol/issues/9070)) ([3ee3a09](https://github.com/ParabolInc/parabol/commit/3ee3a09eff38563aea58b79db6aeaa25649bfcb1))
* Delete unused GitHub webhook code ([#8999](https://github.com/ParabolInc/parabol/issues/8999)) ([f2d26de](https://github.com/ParabolInc/parabol/commit/f2d26de8fae71f00fca7fe946312e15ce4cd23e6))
* remove unused filesToCache logic ([#9000](https://github.com/ParabolInc/parabol/issues/9000)) ([ebffc43](https://github.com/ParabolInc/parabol/commit/ebffc43b765650298bb628915984a74b3d2d1126))
* **Snyk:** Security upgrade redhat/ubi8 from 8.6 to 9.2 ([#9054](https://github.com/ParabolInc/parabol/issues/9054)) ([e5f7e7e](https://github.com/ParabolInc/parabol/commit/e5f7e7ecc8ee28deef468df8c9c5b8ae2454e5b7))

## [7.2.1](https://github.com/ParabolInc/parabol/compare/v7.2.0...v7.2.1) (2023-10-27)


### Fixed

* Fix service worker static cache base url ([#9058](https://github.com/ParabolInc/parabol/issues/9058)) ([7c8b576](https://github.com/ParabolInc/parabol/commit/7c8b576337c8e6d5dedd23ca84b65d13d2e2f1d0))
* PR title ([#9066](https://github.com/ParabolInc/parabol/issues/9066)) ([019a0f7](https://github.com/ParabolInc/parabol/commit/019a0f770ab8ad8db041ff8d7189959ea37175f5))


### Changed

* **metrics:** rename column `segmentId` to `pseudoId` ([#9053](https://github.com/ParabolInc/parabol/issues/9053)) ([a826bb7](https://github.com/ParabolInc/parabol/commit/a826bb74feb89390b8585561e78254c4a6b0fd98))
* remove release branch ([#9064](https://github.com/ParabolInc/parabol/issues/9064)) ([252f0db](https://github.com/ParabolInc/parabol/commit/252f0db3b87f7408c556663f4edffa9eedb0a95f))

## [7.2.0](https://github.com/ParabolInc/parabol/compare/v7.1.1...v7.2.0) (2023-10-26)


### Added

* **isEnterprise:** set org as enterprise on new user or org ([#9049](https://github.com/ParabolInc/parabol/issues/9049)) ([7aded86](https://github.com/ParabolInc/parabol/commit/7aded86146efb1d09efdb5f44ade08971c0e8ccc))
* **meeting-inception:** implement add an activity button ([#8912](https://github.com/ParabolInc/parabol/issues/8912)) ([ca7384e](https://github.com/ParabolInc/parabol/commit/ca7384ece915dbc319a3594635be1fa7cf8d5f06))
* **slack:** Send certain notifications via slack DM ([#8983](https://github.com/ParabolInc/parabol/issues/8983)) ([c94d4d9](https://github.com/ParabolInc/parabol/commit/c94d4d958b1b741b54a11a921933bff4d397af30))


### Fixed

* use SendClientSideEvent for add activity button ([#9056](https://github.com/ParabolInc/parabol/issues/9056)) ([d5649f2](https://github.com/ParabolInc/parabol/commit/d5649f2a33b77cfd94df4913d7e098d58259f8a7))


### Changed

* build bumps version in gitlab ([#9050](https://github.com/ParabolInc/parabol/issues/9050)) ([5fe5ba0](https://github.com/ParabolInc/parabol/commit/5fe5ba0e05ad0aad3d386a9e826274b520ec877c))
* **deps:** bump @babel/traverse from 7.16.7 to 7.23.2 ([#8980](https://github.com/ParabolInc/parabol/issues/8980)) ([576c132](https://github.com/ParabolInc/parabol/commit/576c132e5dfd1718a4d1326f6cdf04ad0c31f714))
* **metrics:** Add client side metric Amplitude tracking ([#8992](https://github.com/ParabolInc/parabol/issues/8992)) ([43e5eb3](https://github.com/ParabolInc/parabol/commit/43e5eb301571141b0564f6605b60cb6dd2b92deb))
* **metrics:** Disable server Segment events ([#9051](https://github.com/ParabolInc/parabol/issues/9051)) ([a1a565b](https://github.com/ParabolInc/parabol/commit/a1a565b0eda6e85773e9e4ea34774efaf64f83ef))
* **Snyk:** Security upgrade node from 18.17.0 to 18.18.2 ([#8966](https://github.com/ParabolInc/parabol/issues/8966)) ([55e5fdb](https://github.com/ParabolInc/parabol/commit/55e5fdb997ff21f30d1436e0ba5be031ae1ba8f7))
* **Team Insights:** Limit most used retro templates ([#8982](https://github.com/ParabolInc/parabol/issues/8982)) ([b9e179a](https://github.com/ParabolInc/parabol/commit/b9e179ac72045939968dfb7fd87da0e13a4ef214))

## [7.1.1](https://github.com/ParabolInc/parabol/compare/v7.1.0...v7.1.1) (2023-10-25)


### Changed

* Link to correct CHANGELOG ([#9044](https://github.com/ParabolInc/parabol/issues/9044)) ([f0ffa0b](https://github.com/ParabolInc/parabol/commit/f0ffa0b600072325e29c338e0959c6ace4942e88))

## [7.1.0](https://github.com/ParabolInc/parabol/compare/v7.0.1...v7.1.0) (2023-10-25)


### Added

* upgrade PG to v15.4 for local dev ([#8965](https://github.com/ParabolInc/parabol/issues/8965)) ([a6ba7a7](https://github.com/ParabolInc/parabol/commit/a6ba7a7ee0b2dc2d008fcb4302f47f62386d46c4))


### Changed

* add dd-ci to package.json ([#9041](https://github.com/ParabolInc/parabol/issues/9041)) ([7cfccd6](https://github.com/ParabolInc/parabol/commit/7cfccd6a76425b2435d5ba6c304e686805a29146))

## [7.0.1](https://github.com/ParabolInc/parabol/compare/v7.0.0...v7.0.1) (2023-10-24)


### Fixed

* await last migration ([#9037](https://github.com/ParabolInc/parabol/issues/9037)) ([8a3003d](https://github.com/ParabolInc/parabol/commit/8a3003d9cbaeb2c7c0c70f22e28a2bd8fc87b2f3))

## [7.0.0](https://github.com/ParabolInc/parabol/compare/v6.125.0...v7.0.0) (2023-10-23)


### ⚠ BREAKING CHANGES

* None, but we moved to the new infra

## [6.125.0](https://github.com/ParabolInc/parabol/compare/v6.124.0...v6.125.0) (2023-10-23)


### Added

* add no template limit flag ([#8997](https://github.com/ParabolInc/parabol/issues/8997)) ([45fa414](https://github.com/ParabolInc/parabol/commit/45fa414afaf627af3b7c71a7de7a295c14f9bda6))
* **ci:** adding release-please action to use the branch release to generate the Changelog ([#8975](https://github.com/ParabolInc/parabol/issues/8975)) ([e8a38bd](https://github.com/ParabolInc/parabol/commit/e8a38bd4c0a2708ef3d00d3f93e7ba790441af7d))
* implement autoJoin mutation ([#8878](https://github.com/ParabolInc/parabol/issues/8878)) ([d07fda6](https://github.com/ParabolInc/parabol/commit/d07fda6bbfbacf1180493abd4914af1c44f9a7b7))
* **redis:** upgrade to use Redis 7 ([#8970](https://github.com/ParabolInc/parabol/issues/8970)) ([15281d7](https://github.com/ParabolInc/parabol/commit/15281d7b04a7dfaf929217cb25698b50abf5b7b7))
* **standups:** Response permalink sharing ([#8986](https://github.com/ParabolInc/parabol/issues/8986)) ([f72d8f3](https://github.com/ParabolInc/parabol/commit/f72d8f31d5dd67a446b80ebca42d5a6472cef110))
* **Team Insights:** Update dash after each meeting ([#8893](https://github.com/ParabolInc/parabol/issues/8893)) ([e3e0feb](https://github.com/ParabolInc/parabol/commit/e3e0feb71b9d9ae5d5c712ce2039a8e14ee32a66))
* **your-work:** gCal integration ([#8939](https://github.com/ParabolInc/parabol/issues/8939)) ([59a389a](https://github.com/ParabolInc/parabol/commit/59a389a2c0d5930405332fba46611744735cef79))
* **your-work:** Jira Integration pagination ([#8916](https://github.com/ParabolInc/parabol/issues/8916)) ([33ed3c1](https://github.com/ParabolInc/parabol/commit/33ed3c1c3924025c18576591b0973f94799d2554))
* **your-work:** Open your work drawer by default ([#8957](https://github.com/ParabolInc/parabol/issues/8957)) ([540a6de](https://github.com/ParabolInc/parabol/commit/540a6de30377eb1f0d6f48177434353730788d4f))
* **your-work:** Product analytics ([#8956](https://github.com/ParabolInc/parabol/issues/8956)) ([094f5f4](https://github.com/ParabolInc/parabol/commit/094f5f49d15e6b98dc7437b741b6e8935e4c95ad))
* **your-work:** Provide link to integration settings on error + no data ([#8987](https://github.com/ParabolInc/parabol/issues/8987)) ([a6520c1](https://github.com/ParabolInc/parabol/commit/a6520c174cbaee1d306f2e492d522b75a7f1c472))


### Fixed

* dailyPulse handle nulls ([#8977](https://github.com/ParabolInc/parabol/issues/8977)) ([00447aa](https://github.com/ParabolInc/parabol/commit/00447aa9ac97e52449de23f3284e09cae9ff7bfe))
* Do not serve cached opaque responses if possible ([#8950](https://github.com/ParabolInc/parabol/issues/8950)) ([bcc4664](https://github.com/ParabolInc/parabol/commit/bcc4664440210bbed701bf194c7701de6fab3055))
* dockerize ignores git tags ([#9027](https://github.com/ParabolInc/parabol/issues/9027)) ([e9ae97e](https://github.com/ParabolInc/parabol/commit/e9ae97e24b24957a76df6823768b1f1f4c13ea90))
* open popup n'sync ([#8967](https://github.com/ParabolInc/parabol/issues/8967)) ([b7a4e1a](https://github.com/ParabolInc/parabol/commit/b7a4e1a923f37499824081e088e0e2204ca81960))
* re-add serverHealthChecker ([#9024](https://github.com/ParabolInc/parabol/issues/9024)) ([e8731dc](https://github.com/ParabolInc/parabol/commit/e8731dc75604046f6720e593634a820365292549))
* remove health check ([#9001](https://github.com/ParabolInc/parabol/issues/9001)) ([7dd0a8a](https://github.com/ParabolInc/parabol/commit/7dd0a8a97695992c0c48998107a76dfefa5a5c2f))
* SWOT typo ([#8979](https://github.com/ParabolInc/parabol/issues/8979)) ([dc0f62d](https://github.com/ParabolInc/parabol/commit/dc0f62d1b8e51e941c689dc3117c7578d561694c))
* Upgrade Sentry ([#9023](https://github.com/ParabolInc/parabol/issues/9023)) ([8449ad1](https://github.com/ParabolInc/parabol/commit/8449ad186b2ea5de9024c37d30dd907682079532))


### Changed

* **ci:** package name removed from the PR title ([173851f](https://github.com/ParabolInc/parabol/commit/173851f5b66147775f7a9b9dfd88dc8fa02fbd32))
* **ci:** Release please now will not include the component name on the tags. Tag release will be added to the Release Please PRs ([f9e28dc](https://github.com/ParabolInc/parabol/commit/f9e28dc777e522ee1db5a8c80ea7c4f3e50662af))
* **Snyk:** Security upgrade @aws-sdk/client-s3 from 3.315.0 to 3.347.1 ([#8345](https://github.com/ParabolInc/parabol/issues/8345)) ([ca089b9](https://github.com/ParabolInc/parabol/commit/ca089b9eb7b36aea77b608562e3e0f42d8897479))
* **Snyk:** Security upgrade sharp from 0.30.7 to 0.32.6 ([#8905](https://github.com/ParabolInc/parabol/issues/8905)) ([0dfc94d](https://github.com/ParabolInc/parabol/commit/0dfc94df194a16924ced123673b43a8a37bc7883))
* **Snyk:** Security upgrade undici from 5.25.4 to 5.26.2 ([#8968](https://github.com/ParabolInc/parabol/issues/8968)) ([1c69ab5](https://github.com/ParabolInc/parabol/commit/1c69ab53b6de986aff2011625205e36746dc0f57))

## 6.124.0 2023-Oct-10

### Added

- **ad-hoc**: Add create team dialog (#8846)
- **your-work**: GitHub repo filter (#8899)
- **SAML**: Support attributes with namespace (#8931)
- handle redirect in email verification (#8915)
- migration adds customer feedback RID template (#8928)
- migration adds 360 review RID templates (#8946)

### Fixed

- fix check-in discussion panel layout (#8923)
- move PRODUCTION bool to build time (#8747)
- CI=true for build action (#8938)
- Allow running tests on CI without real Stripe calls (#8944)

### Changed

- Log unexpected SAML errors to sentry (#8927)
- **deps**: bump get-func-name from 2.0.0 to 2.0.2 (#8898)
- **deps**: bump systeminformation from 5.9.17 to 5.21.11 (#8945)
- **deps-dev**: bump postcss from 8.4.21 to 8.4.31 (#8930)
- test sentry and dd uploads (#8926)
- renderLoader should be a Loader component (#8947)
- **SAML**: Improved error message when email attribute is missing (#8933)
- log recall error (#8954)

## 6.123.1 2023-Oct-04

### Fixed

- saml urls #8918

## 6.123.0 2023-Oct-04

### Added

- Google Calendar: add Google Meet (#8818)
- Added meeting link to a meeting summary (#8892)
- Add support for multi-replica deploys (#8837)

### Fixed

- Remove display: inherit from standup response card in the meeting summary (#8910)

### Changed

- **CI**: adding release branch to the build action (#8888)
- Google Calendar: change gcal creds to google creds (#8896)
- Google Calendar: update gcal modal description (#8897)

## 6.122.0 2023-Sep-27

### Added

- **ci**: adding release branch to the build action (#8888)
- **gcal**: add Google Meet (#8818)
- **Team Insights**: Add most used retro templates (#8879)
- **Team Insights**: add meeting engagement insights (#8877)
- **docker-pipeline**: arm64 platform built alongside amd64 (#8229)
- add tailwind to emails (#8327)
- **dokku**: add one more web server (#8889)
- show sidebar by meeting summary (#8857)
- **standups**: Display responses in single column (feature flagged) (#8875)
- improve ai summary prompt to include markdown (#8859)
- store freemail domains in pg (#8870)
- upgrade openai (#8873)
- **invitation-challenges**: implement InboxReady's validate check (#8707)
- Show link to guide on Jira auth popup close (#8867)
- **standups**: Add slack configuration link to standup options (#8861)
- **ad-hoc**: allow to create team from teams dropdown (#8831)
- Add standup demo video to empty meeting view (#8862)
- **al**: Show standup meeting type first in all views (#8864)
-

### Fixed

- read SAML from PG (#8906)
- use google creds instead of gcal (#8895)
- add transcription during discuss phase (#8580)
- **Prompt to join org**: reverse feature flag (#8886)
- loom links wrap, changed layout to single column (#8884)
- emoji tooltip info is wrong in a standup discussion drawer (#8842)
- **standups**: 'Your tasks' -> 'Your work' (#8874)
- **billing**: Stop updating Enterprise Stripe subscription quantities to AU count (#8850)
- **analytics**: Move server side segmentIo calls to analytics.ts (#8795)
- **prompt to join org**: restrict to verified users (#8798)
- **one-on-one**: Add team exists warning (#8718)
- Add warning to getDataLoader (#8852)
- **metrics**: Add Amplitude client-side page view tracking (#8797)
- track download to pdf (#8854)

## 6.121.0 2023-Sep-20

### Added

- SAML self-serve (#8802)
- download summary as pdf (#8845)
- **standups**: 'Your work' GitHub integration (#8724)

### Fixed

- allow to set task max-width (#8819)
- filter tasks that are being created by different users in your work drawer (#8829)
- remove memory leak from analytics (#8839)
- **check-in**: fix navigating from first call to a new agenda item (#8833)

## 6.120.0 2023-Sep-13

### Added

- scroll to card section (#8774)
- invite link in right drawer (#8806)

### Changed

- Delete unused file (#8790)
- update instances of GitLab logo SVG (#8783)
- **one-on-one**: show organiation picker if can't determine org automatically (#8712)
- remove unused REDIS_URL
- Allow google to index /create-account (#8811)
- Update dev readme with assign SU script (#8815)

### Fixed

- **gcal**: handle Zoom add-on conflict (#8776)
- prevent newly added agenda item to be accessible when agenda items phase has not been started yet (#8799)
- make new agenda items accessible from first call phase (#8835)
- removed default button background from your tasks button (#8805)

## 6.119.0 2023-Sep-6

### Added

- **gcal**: gcal date UI/UX (#8696)
- Update Slack message on meeting rename (#8768)
- **standups**: rich text in slack notifications (#8715)

### Changed

- support SSL for redis (#8488)

### Fixed

- Check if team member status on accepting an invite twice (#8735)
- too long reflect prompt ids broke the retro (#8789)

## 6.118.0 2023-Aug-31

### Added

- give users feedback if there's a gcal error (#8694)
- first pass at lastUsedAt caching (#8708)
- **one-on-one**: add user picker styles (#8700)
- **one-on-one**: Add user picker (#8666)
- **one-on-one**: allow oneOnOne input in startCheckIn mutation (#8629)
- Add "Is this helpful?" for insights (#8695)
- **standups**: "Add task" button in Parabol task drawer (#8716)
- **standups**: "Your tasks" drawer with Parabol tasks (#8690)

### Changed

- remove **PROJECT_ROOT** (#8746)
- docker rm queryMap (#8745)
- no minify server (#8761)

### Fixed

- fix cleanup-changelog.sh on mac os (#8685)
- user tasks should not return from archived teams (#8728)
- **analytics**: Route analytics identify calls through analytics.ts (#8699)
- **analytics**: Add Amplitude server side event tracking (#8681)
- Show correct error message on login failure with invitation (#8726)
- **standups**: Selecting team in Parabol card throws error (#8738)

## 6.117.1 2023-Aug-28

### Changed

- **ci**: CircleCI using the new staging domain (#8729)
- **doc**: release test template issue and manual testing guide updated with the new release url (#8736)

### Fixed

- Allow login with google with ad blocker enabled (#8734)

## 6.117.0 2023-Aug-23

### Added

- **gcal**: invite members from modal (#8662)
- **tiptap**: Loom embed extension (#8612)
- **gcal**: unauthed schedule button ux (#8688)

### Changed

- Normalize link styles (#8671)
- avatar update (#8536)
- Allow non-facilitator to advance to reflect phase (#8693)
- Show disabled Team Health option to Starter tier (#8686)

### Fixed

- exit early if no segment write key (#8682)
- Uncompressing emojies twice causes a failure (#8687)
- **tiptap**: Show `<hr/>` nodes (#8697)
- **standups**: do not open links twice (#8658)
- **ai-summary**: update the prompt to emphasize brevity (#8703)

## 6.116.0 2023-Aug-16

### Added

- **standups**: Standup AI Summaries (#8569)
- **standups**: Notify slack when user submits standup response (#8607)
- **standups**: Post standup responses in 'meeting ended' message thread (#8610)

### Changed

- Cleanup old starter tier organizations (#8617)
- **one-on-one**: add oneOnOne org feature flag (#8571)
- **one-on-one**: add one-on-one meeting template (#8573)
- CI=true in tests (#8638)
- **gcal**: implement oauth (#8594)
- Build once, run everywhere (#8557)
- **deps**: bump word-wrap from 1.2.3 to 1.2.4 (#8543)
- **deps**: bump import-in-the-middle from 1.4.1 to 1.4.2 (#8632)
- **deps**: bump protobufjs from 7.2.3 to 7.2.4 (#8494)
- **deps**: bump semver from 5.7.1 to 5.7.2 (#8645)
- **deps**: bump tough-cookie from 4.1.2 to 4.1.3 (#8495)
- active plan visual cue (#8637)
- fix a couple vulns (#8648)
- **suggest-groups**: increase number of suggested groups (#8625)
- add version and sha to predeploy logs (#8646)
- use client dir for index.html

### Fixed

- Promote new facilitator when facilitator leaves the team (#8611)
- Remove check for whether template was updated (#8626)
- **al**: Number of activities exceeds number requested (#8641)
- prevent scroll jump when emoji is added (#8630)
- fix share topic modal don't see slack integration (#8652)
- include TeamPromptResponseEmojis_response in UpsertTeamPromptResponseMutation_meeting to prevent undefined emoji list when adding initial standup response (#8655)
- build in dev mode from clean clone (#8661)
- **analytics**: preserve GA4 client_id after sign-up/sign-in (#8650)
- Show Team Insights emojis correctly (#8667)
- terser in prod build (#8665)
- Uncompressing emojies twice causes a failure (#8687)
- re-add getProjectRoot in preDeploy
- re-add minification to client build
- check favicon in build
- Remove segment when the env var is missing (#8674)
- use-credentials for manifest.json in staging

## 6.115.0 2023-Aug-01

### Added

- Activity Library: roll out Activity Library to all new users (#8574)
- Add emoji insights (#8563)
- AI Summary: Replace GPT-3 with GPT-3.5 for aiSummary (#8227)
- Humanize count down timer (#8596)

### Changed

- Update enterprise advantages (#8577)
- Remove and ignore pg.d.ts (#8587)

### Fixed

- Fix open pgtyped connections after running yarn dev (#8583)
- Do not trust invites sent to emails from the untrusted domains (#8584)
- unable to ungroup some reflection groups (#8623)
- increase size of the runner used for the build action (#8619)
- make AIGeneratedDiscussionPrompt org level feature flag (#8601)

## 6.114.1 2023-Jul-31

### Fixed

- initialize reduce function in getLastUsedDateForTeams

## 6.114.0 2023-Jul-26

### Added

- teams view (#8510)
- Add team filter in timeline history page (#8521)
- **discussionPromptQuestion**: Generate discussion prompt question for discussions (#8462)
- show stripe invoices (#8534)
- Add meetings to the team dashboard (#8551)
- add gcal integration user flag (#8180)
- add gcal integration UI (#8181)
- Add team insights feature flag and types (#8556)
- implement logic for new ready button (#8532)

### Changed

- **share-summary**: add utm params and reflectionGroupId param (#8522)
- bump node to 18.17.0 (#8565)

### Fixed

- **standups**: Error when ending standup (#8540)
- Correctly show error when email invite fails (#8541)
- stripe console err (#8545)
- **al**: Speedup subcategory resolver (#8564)

## 6.113.0 2023-Jul-19

### Added

- add Zoom transcription bot in discuss phase (#8517)
- retry invoice after failed payment (#8478)
- show loading feedback while upgrading (#8514)
- Add timer sound effect (#8508)
- **share-summary**: Share summary mutation (#8412)
- Add eventType filter in timeline view (#8397)
- Add Team Health tips (#8506)

### Changed

- add RetroReflectionGroup table to PG (Part 1 of 3) (#8504)
- **share-summary**: share summary dialog UI (#8463)
- add radix Select component (#8460)
- Replace TeamHealth answer emojis with their text representation (#8449)
- remove old autogroup mutation (#8505)

### Fixed

- can create team within existing org (#8512)
- avoid pronoun assumptions in ai summary (#8509)

## 6.112.0 2023-Jul-12

### Changed

- drop unused RethinkDB tables (#8501)
- bump pg to v12.15 (#8487)

### Fixed

- show correct drawer info after upgrade (#8485)
- use unique server name for fresh namespace (#8416)
- replace xml-lint due to mem leak (#8499)
- Fix create Parabol task in Sprint Poker (#8496)
- Limit number of teams that can be moved in one moveTeamToOrg call (#8486)
- can create tasks (#8472)

### Added

- add invite all checkbox (#8482)
- add metrics to invite on team creation (#8479)
- invite users on team creation (#8476)
- **suggest-groups**: add suggest groups metrics (#8459)
- **suggest-groups**: add loading feedback while waiting for OpenAI response (#8440)
- chronos in monorepo (#8429)
- refactor postDeploy to preDeploy (#8446)
- add radix Dialog component (#8450)
- upgrade graphiql (#8461)

## 6.111.0 2023-Jul-05

### Added

- **checkout-flow**: update credit card functionality (#8423)
- **suggest-groups**: improve suggest groups prompt (#8436)
- **suggest-groups**: update groups for subscribers (#8437)
- **suggest-groups**: add suggest groups tooltip (#8439)
- **suggest-groups**: add loading feedback while waiting for OpenAI response (#8440)
- **suggest-groups**: add reset groups button (#8445)
- **suggest-groups**: add suggest groups metrics (#8459)

### Changed

- added Tailwind CSS migration readme (#8321)
- add task and comment to release checks (#8473)
- hide invoices for enterprise users (#8474)

### Fixed

- Fix optimistic update for create task in Sprint Poker (#8451)
- replacing the azure devops icon with the correct size (#8067)
- Show error message when creating Jira task fails (#8438)
- revert setting integration as null in CreateTaskMutation (#8472)

## 6.110.0 2023-Jun-28

### Added

- **Checkout flow**: update checkout flow after upgrade (#8354)
- **Share summary**: Add share topic button to meeting summary (#8331)
- **Activity library**: Activity subsections for retros (#8413)
- **Activity library**: Show activity description when hovering over activity card (#8394)

### Changed

- **Prompt to join** remove isSAMLVerified check (#8441)
- add sql to kill all pg connections (#8427)
- add assignSURole script (#8428)
- revert add temporary story points update result logging (#8417)
- remove useActivityDetails (#8293)
  improve error message when a user cannot join an org (#8455)

### Fixed

- canAccess for organization (#8411)
- types in meeting tips; prevent rendering undefined (#8443)
- dd-trace and relay mem leaks (#8389)

## 6.109.2 2023-Jun-26

### Fixed

- Do not show upgrade prompt for fixed activities

## 6.109.1 2023-Jun-22

### Fixed

- Seasonal templates appropriately hidden (#8426)
- Users not on team but on same org don't see team-scoped templates (#8426)

## 6.109.0 2023-Jun-22

### Added

- **metrics**: Add hasTeamHealth to meeting properties for meeting related events (#8396)
- **al**: New header (#8388)
- **templateLimits**: Show upgrade prompts in Activity Library (#8358)
- add comments for supporting multi-platform builds (#8403)

### Changed

- Limit MailManagerDebug filename length (#8391)
- **checkout-flow**: handle failing 3D Secure card auth (#8289)
- Cleanup CHANGELOG (#8379)
- removed old apollo gql extension config (#8399)
- Remove default_incomplete payment behaviour for old subscription flow (#8418)

### Fixed

- **prompt-to-join**: fix add teammate dialog scroll (#8393)
- reset retro groups with team health (#8392)
- del instead of hdel
- **retros**: When skipping phases, mark interim stages as complete (#8374)

## 6.108.0 2023-Jun-15

### Added

- add team filter in meeting view (#7854)
- text align center for icebreakers (#8306)
- **Team Health**: enable team health by default for paid tiers (#8348)
- **Team Health**: Add setting to new activity library (#8375)

### Changed

- Adds new template for design issues (#8261)
- **gh-actions**: merge check and build (#8221)
- **docker-image**: self-hosted folder added in HOME directory (#8361)
- **template-limits**: remove template limit feature flag (#8359)

### Fixed

- **standups**: allow selecting text within the standup response drawer (#8339)
- **teams-limit**: remove teams limit when upgrading to enterprise (#8367

## 6.107.3 2023-Jun-13

### Fixed

- Use latest undici to (hopefully) fix mem leak in fetch

## 6.107.2 2023-Jun-09

### Fixed

- Bump max mem restart to 24GB to support heapdumping GQL Executor

## 6.107.1 2023-June-8

### Fixed

- Many public templates not displayed

## 6.107.0 2023-June-7

### Added

- add zoom transcription (#7949)
- **checkout-flow**: add org details (#8280)
- **team health**: voting and reveal (#8286)
- **Team Health**: Add summary (#8298)
- **DX**: Infer parent portal IDs through React context (#8310)
- **checkout-flow**: credit card UI (#8318)
- **analytics**: Track meeting category on meeting start (#8336)
- **rid**: Add new users to feature flag (#8337)
- **rid**: Add pre-/post-mortem templates (#8319)

### Fixed

- auto update billing leader (#8277)
- **prompt-to-join**: fix add teammate routing when opened on a new tab (#8302)
- **rid**: Correct styles for non-owner readonly scales (#8301)
- fix loader.load with undefined in accept team invitation (#8300)
- Drain rethinkdb pool after running all migrations (#8315)
- **rid**: Long team names truncate instead of wrapping (#8311)
- update the default enterprise plan ID (#8320)
- dumpHeap to /tmp directory (#8325)
- show all slack channels in dropdown (#8329)
- better description for failed to execute removeChild on Node error (#8333)

### Changed

- **prompt-to-join**: disable buttons when running accept request mutation(#8297)
- remove slackin broken link from readme (#8307)
- remove rethink templates (#8217)
- refactor updateUserProfile (#8295)
- **prompt-to-join**: allow non-verified emails (#8313)
- refactor FileStoreManager API (#8294)
- updating plans UI for mobile screens (#8075)
- use git clean under the hood of yarn clean (#8342)

## 6.106.0 2023-May-31

### Added

- **suggest-groups**: click button to group reflections (#8132)

### Fixed

- **rid**: Fix changing prompt colors in activity library (#8279)
- **recurrence**: Incorrect start times due to timezone weirdness (#8269)
- **summaries**: Race condition around bulk task exports (#8287)

## 6.105.1 2023-May-31

### Fixed

- dumpHeap PROJECT_ROOT

### Changed

- **share-summary**: Add feature flag (#8249)

## 6.105.0 2023-May-24

### Added

- **summaries**: Bulk task export button (#7933)
- **checkout-flow**: handle 3D Secure cards (#8162)
- **standups**: Meeting ended integration notification (#8258)
- **retros-in-disguise**: added standup activity details (#8199)
- **Team Health**: add new stage to retrospective (#7942)
- **rid**: Sidebar for standups + checkins (#8226)
- mutable category (#8159)
- **metrics**: Add event parameter is_patient_0 to GA4 sign up events (#8223)
- **rid**: Add feature flag based on params for email + google signups (#8211)
- **prompt-to-join**: Add teammate mutation (#8160)
- Don't show discussion mention toast if already on stage (#8270)

### Fixed

- update max token limit (#8267)
- **copy**: Make copy for ending meeting consistent (#8256)
- Fix team change in new meeting window (#8253)
- **tiptap**: Prevent showing edit components in readonly mode (#8259)
- **discussions**: Fix editing comments in standups + check-ins (#8248)
- NewMeeting dialog rendered the dashboard twice (#8246)
- refactor addFeatureFlagToOrg to updateOrgFeatureFlag (#8244)
- **docker**: documentation on how to build the docker image locally improved (#8230)
- **chore**: properly count emojis length (#8116)
- add checkout flow tracking (#8235)
- **prompt-to-join**: domainJoinRequest - replace string id with auto increment (#8191)
- Add subject explicitly to create Jira key script (#8237)
- regenerate yarn.lock (#8236)
- remove \_\_jsxRuntime path (#8154)
- **rid**: Navigate to activity lib for floating action button (#8215)
- slack notification race condition (#8197)
- **standups**: Remove CSV download button in standups (#8255)
- checkbox color overriden by styled components (#8257)

## 6.104.0 2023-May-17

### Added

- **recurrence**: Prev/next meeting navigation (#8157)
- **rid**: Enter edit mode automatically for new templates (#8156)
- **pipeline**: Docker build pipeline (#8030)
- **checkout-flow**: add billing leader functionality (#8121)
- can edit & delete AI comment (#8164)
- prime new columns on MeetingTemplate (#8081)
- **rid**: Navigate to activity lib by default from CTA (#8210)
- build no-deps (#8196)

### Fixed

- remove flushall redis on migrate (#8175)
- **rid**: Ignore category in search empty state (#8144)
- more logs for voting error (#8167)

### Changed

- **pg-migrations**: message when no migrations need to be run on PG showing it is actually PosgreSQL (#8174)
- ignore generated files in PR size (#8165)
- Verify all checked in generated files are clean (#8161)
- AI opt out at org level (#8163)
- **deps**: bump vm2 from 3.9.17 to 3.9.18 (#8198)
- remove node-fetch from app code (#8178)

## 6.103.0 2023-May-05

### Added

- **retros-in-disguise**: Prompt user to use org scope (#8120)
- **retros-in-disguise**: Create new poker template (#8143)
- **retros-in-disguise**: Poker details view (#8131)
- **prompt-to-join**: Allow to open add teammate dialog from the snackbar (#8136)
- **suggest-groups**: Add suggestGroups org feature flag (#8130)
- add mainCategory and illustrationUrl to MeetingTemplate (#8074)

### Fixed

- subscribe to acceptInvite paylods in subscription (#8127)

## 6.102.0 2023-May-3

### Added

- **retros-in-disguise**: added create new activity view (#8069)
- **rid**: Edit Mode (#8108)
- add more dd tracing (#7774)
- **templates**: Share to org by default (#8129)

### Changed

- remove User table from RethinkDB (#8115)
- bump webpack to secure version
- generate kysely schema in dev (#8114)
- **security**: bump vulnerable packages (#8135)

### Fixed

- **stripe**: do not update subscription quantity on enterprise annual plan (#8105)

## 6.101.0 2023-Apr-26

### Added

- Throw and catch GraphQL errors on the client (#7932)
- **retros-in-disguise**: Clone template (#8036)
- Create new Github Action - Notify on bug assignment (#8058)
- Create updateSAML mutation (#7685)
- **checkout-flow**: handle credit card functionality (#8005)
- **recurrence**: Use the prompt from the most recent meeting in the series (#8095)
- **prompt-to-join**: Add request to join domain mutation (#8040)

### Changed

- refactor MeetingTemplate reads to PG (#8015)
- refactor notifications to SDL (example PR) (#8018)
- bump vm2 from 3.9.16 to 3.9.17 (#8078)

### Fixed

- Fix duplicate charge on failed payment (#8072)
- Fix default standup name (#8079)

## 6.100.0 2023-Apr-19

### Added

- **retros-in-disguise**: Retro Details Sidebar (#8008)
- **metrics**: Add icloud.com as another generic domain (#8049)
- user presence supports k8s (#7208)
- **deps**: bump vm2 from 3.9.15 to 3.9.16 (#8035)
- **prompt-to-join**: Add "would you like to join org" notification (#8003)
- **retros-in-disguise**: Create retro template from retro categories view (#8027)
- improve tailwind classes specificity (#8064)
- **checkout-flow**: right drawer (#8004)

### Fixed

- ensure task exists (#8042)
- ensure teamMembers exist in payload (#8043)
- when user leaves team, do not remove estimate stages they created (#8045)
- add args to dd-trace (#7766)
- expire failed login attempts (#8038)
- Rename makeTemplateDescription -> useTemplateDescription to satisfy hooks rules (#8066)
- prevent repeating date in stanudps name (#8059)
- remove tailwind selector strategy (#8068)

## 6.99.1 2023-Apr-17

### Fixed

- More strict for sending email invites from temp email services

## 6.99.0 2023-Apr-12

### Added

- **retros-in-disguise**: Activity Details (no sidebar) (#7990)
- **retros-in-disguise**: Added activity library as a nav item (#8029)

### Changed

- move new feature announcement to main Dashboard (#8028)
- removed private schema dropdown in graphiql (#7997)
- bump vm2 from 3.9.11 to 3.9.15 (#8014)

### Fixed

- **recurrence** update recurrenceSettings call (#8019)
- syntax error when adjusting the user tier with empty list (#7935)
- missing font styles on inputs, textareas etc (#8031)
- **sprint-poker**: workaround for adding Parabol tasks (#8032)

## 6.98.1 2023-Apr-10

### Fixed

- Added missing NotificationMeetingStageTimeLimitEnd to rootTypes

## 6.98.0 2023-Apr-06

### Added

- **retros-in-disguise**: Activity categories (#7927)
- **retros-in-disguise**: Added activity library cards (#7908)
- **recurrence**: Allow changing meeting series name (#7850)
- **recurrence**: End Recurring Meeting Confirmation Modal (#7998)
- pick a fun name for the default team when user signs up (#8000)

### Changed

- **prompt-to-join-org**: add feature promptToJoin feature flag (#7977)
- **ai-summary**: invert feature flag (#7985)
- **ai-summary**: replace GPT-3 with ChatGPT (#7958)
- **ai-summary**: revert chatgpt change (#8001)
- **metrics**: Consolidate GA4 sign_up events emission (#7931)
- Allow super users to archive teams (#7992)
- upgrade relay (#7880)
- remove nx from package (#7993)

### Fixed

- org members panel UI (#7978)
- fix non-enterprise usage stats, use teams limit algorithm (#7937)
- fix reviewers (#7994)
- **sentiment-analysis**: write undefined as sentimentScore for meetings without reflections with scores (#7999)
- fix an import error after relay upgrade

## 6.97.0 2023-Mar-30

### Added

- **team-health**: calculate & write sentiment scores for reflections & retro meetings (#7671)
- remove proration (#7721)

### Changed

- add libvips to dist (#7911)
- Migrate MeetingTemplate table (Phase 2 of 3) (#7800)

## 6.96.1 2023-Mar-28

### Fixed

- Stronger RRule validation to prevent NaN interval (#7950)

## 6.96.0 2023-Mar-15

### Added

- **checkout-flow**: add teams limit warning (#7879)
- **checkout-flow**: credit card UI (#7812)
- **retros-in-disguise**: Base activity library + stubbed cards (#7836)
- **checkout-flow**: implement billing leader UI (#7910)
- **rid**: Basic activity library search (#7891)
- **standups**: Persist draft responses to localstorage (#7925)
- **checkout-flow**: add downgrade logic (#7830)

### Fixed

- various styles after tailwind migration (#7884)
- position of notification bell badge (#7907)
- do not run removeOrgUserTaskUpdater for undefined tasks (#7772)
- fix usage stats charts on small amount of data (#7873)
- **teams-limit**: count only teams that have had at least 1 meeting in the last 30 days (#7918)
- **templates**: Fix 'Create new template' button error for retros (#7917)
- changing width to max-width (#7913)
- slack stats (#7926)

### Changed

- **ai-summary**: update logging (#7893)
- **tailwind**: Add default colors (#7892)
- add temporary story points update result logging (#7897)
- node version bump for security updates (#7901)
- simplify org plans button logic (#7899)
- **metrics**: emit is_patient_0 as user properties for GA4 (#7877)
- consolidate payload types for user sign-up/log-in activities (#7895)
- **relay**: createFragmentContainer -> useFragment 6/N (#7874)
- **relay**: createFragmentContainer -> useFragment 7/7 (#7875)
- **pipeline**: remove any reference to dev environment (#7920)
- **template-limits**: add template limit flag to p0 domains (#7921)
- **relay**: Remove 'UNSTABLE_renderPolicy: full' (#7919)
- **dx**: Add Parabol employees to reviewers to prevent auto-request-review (#7922)
- **teams-limit**: change first warning notification text (#7862)
- **tailwind**: Fix rename warning (#7924)
- add $data suffix to relay data fragments (#7928)
- **upgradeRelay**: refactor response and variables from relay mutation types (#7929)

## 6.95.1 2023-Mar-09

### Fixed

- Handle SSE and socket done checks (#7903)

## 6.95.0 2023-Mar-07

### Added

- **recurrence**: Stop Recurrence button (#7869)

### Fixed

- **teams-limit**: add missing billing link to 7 days warning email (#7857)
- **teams-limit**: fix locked message in usage stats (#7861)
- **Icebreaker** editing is not working properly on Android (#7431)

### Changed

- Add some more **Legitity tests** (#7863)
- **metrics**: Add content_group in GA4 page_view event (#7848)
- **pipeline**: Databases backup and restore from CircleCI pipeline (#7806)

## 6.94.0 2023-Mar-03

### Fixed

- align search bar with meeting cards (#7819)

### Added

- **checkout-flow**: plans UI (#7793)
- **checkout-flow**: plans functionality (#7799)
- Add additional retrospective template illustrations (#7849)

### Changed

- Added Tailwind CSS (#7597)
- add css extract (#7808)
- **retros-in-disguise**: Added retros in disguise feature flag and empty route (#7807)
- **docker**: Redis and RethinkDB dataversions fixed for the development environment. (#7810)
- **docker-compose**: RethinkDB fixed to v2.4.2
- **relay**: Fix convertToUseFragment bug (#7839)
- **relay**: createFragmentContainer -> useFragment 2/N (#7841)
- **relay**: createFragmentContainer -> useFragment 1/N (#7840)
- **github**: Don't auto-assign at-mentioned users (#7846)
- Added a tailwind preset file (#7809)
- **relay**: createFragmentContainer -> useFragment 3/N (#7842)
- **relay**: createFragmentContainer -> useFragment 4/N (#7844)
- **relay**: createFragmentContainer -> useFragment 5/N (#7845)

## 6.93.0 2023-Feb-22

### Fixed

- remove font-size 18px declaration on tasks editing status label (#7784)
- **dashboard**: Meeting card shadow doesn't match card (#7782)
- **standups**: Autofocus the input in the discussion drawer when opened (#7779)
- **teams-limit**: fix teams limit check query fails with an error on non-local environment (#7795)
- **emails**: Upgrade mailgun to 7.0.4 (#7804)
- **emails**: Generate email summaries with facilitator auth (#7805)

### Added

- **recurrence**: Copy meeting series permalink (#7777)
- **SAML UI**: Create a verifyDomain mutation (#7686)
- **SAML UI**: Add UI with disabled state (#7684)

### Changed

- **deps**: bump undici from 5.18.0 to 5.19.1 (#7787)
- **tiptap**: Upgrade tiptap to pull in bugfixes (#7790)
- select best platform for the job (#7786)
- bump node, rethinkdb-ts, typescript, uWS (#7780)
- **teams-limit**: remove teams limit notifications after upgrade or removing a team (#7781)

## 6.92.0 2023-Feb-15

### Fixed

- show invoice coupons in parabol (#7711)
- fix case-sensitive (#7749)
- yarn dev remove graphiql from dll (#7750)
- **recurrence**: Don't restart meetings on archived teams (#7747)
- 'Updated time/Created time' is not instantaneous on task cards (#7254)
- Fix server error when joining a team by invitation link (#7775)

### Added

- **teams-limit**: send locked & warning email (#7637)
- **recurrence**: Stable link for meeting series (#7707)
- **teams-limit**: add 7 days reminder notification and snackbar (#7677)
- **recurrence**: Recurrence-specific meeting card (#7716)
- **recurrence**: Added advanced recurrence settings (#7585)
- **checkout-flow**: left sidebar (#7733)
- add seasonal retros (#7760)
- **standups**: added options menu tooltip (#7768)

### Changed

- Invert meetingHistoryLimit feature flag (#7725)
- prevent new rethinkdb migrations in the database/migrations
- **teams-limit**: avoid showing nagging snackbar if the limit is fixed
- Switch to review stats package (#7753)
- **metrics**: Do not call identify() on feature flag changes (#7752)
- create bundles without node_modules (#7402)
- remove user feature flag (#7765)
- removed beta badge from standups (#7767)
- **teams-limit**: Remove scheduled jobs
- **ai-summary**: track no stats in Slack summary (#7759)
- **dx**: add updateCache function to dataLoader (#7758)

## 6.91.1 2023-Feb-14

### Fixed

- Sometimes meetings could not be closed (#7769)

## 6.91.0 2023-Feb-08

### Fixed

- Bundle tutorial thumbnail (#7742)
- **ai-summary**: summary references "the text" (#7739)
- **deps**: bump webpack, undici (#7737)
- **deps**: bump ua-parser-js from 0.7.31 to 0.7.33 (#7683)
- **deps**: bump deps to fix vulns (#7730)
- **deps**: bump http-cache-semantics from 4.1.0 to 4.1.1 (#7708)
- Profile name length should have the upper limit (#7425)

### Added

- Migrate MeetingTemplate to PG (Phase 1 of 3) (#7679)
- **checkout-flow**: add checkout feature flag (#7709)

### Changed

- update team invite email (#7710)
- **ai-summary**: update meeting summary url (#7705)

## 6.90.0 2023-February-1

### Fixed

- Use stripe invoice.paid event instead of invoice.payment_succeeded (#7690)
- Renamed 'next activity' to 'current activity' in ended meeting badge (#7691)
- Line breaks in comments now work on Android (#7438)
- Added missing prompts in starfish retro template (#7660)
- Fixed prompt highlight color does not cover the full-height of the column (#7416)
- Delete empty groups (#7673)
- **metrics**: Add isPatient0 property to sign_up events emitted by GA4 (#7680)
- Meetings with invalid facilitator stage can now be opened and closed (#7675)

### Changed

- **ai-summary**: limit access to AI summaries (#7658)
- Renamed "Timeline" to "History" (#7670)
- Cleanup private \_legacy.graphql types (#7689)

### Added

- **ai-summary**: add summary to end meeting notification (#7659)
- **search**: add search ability to meeting view (#7676)
- **standups**: Email Summaries (#7649)
- **teams-limit**: lock organization if limit the is exceeded for 30 days (#7606)
- **teams-limit**: Add snackbar to usage stats enabled notification (#7601)
- **teams-limit**: implement organization locked modal (#7645)

## 6.89.0 2023-January-18

### Fixed

- update non-anonymous Reflect description (#7651)
- **ai-summary**: remove AI comment from comment count (#7648)
- **ai-summary**: update Parabol AI picture (#7657)

### Changed

- **metrics**: emit sign_up events from GA4 client side (#7635)
- moved global style creation outside of the render cycle (#7598)
- sendToSentry if unable to create topic summary (#7665)

## 6.88.0 2023-January-12

### Fixed

- emails landing in spam (#7618)
- select dropdown can't be scrolled with keyboard (#7426)
- server error undefined template (#7633)

### Added

- **standups/notifications**: Generalized notification toasts + new toasts (#7603)
- **notifications**: Discussion Mention notifications (#7596)
- slack uses oatuh2 redirect (#7628)
- removed recurrence feature flag (#7636)

### Changed

- **teams-limit**: usage stats warning (#7587)
- **teams-limit**: prevent new team creation (#7591)
- **DX**: Show a warning on switching branch with migrations (#7616)
- **deps**: bump fast-json-patch from 3.1.0 to 3.1.1 (#7614)
- **deps**: bump jsonwebtoken from 8.5.1 to 9.0.0 (#7613)
- **ai-summary**: improve prompt (#7646)
- **ai-summary**: track when the summaries are viewed (#7619)
- Add reviewer for PRs and assignee for issues on mention (#7620)
- Add client unit tests to CircleCi (#7626)

## 6.87.1 2023-January-05

### Fixed

- **Check-in**: could not move, pin or unpin agenda items (#7622)

## 6.87.0 2023-January-03

### Fixed

- Task highlight sticks when adding a due date (#7395)
- Add graphql-tools/executor dev dependency
- Broken summary pages (#7604)
- Emoji length check (#7578)
- Access custom template (#7600)
- Organization Image is on top of default (#7429)
- New meetings were locked with the history limit (#7581)
- Bump sanitize-svg version (#7584)
- **Jira**: fix Sprint Poker voting for projects with duplicate fields (#7607)
- **notifications**: Remove bad shortlinks + dead code (#7574)

### Added

- Change tier to starter & team (#7505)
- Add current facilitator to facilitator candidates (#7548)
- **ai-summary**: auto update meeting summary (#7572)
- **ai-summary**: ai explainer (#7571)
- **teams-limit**: enable usage stats when teams limit exceeded (#7563)
- **teams-limit**: add upgrade CTA to the meeting sidebar if teams limit is exceeded (#7520)
- **teams-limit**: flag an organization when it has exceeded teams limit (#7517)
- **teams-limit**: add addFeatureFlagToOrg mutation and support teams limit feature flag (#7526)
- **parabl-ubi**: add parabol-ubi and host-st to public repo (#7588)
- **recurrence**: Added current meeting link to ended meeting badge in standups (#7542)
- **standups**: Standup response replied-to notification (#7547)

### Changed

- Add data team as reviewers for analytics changes (#7595)
- Add comments to rootSchema (#7576)
- Fix missing public types on private schema (#7580)
- **metrics**: change upgrade CTA events to standard definitions (#7594)

## 6.86.1 2022-December-19

### Fixed

- New meetings were locked with the history limit (#7599)
- **Metrics**: change upgrade CTA events to standard definitions

## 6.86.0 2022-December-14

### Fixed

- **DayPicker**: Bumped daypicker to v8, fixing broken icons (#7521)
- **DraftJS**: PRevent virtual keyboard hiding after submitting comment (#7423)
- **Demo**: Canonical link (#7516)
- **Standups**: Update discussion preview when discussion isn't open (#7558)
- **Archive Team**: Deleting team prevents reuse of deleted team's name (#7397)

### Added

- **AI-Summary**: Add topic summary to discussion thread (#7545)
- **Notifications**: Make notification publishing generic (#7540)
- **Jira**: Add logging for some error cases (#7561)
- **AI-Summary**: Whole meeting Summary (#7543)
- **AI-Summary**: Discussion summary in meeting summary (#7534)
- **AI-Summary**: Topic summary in meeting summary (#7494)
- **PG**: Added SSL Support (#7175)
- **Metrics**: Enable send_page_view on ReactGA initialization (#7551)
- **Standups**: Auto-open response discussion based on query param (#7546)
- **Metrics**: Always include email in traits for identify calls (#7523)
- **Recurrence**: Added standups time left indicator (#7538)

### Changed

- **Chore**: Limit direct access to locked meetings (#7532)
- **Chore**: Limit meeting history on timeline (#7511)

## 6.85.0 2022-December-07

### Added

- **lint**: add lintcheck and stylecheck (prettier) to github action (#7507)
- **Sprint Poker**: Hitting up and down arrow keys cycles through poker cards (#7363)
- **Retrospective**: add heard seen respected template (#7510)
- **Metrics**: Enable Google Analytics client side page_view tracking (#7356)
- **Notifications**: Remaining email notifications (#7527)
- **Recurrence**: added human readable recurring meeting indicator (#7533)

### Fixed

- **Poker** number of stories in summary stats is one less than actual stories (#7241)
- **Tasks**: There should be no scroll bar on tasks header (#7492)

## 6.84.0 2022-November-30

### Added

- **Notifications**: Improved notifications email (#7447)
- **AI summary**: Added AI summary feature flag (#7493)
- **Template limits**: Updated selected template for free teams #7460
- **Template limits**: Added additional template event tracking #7454
- **Template limits**: Prevent cloning templates #7452
- **Template limits**: Focus on newly created template #7442
- **Template limits**: Added limit exceeded and locking flags #7441
- **Template limits**: Implemented custom template upgrade feedback (#7427)
- **Template limits**: Added teams limit feature flag #7440
- **Template limits**: Implemented restriction on public templates #7405
- **Template limits**: Updated team & org page with limit info (#7415)
- **Metrics**: Removed HubSpot updates from the app #7382
- Migrated OAuth2 redirect to Cloudflare #7446
- Added "go to dashboard" and "sign in" button to "invitation link expired" screen #7153

### Fixed

- **DX** Run all yarn clean commands, even if one fails #7461

### Changed

- **Deps**: bump vm2 from 3.9.7 to 3.9.11 (#7233)
- **Deps**: bump loader-utils from 1.4.0 to 1.4.2 (#7428)

## 6.83.1 2022-November-23

### Fixed

- XSS vulnerability in meeting templates (#7491)

## 6.83.0 2022-November-17

### Fixed

- Update tier when leaving org (#7377)
- Added CorsOptions to email images (#7393)
- Typo in Earth 2.0 check-in question
- Send button is disabled in retro discussion on mobile (#7361)
- Snackbar messages are not centered during standups #7203
- Add delete confirmation button and waiting effect (#7403)
- Snack on jira auth error (#7432)

### Changed

- Cleanup packages to support future bundled server build (#7400)

## 6.82.0 2022-November-09

### Added

- **metrics**: disable Company properties update to HubSpot (#7366)
- Implement setIsFreeMeetingTemplate mutation (#7346)
- Add invoice explanation to comment (#7399)
- Add template limit feature flag (#7391)

### Fixed

- Use MaterialUI SvgIcons instead of Font (#7154)
- Header name should be more general (#7394)

### Changed

- **CircleCI**: split backup from deployment (#7389)

## 6.81.0 2022-November-02

### Added

- **standups**: Added ended meeting view (#7327)
- **timer picker**: add 10 minutes option (#7357)

### Fixed

- **Azure DevOps**: fix adding issues to Sprint Poker (#7365)
- **Team**: leave team does not work until refresh (#7368)
- use fallback values for PokerCardDeck (#7315)

### Changed

- add isFree to meeting template (#7345)
- put isPatient0 on User row (#7325)
- Remove @types/ioredis package (#7367)

## 6.80.2 2022-November-01

### Fixed

- Release version mismatch

## 6.80.1 2022-November-01

### Fixed

- **Jira**: issues sometimes are not loading in poker meeting

## 6.80.0 2022-October-26

### Added

- End meeting from meetings view (#7313)

### Fixed

- **Metrics:** set disableAnonymity default to false in Meeting related events (#7320)
- Removed the last-release-sha & unused yaml file (#7294)
- Revert the release-please-config
- Add noindex for ppmis (#7324)
- Fix whitespace in links (#7326)
- Add credit card formatting (#7303)
- Filtering is still able to be done when only one state is available (#7295)
- Avoid overriding custom group name with a single card (#7312)

### Changed

- Rename christmas template (#7323)
- Speed up repo integrations query (#7234)

## 6.79.1 2022-October-25

### Fixed

- EstimateStage was broken for Jira if the issue could not be fetched (#7337)

## 6.79.0 2022-October-21

### Added

- Add confirmation tooltip on the retro meeting sidebar (#7248)
- show you in emoji list instead of viewer name (#7285)
- **notifications**: Update which users receive notification batch emails (#7286)

### Fixed

- assign new billing leader after deleting billing leader (#7267)
- AdjustMeetingMemberCountPosition (#7202)
- missing daki prompt (#7279)
- Hyperlink removes whitespace (#7089)
- **Jira**: show only available fields in Sprint Poker (#7257)
- **Jira**: Link to documentation if we cannot find a story point field (#7264)
- **Retro**: a card dragged from an expanded group disappeared (#7317)

### Changed

- use SDL for JiraIssue (#7258)
- Fix missing types (#7300)
- Run auto assign reviewer workflow on pull request target (#7296)
- Change auto assign reviewer PAT (#7318)

## [6.78.1](https://github.com/ParabolInc/parabol/compare/v6.78.0...v6.78.1) (2022-10-12)

### Bug Fixes

- add release PR for staging branch (if bugfix) ([47a7794](https://github.com/ParabolInc/parabol/commit/47a7794c014a5c0eff5d13fd96d290e6870e82fa))
- update the release please name & trigger branch ([2c1587b](https://github.com/ParabolInc/parabol/commit/2c1587bf809f3c0e8be9c7c594a3b77e9d2e92a1))

## [6.78.0](https://github.com/ParabolInc/parabol/compare/v6.77.0...v6.78.0) (2022-10-12)

### Features

- **metrics:** Send isPatient0 property to Google Analytics ([#7261](https://github.com/ParabolInc/parabol/issues/7261)) ([a046fe7](https://github.com/ParabolInc/parabol/commit/a046fe7d03581e3400f0f12790ceea848a2f0e73))

### Bug Fixes

- **noImplicitAny:** Fixup 200 ts rules (Part 2 of 2) ([#7193](https://github.com/ParabolInc/parabol/issues/7193)) ([c5b7306](https://github.com/ParabolInc/parabol/commit/c5b73062d4935b14af6b0d332e4e74e864a83620))
- other tabs break when accepting a team invitation via a link ([#7200](https://github.com/ParabolInc/parabol/issues/7200)) ([d51ca5a](https://github.com/ParabolInc/parabol/commit/d51ca5a1836756c284530e79f3ba17615e8cbf68))
- participants follow facilitator ([#7269](https://github.com/ParabolInc/parabol/issues/7269)) ([1800d0f](https://github.com/ParabolInc/parabol/commit/1800d0f062d21cdc1d98dc59cda4ea190c2b4667))
- unsubscribe analytics bug ([#7255](https://github.com/ParabolInc/parabol/issues/7255)) ([39e9d38](https://github.com/ParabolInc/parabol/commit/39e9d3805fdde52e608c8c82bead2016b07872ac))

## 6.77.0 2022-October-5

### Added

- **Standups**: Replace back arrow with logo (#7141)
- **Standups**: Starting and stopping recurrence from meeting menu (#7105)
- **Notifications**: Open notification menu when opening app from notification email (#7225)
- **Retro**: Prompt user to drag cards in group phase (#6910)
- **Reactions**: Show users who added a reactji (#7147)

### Fixed

- **Sprint Poker**: Scope phase styling issue in header (#7043)
- **Discussion Threads**: Text without spaces breaks the UI in discussion (#7140)
- **Discussion Threads**: Autofocus the input in the discussion drawer when opened (#7238)
- **Accessibility**: Aria-label “edit this reflection” should not exist when the reflection is no longer editable (#7218)
- Hover over avatar to see names not working for some users (#7239)

### Changed

- **Review Stats**: Correct node version (#7242)
- **Review Stats**: Count IssueComment events towards comment count (#7230)
- Boot message changed to include Server ID and task. (#7237)
- Update code review policy (#7228)
- Upgrade node to 16.16.0 (#6998)

## 6.76.0 2022-September-28

### Added

- Add password reset to user profile (#7183)
- Option to unsubscribe from summary emails (#7190)
- **Analytics**: 'Copied Invite Link' event (#7232)
- **Analytics**: 'Sent invite accepted' event (#7231)

### Fixed

- **Notifications**: UTM params on notification email link (#7224)

### Changed

- Tweak review stats schedule to match other reminders (#7227)
- Add jira server key generation script (#7180)
- Let super users invite to team (#7226)

## 6.75.0 2022-September-21

### Added

- **metrics**: Add metrics about disableAnonymity in retro meetings (#7171)

### Fixed

- Fix cannot read email of undefined in ErrorBoundary (#7198)
- 'Estimate phase is already complete' error message (#7194)

### Changed

- **lint**: run yarn format on server side (#7186)
- update to Lerna V5 and integrate with Nx (#7184)
- setting write permissions to the PR for external contributor (#7195)
- add Standup smoke test into the testing basics (#7189)
- Weekly review stats in Slack (#7205)

## 6.74.0 2022-September-15

### Fixed

- Disallow comments only consisting of whitespace (#7137)
- New Add Meeting button is pushing the Add Team button out of reach (#7157)
- **demo**: prevent demo meeting auto-start after page refresh (#7131)
- card quick return to original position without hangs (#7138)
- Misleading error message when inviting existing team mate (#7159)
- Long title create UI issue on mobile (#7168)
- only check clientGraphQLServer for isDemoRoute (#7176)
- **poker**: fix an bug where task estimate is not written to DB when it's a Parabol task (#7170)

### Changed

- Automatically add reviewers (#7172)

## 6.73.0 2022-September-08

### Added

- Datadog sourcemaps: add source maps to deploy (#7063)
- **Metrics**: clean up some properties for Task Created events (#7067)
- **Metrics**: Add Task Estimate Set event (#7117)
- **Metrics**: identify if user is patient 0 upon login (#7129)
- Usage stats clarity improvements (#7112)
- **Standups recurrence**: restart recurrence in startRecurrence mutation (#7049)
- Allow disable anonymity for retrospective meeting reflections (#7076)
- **Standups/tiptap**: Client-side mentions (#7118)
- **DX**: createFragmentContainer -> useFragment codeshift automation (#7135)

### Fixed

- Fix empty discuss phase (#7070)
- Increase line-height of text in Standups responses (#7115)
- **New meeting dialog**: fixed truncated template dropdown text (#7096)
- Fixed azure work item id & change item link to project name (#7093)
- Fixed azure refresh auth (#7097)
- Fixed facilitator's name is tiny and hard to read (#7113)
- Increase font size of standup meeting title (#7142)
- **DX**: Turn on noImplicitAny for server (#7011)
- **DX**: Fix the PR labeler (#7109)

### Changed

- Changed copy on /create-account page (#7132)
- Add pull-request-stats github workflow (#7111)

## 6.72.1 2022-August-26

### Fixed

- Update stripe.subscription.create prorate parameter (#7119)

## 6.72.0 2022-August-25

### Added

- Update location of "add meeting" to left sidebar (#7012)
- **standups**: Recurrence - stopRecurrence mutation (#7023)
- **standups**: Recurrence - processRecurrence mutation (#7041)
- create azure issue (#7053)
- **retro**: prompt user to go to next phase (#6942)
- **tiptap**: Emoji Support (#7102)

### Fixed

- show the team lead first in the preview of team selector (#7091)
- **metrics**: Move identify inactive up to within changePause() (#7083)
- title of the reflection columns should not be italic (#7044)
- Contrast of selected highlight of the current phase is low (#6940)
- hyperlink default focus (#7078)
- demo comments are always anonymous (#7065)
- center new meeting dialog slides on mobile (#7079)
- support documentation easier to find in-app (#7080)

### Changed

- update vscode import settings (#7077)

## 6.71.0 2022-August-17

### Added

- Updated new meeting settings area (#6989)
- Added Team members preview in new meeting team selector (#7001)
- **Metrics**: Added `inviterId` to Invite Accepted events (#7058)
- Added scrum template (#7064)
- Implemented Azure task integration (#7007)

### Fixed

- **Usage Stats**: active teams definition (#7060)
- Removed double scrollbar on discuss phase (#7066)

## 6.70.1 2022-August-11

### Fixed

- Email summaries not sending for non-standup meetings.

## 6.70.0 2022-August-10

### Added

- **graphiql**: persist schema for tabs (#6813)
- **metrics**: Add isActive and featureFlags as new User Properties for Segment identify calls (#6997)
- **standups**: startRecurrence mutation (#6957)
- **metrics**: identify user's tier upon login (#7003)
- **metrics**: Use HubSpot Private apps access token for HubSpot calls ( #7010)

### Fixed

- **resetPassword**: Reset request count daily (#6955)
- add billing info (#7000)
- fix truncated sprint poker description in new meeting dialog (#7027)
- **metrics**: remove duplicate viewerId in various Segment events (#7009)
- bug that set org count to 0 (#7008)
- **standups**: Update 'lastMeetingType' after a team prompt meeting starts (#7029)

## 6.69.0 2022-August-03

### Added

- **standups**: Added beta badge to standups on new meeting view (#6961)
- **standups**: Customized start standup notification (#6879)
- **standups**: Summary Page (#6885)

### Fixed

- Text in reflection cards is not selectable during vote period (#6924)
- allow to go to the discuss phase without voting (#6966)
- css mobile version use template button (#6824)
- **metrics**: update activeUserCount & activeTeamCount for companies in HubSpot more often (#6983)

### Changed

- remove manual pausing (#6962)
- removed standups feature flag (#6953)
- **standups**: Rename Async standup -> standup (#6991)
- **metrics**: Refactor meeting related events (#6981)
- upgrade stripe (#6895)

## 6.68.0 2022-July-27

### Added

- New meeting dialog is now a modal (#6866)
- New meeting type carousel (#6950)
- mattermost info icon (#6911)
- **standups**: Beta badge within meeting (#6928)
- **metrics**: Add more Segment events to Standups (#6908)
- **Azure DevOps**: Add SaaS url to sprint poker estimation (#6892)

### Fixed

- impersonate user bug (#6901)
- Added dismiss button to snackbar messages (#6847)
- add query parameter to identify the page source (#6967)
- Fix browser translation (#6927)

### Changed

- **chore**: edit PR template to add Metrics Representative (#6770)
- **deps**: bump terser from 4.8.0 to 4.8.1 (#6903)

## 6.67.0 2022-July-20

### Added

- **Azure DevOps**: Adding additional project types (#6593)
- **Azure DevOps**: Add global provider (#6808)

### Fixed

- access more than 10 Jira projects in task footer (#6881)

### Changed

- Improve clarity of Integrations page (#6804)

## 6.66.0 2022-July-13

### Changed

- **poker**: use generic components for GitHub and GitLab (#6782)
- **standups**: Decrease top/bottom list margins in standup response editor (#6823)
- **standups**: Changed standups default title to contain a date, not seq number (#6857)
- new GitHub & Jira issue queries (#6819)
- update invite modal illustration (#6859)

### Fixed

- **deps**: bump parse-url from 6.0.0 to 6.0.2 (#6853)
- **standups**: Do not show active standup as completed on meeting dashboard (#6816)
- **demo**: fix timer of demo meeting (#6865)
- **deps**: bump moment from 2.29.3 to 2.29.4 (#6860)
- **security**: package bumps for dependabot fixes (#6874)
- **dd-trace**: enabled comes from env var (#6876)
- **standups**: Display standups as active instead of started (#6878)

### Added

- **standups**: Basic editor bubble menu (#6812)
- **standups**: Allow facilitator to update the standup meeting title (#6821)

## 6.65.0 2022-July-6

### Added

- **Retrospective**: Add more prominent enter to submit hint (#6794)
- **Retrospective**: Updated voting buttons to be clearer (#6818)
- retro template search filter (#6798)
- **Insights**: Charts (#6799)
- **Standups**: Links (#6701)
- **Metrics**: Add Segment event to track when onboarding user clicks the Demo Meeting Card (#6834)
- decrease top/bottom list margins in standup response editor (#6823)

### Fixed

- **Lockfile**: re-add security fixes (#6831)

### Changed

- **Poker**: use generic components for GitHub and GitLab (#6782)

## 6.64.0 2022-June-22

### Added

- **Jira Server**: Always show provider row with contact us button (#6683)
- **Standups**: Response submission UX redesign (#6778)
- **Metrics**: invitation related events refactor (#6779)
- **Insights**: usage stats analytics (#6786)
- **Insights**: usage snack nag (#6785)
- Export admin data (#6733)

### Fixed

- **Standups**: Allow reactjis to be added after initial response submission (#6768)
- Reuse invite link (#6795)
- Write to url field (#6800)
- **Sprint Poker**: Remove padding in Discussion Drawer (#6700)

### Changed

- **DX**: integration tests can be run locally (#6696)
- Hide bottom start meeting FAB on desktop (#6802)

## 6.63.0 2022-June-16

### Added

- add integrations task for first-time users, use jsdom to attach…
- add team charter template (#6745)
- **Onboarding**: Added demo link to empty meeting dash (#6704)
- **insights**: toggle insights (#6672)
- **Onboarding**: Added video tutorial to empty meetings dash (#6705)
- **metrics**: merge 'Upgrade to Pro' and 'Enterprise invoice draft'
- **standups**: Make response in discussion drawer scrollable (#6753)
- **insights**: Add /usage route (#6687)

### Fixed

- **poker**: Fix wrong controls when estimating Parabol tasks (#6716)
- center add/start meeting button content (#6732)
- handle duplicates in changeEmailDomain (#6725)
- updates caniuse-lite version in yarn lock file (#6736)
- **standups**: reduced list padding in standups response (#6754)
- **standups**: removed user select none property from standup respons

### Changed

- update release_test.md (#6717)
- update createFragmentContainer to usePaginationFragment (#6431)
- **dx**: delete remaining generated pg queries (#6752)
- Stop writes to RethinkDB Team table (#6239)
- fix delete team migration (#6763)
- Refresh HubSpot chat widget on page changes (#6759)

## 6.62.2 2022-June-12

### Added

- Add start meeting button to top bar (#6707)
- change email domain (#6708)
- remove auth identity (#6713)

### Fixed

- **jira**: Fix add missing jira field new algorithm (#6722)

## 6.62.1 2022-June-10

### Fixed

- Fixed some retrospective prompts for existing meetings

## 6.62.0 2022-June-9

### Added

- **restrictDomains**: Add table and mutations (#6476)
- **standups**: Update relative createdAt automatically (#6658)
- **domainStats**: Support querying domain stat fields (#6664)
- **integration-tests**: add more testing to the 2-minute demo (#6183)
- **restrictDomains**: Add restriction to acceptTeamInvitation (#6487)

### Fixed

- github repos filter menu shows limited selection (#6627)
- **sprint-poker**: Prevent kicking facilitator off the meeting while modifying the scope (#6667)
- **jira**: Show meaningful field update error for team-managed projects (#6656)
- fix bad merge on Organization.ts (#6682)
- **Retro Templates**: Added missing prompts (#6671)
- **jira**: Handle a case with a huge number of Jira projects and avoid timeout error when trying to fix Jira field automatically (#6676)
- **standups**: Discussion thread drawer is cut off on mobile (#6695)

### Changed

- **deps**: bump protobufjs from 6.11.2 to 6.11.3 (#6669)
- **deps**: bump sharp from 0.30.3 to 0.30.5 (#6665)
- **dx**: remove generated pg files from git (#6519)

## 6.61.0 2022-June-1

### Added

- **jira-server**: Add pagination of results in sprint poker (#6607)
- **standups**: Card ordering w/ animated transitions (#6618)
- **standups**: Improved standups options button size (#6629)
- **jira-server**: Save and allow to reuse recent search queries in the scope phase of poker meeting for JiraServer (#6551)
- added PR template (#6565)
- **standups**: Basic editable prompt (#6640)

### Fixed

- **standups**: Include TeamPromptMeetingMember on MeetingMember type (#6352)
- **Sprint Poker**: An exception could occur when modifying the scope in fast succession (#6599)

## 6.60.0 2022-May-25

### Added

- **Jira Server**: Use the newer Jira Software logo (#6578)
- **standups**: Response Reactjis (#6407)
- **standups**: Summary Card (#6529)
- **standups**: Sending meeting completed event when standup ends (#6587)
- **Azure DevOps**: Correctly format Sprint Poker comments as HTML (#6597)
- added avatar group in standups (#6614)
- **metrics**: migrate and consolidate integration related metrics (#6617)
- **gitlab**: refresh gitlab tokens (#6594)

### Changed

- added PR template (#6565)
- **DX**: Fix Postgres DB path in dev.yml (#6486)
- Fix code policy link in PR template (#6600)
- handle default value for isOnboardTeam (#6598)
- Convert components using HOCs to function components (#6591)
- Migrate withAtmosphere -> useAtmosphere (#6595)
- remove gitlab flag (#6619)

### Fixed

- Due date month could sometimes not be set to the current month (#6581)
- pr template location (#6586)
- display search on archived tasks page (#6548)
- **metrics**: fix the bug where user deletion event won't update HubSpot (#6542)
- added write permission to pull request labeler workflow (#6603)
- stop-color warning in SVG (#6612)
- **jira**: Fix server error when pushing task to jira (#6613)
- Enforce mapping completeness for 'meetingTypeToIcon' (#6611)

## 6.59.0 2022-May-18

### Added

- added PR labeler workflow (#6525)
- **standups**: Activities from other team members get real-time updates (#6504)
- **standups**: Integrate response cards with discussion drawer (#6469)
- **standups**: Place viewer's card at the start of the list (#6559)
- **notifications**: Refactor Slack/Mattermost into NotificationHelper (#6262)
- Notifications support for MS Teams (#6494)
- **Jira Server**: Voting to different fields in Sprint Poker is now supported (#6437)

### Changed

- Added general rules to code review policy (#6507)
- Added code review experiment proposal (#6508)
- Set updateAt field via a Postgres trigger (#6493)
- remove MAX_GITLAB_POKER_STORIES (#6547)
- remove GitLab feature flag (#6554)
- readd gitlab feature flag (#6566)

### Fixed

- **devOps**: reduce max pg connections to 30 (#6521)
- ignore updateAt field in checkTableEq for Teams (#6490)
- nested GitLab query batching (#6541)
- increase initial page size for archived tasks (#6555)

## 6.58.0 2022-May-12

### Added

- **Azure DevOps** is available behind a feature flag and now supports search in Sprint Poker (#6448) and pushing estimates (#6481)
- **DX**: You now can run `yarn newMutation` to generate the boilerplate, check README.md for details (#6473)
- **Standups**: Live updates for team responses (#6388)
- **tests** can now be run in different environments (#6382)
- **tests**: the rate limiter is disabled (#6412)
- **support**: the mutation `enableSAMLForDomain` can now update the domains without needing to pass all the metadata again (#6447)
- **metrics**: Company's active team count now properly ignores inactive teams (#6452)
- **metrics**: email invite links contain the correct UTM parameters (#6539)

### Fixed

- meeting summary email is now sent again (#6523)
- demo Jira and GitHub integrations now work again in the Demo (#6460)
- fixed bugs occuring when resetting a retrospective to its grouping phase (#6305, #6306)
- subscription payloads are now correctly resolved for SDL types (#6506)
- fixed `hardDeleteUser` mutation which would fail for same users depending on their meetings (#6544)

### Changed

- Switched to mainline workbox to generate the service worker (#6414)
- Reduced docker image size (#6416)

## 6.57.0 2022-May-4

### Added

- **standups**: upsertTeamPromptResponse (#6333)
- **ado**: Initial Azure DevOps integration (#6260)
- **jira-server**: Allow searching for issues in Sprint Poker (#6406)
- **sprint-poker**: Can vote on GitLab issue (#6398)
- **sprint-poker**: Push task to GitLab (#6427)

### Changed

- Create manualTestingGuide.md (#6426)
- removed unused video related components (#6497)

### Fixed

- **rethinkdb**: attempt to fix the table rename (#6480)

## 6.56.0 2022-April-27

### Added

- **sprint-poker**: Track GitLab events (#6367)
- **standups**: Responses grid with static prompt (#6353)
- **standups**: Response Cards (#6392)
- **standups**: Discussion Drawer (#6370)
- **standups**: Standup UI - last updated time (#6557)
- **CI**: use prod build for integration tests (#6379)
- **lint**: Lint client (#6335)
- **DX**: Fast dev mode (#6337)
- Update illustration of empty discussion threads (#6423)

### Changed

- Update CONTRIBUTING (#6432)
- **deps**: bump nconf from 0.11.3 to 0.11.4 (#6438)
- update renderQuery to Suspense + Relay Hooks #5297 (#6251)

### Fixed

- viewerMeetingMember can be undefined (#6441)
- ignore comparison order for equality (#6411)

## 6.55.0 2022-April-20

### Added

- **jira-server**: sprint poker vote to comment (#6341)
- **sprint-poker**: Add GitLab issue (#6267)
- **sprint-poker**: Search GitLab issues (#6290)
- **sprint-poker**: New Poker Scope UI (#6344)
- **standups**: Options menu - end meeting (#6342)
- Display a message when there are no more items to paginate (#6338)
- Track integrations in createTask (#6332)
- **dx**: Don't truncate TypeScript types (#6387)

### Changed

- update sharp library (#6383)

## 6.54.0 2022-April-13

### Fixed

- **standups**: Include TeamPromptMeetingMember in MeetingMember type resolution

### Added

- **gitlab**: bump nest-graphql-endpoint (#6363)
- **scale**: give a pubsub channel to each socket server (#6317)
- **standups**: Top Bar Back Button (#6318)
- **standups**: Top Bar Component Stub (#6307)

### Changed

- **requireSU**: Remove requireSU (#6330)

## 6.53.0 2022-April-06

### Fixed

- **lint**: faster, deterministic linting (#6313)

### Added

- **standups**: Added end team prompt mutation (#6250)
- **sdl**: Add SDL to public schema (#6263)
- **standups**: Integrate TipTap (#6255)
- **jira-server**: add issue to poker scope (#6214)
- **impersonate**: keep impersonate token until last tab closes (#6300)
- **integrations**: save favorite integration to local storage (#6331)

### Changed

- gitignore github/gitlabTypes
- **lint**: Lint server (#6329)

## 6.52.0 2022-March-31

### Fixed

- Ignore common Datadog errors (#6275)
- Only reset current estimation stage on revote (#6274)

### Added

- Added start team prompt mutation (#6171)
- Push a task to Jira Server integration (#6059)
- List issues in sprint poker (#6157)

### Changed

- Codemod it all (#6228)

## 6.51.0 2022-Mar-24

### Added

- **standups**: Added empty team prompt meeting component (#6170)
- More typesafety for GraphQL code (#6167
- enforce conventional commit PR titles (#6258)
- Add flow diagram for services (#6235)
- GitLab Issues Functionality (#6160)

### Changed

- remove icebreaker question (#6142)
- Remove backfilling invoices logic from migration (#6237)
- use official postgres image & sync with digital ocean version (#6182)
- remove postcommit git command (#6253)
- allow admins to call set org user role mutation (#6148)
- disable rate limiter in test (#6146)
- **deps**: bump node-forge from 1.2.1 to 1.3.0 (#6256)
- **deps-dev**: bump minimist from 1.2.5 to 1.2.6 (#6264)
- **sdl**: codemod it all (#6228)
- Remove LogRocket (#6266)

### Fixed

- Fix type mismatch GraphQL (#6151)
- **noImplicitAny**: fix more errors (#6161)
- **sdl**: Default resolveType on mutation payloads (#6270)

## 6.50.0 2022-Mar-16

### Added

- Add task menu to push to Jira Server (#6026)

### Changed

- Increase the size of the Poker Scope card (#6032)

### Fixed

- Always require SAMLRequest (#5985)
- Remove calculated fields from Jira issue in Sprint Poker (#5864)

## 6.49.0 2022-Mar-02

### Added

- Highlight checkin tasks when hovered in current solo update (#5859)
- Initial team prompt DB schema (#6068)

### Changed

- Enforce noUncheckedIndexAccess (#6080)
- Updating text copy in authentication page
- Change prompt colors for 3 pigs template

### Fixed

- Fix a bug where types from a dataloader aren't completely accurate (#6129)
- Fix a bug where dragging item to original position cause an error (#6122)
- Fix a bug where all the tasks are fetched when adding a task to estimation (#6152)
- Fix a bug where dragging issue in sidebar estimate section may cause duplicates (#6028)

## 6.48.1 2022-Feb-28

### Fixed

- GitHub Poker Integration with 2+ dimensions

## 6.48.0 2022-Feb-25

### Fixed

- Bump nest-graphql-endpoint (#6127)
- Fix jest transforms (#6104)
- Rethrow exceptions in traceGraphQL (#6090)
- Fix TypeError: jiraProjects is not iterable (#6121)

### Added

- Add more 2-minute demo tests (#6094)
- Display GitLab issues in Sprint Poker (#6091)
- Enable application security for datadog monitoring (#6087)
- Add integration tests using Playwright (#5961)

### Changed

- Replace suggested integration with new interface (#5883)
- Remove graphql.ts (#6035)

## 6.47.1 2022-Feb-22

### Fixed

- Fix unresponsive GitHub poker meeting (#6042)

### Added

- DoD docs for Ironbank (#6013)
- Sprint Poker Scoping Jira Integration: Support for comma separated issue keys (#6040)
- Upgrade to Node 16.14.0 (#6083)

## 6.47.0 2022-Feb-16

### Fixed

- GitLab is null fatal error on meeting join (#6038)
- **Security**: Bump follow-redirects (#6044)
- **Security**: Bup vm2 (#6057)
- ID users with datadog (#5990)
- Log when reflections is null (#6010)
- Send CC errors to client (#5906)
- Promote to team lead works for users who just joined the team (#6078)

### Added

- Cached Jira Project Avatars (#5884)
- Track fatals per 1000 (#5996)
- generic createTaskMutation (#5938)
- Env-based signup/login options (#5877)

### Changed

- Added table of contents to root readme (#6011)

## 6.46.0 2022-Feb-09

### Added

- Implement Datadog RUM for front-end session data (#5574)
- add strict eq eslint rule (#5848)
- Add JiraServer integration provider fields (#5874)
- New retro templates (#5920)
- Add string filtering to team / team member filter dropdowns (#5945)
- Add JiraServerOAuth1Manager and mutation to perform first OAuth1 step (#5881)
- GitLab Oauth2 Poker Integration (#5973)
- Add GraphQL server tests to circle ci (#5481)

### Changed

- Upgrade nest-graphql-endpoint to 0.3.2
- improve GH issue templates (#5962)
- better impersonation (#5924)
- Bump packages to secure version (#5899)
- Ironbank 6.25.0 security fixes
- Bump samlify, remove unused server deps, remove gql2ts (20%) (#5974)

### Fixed

- Fix missing jira field dialog on mini card click (#5878)
- Adding Jira tasks in fast succession In Sprint Poker Scope stage is unreliable (#5554)
- ensure window.opener is same-origin (#5907)
- Check-in meeting navigation can't rejoin or click left nav item sometimes (#5400)
- fix old migrations, pg:build
- fix gql executor with bad queries in dev

## 6.45.0 2022-Jan-27

### Added

- Implement choosing random person as facilitator (#5857)
- Add primary and foreign key loaders (#5847)

### Changed

- Show only available jira fields in story points dropdown (#5825)
- 6.44.0 ironbank fixes (#5946)
- Add comments on putting env vars in `__ACTION__` (#5967)

### Fixed

- Make sure newFaciliatorId always defined (#5909)
- Make dependency from DasboardAvatar to AcceptTeamInvitation explicit (#5882)
- `romoteToTeamLead` filters on isNotRemoved (#5922)
- monkeypatch uWS res.cork (#5815)

## 6.44.0 2022-Jan-19

### Added

- Add GitLab (#5829)
- Customise release snackbar #5743
- Add migration to fill missing plaintextContent for tasks #5869
- add undefined to wrappedQuery vars #5898

### Changed

- enforce server side lock (#5840)
- **SECURITY**: bump react-refresh-webpack-plugin #5896
- Security/bump graphql jit #5897

-

### Fixed

- Fix Original Estimate field can not be updated in Sprint Poker (#5865)
- Fix isSpectating toggle & Reveal Votes count #5782
- No implicit any fixes #5830
- Fix alignment of Add task button in discussions #5876
- Fix all noUncheckedIndexedAccess for parabol-client #5837

## 6.43.0 2022-Jan-12

### Fixed

- Fix demo retrospective task integration menu (#5827)
- Fix undefined in team invitation emails (@5853)

## 6.42.0 2022-Jan-06

### Changed

- Remove editor.wordWrap from workspace settings (#5713)
- Disable refetch queries on new version bump to increase deployment reliability (#5749)

### Fixed

- Implement rate limit handling to fix a Jira thorttling issue (#5546)
- Fix searching not working in integration dropdown list (#5755)
- Fix an issue where user is unable to toggle active status in organization page (#5836)
- Fix alignment of logo (#5814)

## 6.41.0 2021-Dec-16

### Added

- Add updatedAt trigger to User table (#5733)
- Add standups feature flag (#5754)
- Release Spotlight (#5785)
- Spotlight tracking (#5714)

### Fixed

- Spotlight height doesn't change when searching (#5747)
- This is proper this again in make resolve (#5769)
- Fix mapping to jira dimension field (#5770)
- noUncheckedIndexedAccess fixes (#5737)
- Fix image scaling in task description (#5758)
- Fix typo in comment (#5784)
- Remove instanceof TouchEvent (#5807)

## 6.40.0 2021-Dec-09

### Added

- Add mattermost notification integration (#5550)
- Add datadog tracing to compiled graphql queries (#5681)
- Add hardDeleteUser mutation (#5475)
- Add spotlightSearchQuery to similarReflectionGroups queries (#5735)
- Spotlight — highlight search keyword (#5716)
- Spotlight feature flag (#5699)
- Add calculated domain field to User (#5719)

### Changed

- Extend GQL Timeout for GraphiQL Queries (#5577)

### Fixed

- Prevent ungrouping Spotlight results (#5704)
- Fix spotlight not loading similar reflections (#5728)
- Mitigate safari popups on SSO (#5617)
- Fix more implicit any errors (#5740)

## 6.39.0 2021-Dec-02

### Added

- Language tooltip is updated on New Meeting CheckIn Greeting (#5682)
- **Spotlight**: support searchQuery business logic for similarReflections (#5469)
- **Spotlight**: animate remote reflection when it enters or leaves Spotlight (#5600)

### Fixed

- Fix remotely ungrouped results position in Spotlight (#5708)
- Recently used emojis are managed using local storage (#5656)
- Returning refreshed token from fresh atlassian auth loader (#5729)

## 6.38.0 2021-Nov-24

### Added

- **Spotlight**: remote animation edge cases (#5621)
- Make RetroReflection opened in spotlight by another member non-droppable (#5556)
- Added set new team lead mutation to internal schema (#5658)

### Fixed

- Console errors when remotely ungrouping (#5677)
- fix relay error on drag end (#5674)
- Fix missing isSpotlight in useSpotlightReflectionGroup (#5689)
- Ironbank security patches for v6.36.0 (#5687)
- Fix sticky tooltip in agenda item pins (#5700)
- Fix dail_user_stat to order by user counts (#5693)
- remove hasAuth from scopephaseareaadd (#5711)
- Fix no implicit any errors (Part 3 of 8) (#5697)
- Invitation required screen right after creating a new team (#5721)

### Changed

- Show all packages errors on yarn typecheck (#5688)
- add frozen-lockfile so CI breaks if yarn.lock doesn't package.json
- bump eslint to v8 (#5695)
- favor built assets over \_\_STATIC_IMAGES\_\_ (#4847)
- Remove wrtc signal server (#5698)
- support eslint v7+ (#5709)

## 6.37.0 2021-Nov-18

### Added

- Allow moving integration tasks between teams (#5513)
- Added updateOAuthRefreshTokens mutation (#5590)
- Use 2 GraphQL Executors (#5560)
- prepare upgrade to graphql v16 (#5662)
- make atlassian oauth2 response spec compliant (#5652)

### Fixed

- support new m1 (#5593)
- Fix source returning to kanban & 2 column error (#5626)
- Fix collapsed reflections (#5642)
- Fix graphiql fetcher import (#5653)
- Fix 100 noUncheckedIndexedAccess errors (#5651)

### Changed

- **deps**: bump tmpl from 1.0.4 to 1.0.5 (#5618)
- **deps**: bump vm2 from 3.9.3 to 3.9.5 (#5619)
- bump graphiql (#5646)
- add final newline on save vscode (#5647)
- Rename and document dataLoader (#5649)

## 6.36.0 2021-Nov-10

### Added

- **Spotlight**: groups UI (#5390)
- **GitHub**: Persist favorite queries (#5435)
- **Spotlight**: drag source to result (#5412)
- **Spotlight**: drag result to source (#5414)
- Allow to push integration tasks with assignee's and own integration (#5342)

### Fixed

- Fix some no-implicit-any errors (#5476)
- Fix ending meeting without open phases (#5520)
- Prevent remote reflection from loosing its position when opening spotlight (#5624)

## 6.35.0 2021-Nov-03

### Added

- User can now create a poll in discussion thread (but can't vote yet) (#5361)
- Show remote spotlight activity (#5500)
- Expand Poker task description by default in estimate phase (#5569)

### Fixed

- Fix the bug where reflections are missing if the reto meeting does not advance to discuss phase (#5568)
- Fix an issue where updating estimates at Atlanssian Jira does not reflect it at Parabol side (#5566)
- Fix a performance issue in disconnectSocket mutation (#5583)
- Fix a migration issue where silent RethinkDB fails if stage has not taskId (#5571)

## 6.34.0 2021-Oct-27

### Fixed

- Fix pg query count datatype (#5562)
- Fix/users type from dataloader (#5538)

### Added

- Better logging for timeout in publishInternalGQL (#5552)

## 6.33.1 2021-Oct-21

### Fixed

- Increase PM2 max memory to 8GB per service

## 6.33.0 2021-Oct-20

### Fixed

- Map users to corresponding id (#5524)

### Added

- Support Jira rotating refresh tokens (#5505)
- Fix parabol estimates synced with jira (#5530)

## 6.32.0 2021-Oct-13

### Fixed

- Replace codeblock with zero width space (#5511)

### Added

- Spotlight null query case (#5376)
- Convert remaining User reads to PG (#5408)

## 6.31.2 2021-Oct-20

### Fixed

- Increase PM2 max memory to 8GB per service

## 6.31.1 2021-Oct-06

### Fixed

- 200 noImplicitAny errors (#5403)

### Added

- Team Management Right Drawer (#5351)

### Removed

- PgPostDeployMigrations from backupOrg (#5482)
- SFU/Cypress packages (#5464)

## 6.30.1 2021-Sep-30

### Hotfix

- Turn on GitHub Label in prod

## 6.30.0 2021-Sep-30

### Added

- Add server tests (#5330)
- Push Estimate to GitHub Label (#5423)
- Enable use of SMTP endpoints for sending mail (#5432)

### Changed

- Bumped nth-check from 2.0.0 to 2.0.1 (#5422)
- Add more logging info to Stripe Quantity Mismatch issue (#5395)

## 6.29.0 2021-Sep-22

### Added

- Backend for creating a poll object (#5304)
- RedisLockQueue implementation (#5311)
- Custom ADF converter for pushing Jira tasks (#5429)

### Removed

- Removed postdeploy migrations (#5396)

### Changed

- Bumped node and pm2 (#5418)

## 6.28.0 2021-Sep-16

### Added

- Org backup (#5278)
- Add get user by mail query (#5287)
- Log verbose info when client receives no payload (#5353)

### Fixed

- Make sure that users can always see agenda items in check-in (#5365)

### Changed

- Upgrade to TypeScript v4.4.2 (#5356)

## 6.27.0 2021-Sep-08

### Added

- Spotlight similarReflectionGroups query (#5277)
- Add poll button (#5303)

### Fixed

- Ironbank mitigation fixes for @ Parabol version 6.22.0 (#5227)

### Changed

- Adds aria-labels to topBar nav icons (#5319)
- Read autopauseUsers user from PG (#5329)
- Team reads migration (#5201)
- Do not format generated files (#5292)

## 6.26.0 2021-Sep-01

### Fixed

- Fix bad lowercase call (#5332)
- Fix stripeSucceedPayment (#5335)

### Added

- Animate reflection into Spotlight (#5271)

## 6.25.0 2021-Aug-25

### Fixed

- TeamMemberStageItems rendering unnecessarily (#5322)
- New/Added Jira Stories are auto-archived by default (#5321)
- Viewer object is non-null (#5310)

### Changed

- Upgrade to latest graphql-tools packages (#5321)
- Upgrade to Relay v11, React v17 (#5294)
- Server checks 'x-application-authorization' for app auth first (#5318)
- Client always sends auth via `x-application-authorization' (#5291)

### Added

- Polls table in PG (#5231)

## 6.24.1 2021-Aug-23

### Fixed

- Remove logrocket from client, it was still running even without a key

## 6.24.0 2021-Aug-19

### Added

- Add accordion animation to sidebar #5086
- Remove promptTemplateId from ReflectPhase #3949

### Changed

- Refactor pokerSetFinalScore to setTaskEstimate #5171
- DB migration: migrate jira poker stages to jira-integrated stages #5161
- **Redis**: Persist discussion commentors #5022
- Updated tar, mediasoup-client dependencies

### Fixed

- Final score not updating #5283
- Invites are broken - Cannot destructure property 'isConnected' of 'n' as it is null. #5282
- Server error when voting, unable to advance meeting #5249
- Jira integration - 'Fix it for me' doesn't work #5251
- Grouping kanban columns are not centered on Safari #5263
- Unable to archive poker meetings #5228

## 6.23.2 2021-Aug-19

### Fixed

- Support debugging production mode locally (#5284)
- Remove logRocket from SSR client keys (#5284)

## 6.23.1 2021-Jul-30

### Fixed

- Run autopauseUsers in batches to avoid crashing RethinkDB

## 6.23.0 2021-Jul-28

### Added

- Improved discussion thread empty state (#5192)
- Added poker support for parabol tasks with integrated issues (#5205)
- Added archive button to poker meeting timeline events (#5229)
- Proxy Jira images through Parabol (#5190)
- Added empty alt property to meeting card images (#5232)

### Changed

- Updated meeting cards styles for improved contrast and HTML semantics (#5209)
- Make team members query order-by case insensitive (#5224)
- Improved handling of slow responding gql executor (#5210)

### Fixed

- Keep Parabol poker estimates synced with Jira(#5220)
- Fix nonexistent localStorage method invocation (#5223)
- Fix buggy comment status text not going away (#5197)

## 6.22.0 2021-Jul-22

### Added

- Added FLIP animations to meeting cards (#5138)
- Added emails and domain to updateWatchlist (#5144)
- Added TaskEstimate table (#5198)

### Fixed

- Fixed long meeting names throwing off meetings view (#5118)
- Fixed dashboard padding (#5129)
- Fixed summary review not working properly (#5137)

### Changed

- Jira Task sync (#5095)
- Task sync GitHub (#5114)
- Backfill email field for deleted users in RethinkDB to match with PG (#5170)
- createTask accepts optional integration (#5199)

## 6.21.0 2021-Jul-15

### Added

- Add Story Points to required screen from within Parabol (#4880)

### Fixed

- Fix template dimension "ghosts" (#5128)

### Changed

- Deprecate retro template prompt title field (#5120)
- Migrating AtlassianAuth table to Postgres (#5085, #5135)
- Impose unique email constraint for User table in Postgres (#5093)

## 6.20.0 2021-Jul-08

### Added

- Add clarity between comments and task creation (#5049)
- Add Parabol logo to scope phase area (#5092)

### Changed

- Sort jiraDimensionFields for both RethinkDB & PG (#5108)

## 6.19.0 2021-Jul-01

### Added

- Meeting view animations (#4975)

### Changed

- No more refresh needed on version updates (#5015)
- Require updatedAt on every doc change for User & Team table (#5079)

### Fixed

- Leaving team removes slack auth (#5055)
- Poker comment & story count (#5062)
- Deterministic sort order of jiraDimensionFields (#5070)

## 6.18.0 2021-Jun-23

### Added

- Added update email mutation to intranet schema, #5005
- Add retro templates, #4069

### Fixed

- Remove null jwt sentry error message
- Always update the latest timestamp for lastSeenAt in PG

## 6.17.1 2021-Jun-18

### Fixed

- Fix saml exists check in emailPasswordReset

## 6.17.0 2021-Jun-17

### Changed

- Forgot password flow gives user feedback if request was valid, #5033

### Fixed

- Fix inequality btwn User overLimitCopy in rethink and pg, #5020
- Fix missing teams in rethink but not in pg, #5050

## 6.16.1 2021-Jun-10

### Fixed

- Use default empty string for discussionId for dummy discuss stage

## 6.16.0 2021-Jun-10

## Added

- Discussion as first-class entity (#5016)

## 6.15.0 2021-Jun-10

### Changed

- Make Slack notification prettier (#4911)
- Deprecate createXPicturePutUrl mutations (#4342)
- Ecnrypt database backup (#4603)

## 6.14.0 2021-Jun-2

### Changed

- Bump dns-packet from 1.3.1 to 1.3.4 (#5000)

### Added

- Add 120 additional icebreakers (#5004)

### Fixed

- Add clock tolerance to getVerifiedAuthToken (#5011)
- Sentry server stack (#4987)
- UI fix-ups (#5001)

## 6.13.0 2021-May-26

### Added

- LogRocket free tier (#4996)

### Changed

- Tier update pg (#4980)
- Bump browserslist from 4.11.1 to 4.16.6 (#4995)

## 6.12.0 2021-May-19

### Added

- Support varying GitHub scopes (#4971)
- Send exceptions to LogRocket as well as Sentry (#4978)

### Changed

- Refactor commentor to thread conn (#4974)

### Fixed

- Init sentry in gqlExecutor (#4959)

## 6.11.0

### Added

- lockTeams private mutation (#4953)
- GitHub Search bar for Poker Scoping (#4901)

### Fixed

- Changing Jira field ID when name changes (#4957)
- Log invalid authTokens for gql queries (#4949)
- Poker summaries use appOrigin vs. global origin (#4938)
- Analytics mutations are not resent on wake (#4941)
- Support missing AtlassianAuth (#4941)
- Soft delete agenda items (#4941)

## 6.10.1

### Fixed

- Validate & normalize email inputs on account creation

## 6.10.0

### Added

- Add meeting card overflow menu #4893
- Fetch GitHub repos and ensure strongly typed results #4870
- Add postgres rethink equality checker mutation #4856
- Add docker volume for self-hosted instances using local storage #4907

### Fixed

- Fix various Hubspot data issues #4904
- Fix facilitator being kicked out of Poker #4873
- Fix SAML request param encoding and parsing #4898
- Fix Stripe invoice #4937

### Changed

- Bump ssri from 6.0.1 to 6.0.2 #4925
- Improve avatar group layout #4918

## 6.9.0 2021-Apr-29

### Added

- Add LogRocket #4886
- support addGitHubToSchema #4920

### Fixed

- Fix team invitation #4877

## 6.8.0 2021-Apr-21

### Added

- Validate new poker issues #4831
- Poker avatars tooltip #4882

### Fixed

- Check if story and meeting exist #4786
- Fix editing too bug #4879

## 6.7.0 2021-Apr-14

### Added

- Meetings view v1 (#4624, #4623)

### Changed

- Limit number of dashboard avatars (#4566)

## 6.6.1 2021-Apr-10

### Fixed

- Fixed an issue where GraphQL subscription fails to execute

### Changed

- Disabled the Easter Egg

## 6.6.0 2021-Apr-07

### Added

- Add migration for priority scale (#4846)
- Enable Datadog APM tracer (#4843)

### Changed

- Update link in Check-In summary email (#4858)
- Meetings view style changes (#4849)

### Fixed

- Fix a typo in DragEstimatingTaskSuccess (#4850)
- Fix meeting control bar width (#4852)
- Fix types for fieldName and dimensionName in JiraDimensionField (#4854)

## 6.5.0 2021-Apr-01

### Added

- Create GH issue button in Sprint poker, currently hidden (#4799)
- GitHub tab in Sprint Poker (#4777)

### Removed

- Removed IM scopes from Slack integration, per Slack feedback (#4844)

### Fixed

- Sort order of poker votes (#4821)
- Add type safety to deleteUser (#4826)
- Push to story points type mismatch (#4854)

## 6.4.0 2021-Mar-24

### Added

- Add jira issue key to left nav in sprint poker #4794
- Add bugs animation to retro #4800
- Add "i dont vote" button for poker spectators #4791
- Add debug jira helper #4790
- Add postgres postdeploy migration hook #4787
- Add postgres writes for user and team table, backfill migrations #4787
- Add new logo color #4763
- Add new color pallette #4776
- Add scollbar to story card in poker estimate phase #4755

### Changed

- Bump elliptic dependency from 6.5.3 to 6.5.4 #4758

### Fixed

- Fix issues preventing approval for our Slack app directory submission #4792
- Fix poker subnav item styles #4798
- Fix domain change in gmail causing login issues #4806
- Fix selecting jira issue race condition #4719
- Fix calendar first month available bug #4797
- Fix non-integrated poker user can't see jira content #4793
- Fix "just started" snackbar error when changing facilitators #4780

## 6.3.1 2021-Mar-19

### Fixed

- Fix broken suOrgCount query due to incorrect enum type

## 6.3.0 2021-Mar-18

### Fixed

- Fix an issue where app crashes on revealing votes if there are people who did not vote #4747
- Fix security issue #46 #4698
- Fix user img upload #4746

## 6.2.0 2021-Mar-03

### Added

- Provide feedback for old browser bugs #4752

### Changed

- **TypeError**: Cannot destructure property 'atlassian' of 'r' as it is undefined. #4736
- Refactor gql2ts enums to unions #4693
- Prevent Poker drawer from jumping up #4743

## 6.2.1 2021-Mar-04

### Fixed

- Fix an issue where app crashes on revealing votes if there are people who did not vote #4737

## 6.2.0 2021-Mar-03

### Added

- Sort the reflection groups on server side after REFLECT phase #4696

### Changed

- Refactoring for CustomPhaseItem #4728
- Migrate RethinkDB Provider table to GitHubAuth #4727
- We’ve updated palette values and added a new palette const enums #4658

## 6.1.0 2021-Feb-25

### Added

- Robust message queue protocol (#4386)
- Freeze poker templates for meeting duration (#4695)

### Changed

- Meeting avatars are populated from MeetingMembers (#4652)

### Fixed

- Google oauth deleted account recreation email missing (#4654)
- Make SAML Issuer and AssertionConsumerServiceURL dynamic (#4679)
- Add Scale Value button goes missing (#4694)

## 6.0.0 2021-Feb-18

### Fixed

- User cannot delete prompts from retro templates
- Non-meeting members do not get meeting summary emails (#4681)

### Changed

- Threaded comments are fully expanded (#4647)

## 5.36.0 2021-Feb-16

### Added

- Release Sprint Poker (#4667)

## 5.35.0 2021-Feb-10

### Added

- postgres-json-schema PG extension to dev docker-compose (#4660)

### Fixed

- Hyperlinks in discussion thread comments (#4655)
- Poker Jira Filter includes all projects and avatars (#4663)
- Template dialog select button (#4653)
- Retro collapsing stack animation (#4643)

### Changed

- Logos & Static assets (#4645)
- Meeting members are only added when they enter the meeting (#4611)

## 5.34.0 2021-Feb-04

### Added

- New icebreakers in the icebreaker phase of a meeting (#4557)
- Make poker card deck slideable (#4604)
- Unique illustrations for default retro and poker meeting templates (#4642)
- OrgUserAudit table for better tracking & reporting (#4582)
- Postgres setup configurations for CI and prod (#4640)

### Fixed

- Retro column UI fixes (#4612)
- Fixed various undefined type errors reported by Sentry (#4620, #4627)
- Timeline events not scrolling (#4588)
- New meeting joiner infinite loop (#4625)
- Pinned agenda items removed on meeting end (#4641)

## 5.33.1 2021-Jan-28

### Fixed

- Fixed replicated org users (#4541)
- Fixed renderQuery failing to send error to Sentry (#4601)

## 5.33.0 2021-Jan-27

### Added

- Adds a placeholder with example JQL when JQL search is turned on (#4576)
- Added postgress to local dev environment allowing developers to run and manage postgres locally via docker-compose (#4580)

### Changed

- Shows the mock loading bars when a search is in progress. this is a little more jerky than ideal, but we need to show folks that a search is pending (#4576)

### Fixed

- Fixes a bug if JQL is turned on too fast (#4576)

## 5.32.0 2021-Jan-20

### Fixed

- Fixed a bug where tasks didn’t update #4556
- Fixed a bug with client tempId #4560
- Fixed a bug with the group title error message #4562

## 5.31.2 2021-Jan-14

### Added

- Making grouping columns responsive in retrospective meeting (#3614)

### Changed

- Links in discussion thread comments are now clickable links (#4345)
- More intuitive template dialog with FAB button (#4128)
- Preparation work for Slack migration (#4373)

### Fixed

- Sprint Poker meetings ended before Scoping phases shouldn't generate a summary (#4465)
- Better UI for many Jira projects import (#4512)
- Carousel scrolls to different meeting type after changing team (#4484)
- CSV export is malformed (#4489)
- Other performance improvements (#4488, #4506, #4513)

## 5.30.0 2021-Jan-06

### Changed

- Guarantee unique ID for redis jobs (#4487)

### Fixed

- Retro meeting fixes & add new emojis (#4499)
- Remove retro templates that have no prompts (#4486)

## 5.29.1 2020-Dec-23

### Fixed

- Bug on non-poker meeting summary

## 5.29.0 2020-Dec-22

### Added

- Support for multi-domain SAML (#4478)

### Changed

- Upgrade to Webpack v5 (#4455, #4477)

### Fixed

- Scale UI Fixups (#4472)

## 5.28.0 2020-Dec-17

### Added

- Added batch support for feature flags #4446
- Pre-validate jira field mappers #4445
- Adds Parabol stories to Sprint Poker Estimate phase #4420

### Changed

- Moved HubSpot Segment function inside the app #4451
- Scale editor UI refined #4435 #4430
- Sprint Poker UI refined #4416
- Bump ini from 1.3.5 to 1.3.7 #4434

### Fixed

- Fixed reactji spacing #4427
- User cannot update their preferred name #4456
- User cannot clone a public scale #4458
- Sprint Poker: can’t add Parabol tasks when integrated with Jira #4461
- Sprint Poker: can’t add new Jira tasks in Scope view
- Sprint Poker: Parabol task edits persist in Estimate phase #4464
- Thread empty state mentions tasks conditionally

## 5.27.0 2020-Dec-09

### Added

- Support avatar image uploads (#3957)
- Poker reveal voting button implemented (#4392)
- Use next button for participants (#4349)
- Implement final score for poker meeting (#4396)
- Add summary for poker meeting (#4397)
- Implement adding Parabol task during scope phase of poker meeting (#4359)

### Fixed

- Poker meeting fixups (#4381)

## 5.26.0 2020-Dec-2

### Added

- Set Sprint Poker final score and push it to Jira (#4368)

### Changed

- Updated Sprint Poker drawer discussion thread (#4364)
- Sprint Poker UI clean-up (#4377)

### Fixed

- Multiple Sprint Poker bug fixes & polish (#4376)
- Fixed remove agenda item & setAppLocation bugs (#4380)

## 5.25.1 2020-Nov-19

### Fixed

- Reverted back to using header to determine client IP

## 5.25.0 2020-Nov-18

### Added

- Sprint Poker template UI w/o scales (#4310)
- Poker peekers (#4334)

### Changed

- Upgraded uWS to v18, now with upgrade callback (#4357)
- Invitation lifespan to 30 days (#4353)
- Initial Poker template has a single dimension (#4347)
- Added curve to poker deck (#4337)

### Fixed

- A handle of client-side bugs found in Sentry, likely due to Relay (#4354)
- Centered meeting bottom control bar (#4344)
- Language for invitation expiration (#4341)

## 5.24.0 2020-Nov-12

### Added

- Sprint Poker UI deck animations #4334

### Changed

- Sprint Poker estimate stage display in sidebar #4318
- Refactor atlassian jira auth #4312
- Increased invitation expiration time to 30 days #4335

### Fixed

- Race condition occurring when a retro meeting starts while a checkin is taking place #4329

### Deprecated

- Deprecated the `startNewMeeting` and `endNewMeeting` mutations in favour of meeting specific mutations #4330

## 5.23.0 2020-Nov-04

### Added

- Poker estimate mutations #4306
- Added `voteForPokerStory` mutation #4304
- Add new Jira issues in poker scope phase #4282
- Outlook email parser #4288
- Added Sprint Poker template scale backend #4232
- Parabol scope search #4274
- Adds poker card deck #4278

### Changed

- Bumped `mediasoup-client` package to `^3.6.21` #4292
- New meeting view UI controls updated #4275

### Fixed

- Fixed bug when copying retro templates #4294
- Task migration hotfix #4302
- Fixed summary topic order #4206

## 5.22.0 2020-Oct-13

### Added

- CLI to create new mutations (#4270)
- Jira Issue card in Poker Estimate Phase (#4262, #4245)
- meetingCount to User for HubSpot (#4259)
- Search Menu and Persisted Query Menu for Jira Scope Phase (#4256)
- MediaSoup package (#4204)

### Fixed

- Icebreaker Editing & flexbox issue for Safari (#4254)
- Check-in Agenda State (#4242)
- Removing template prompt bug (#4236)

## 5.21.0 2020-Oct-07

### Added

- Added undo grouping button to completed gouping phase #4253
- Sprint Poker: Jira integration, search, and scoping implemented #4241, #4231
- Added new starter templates for retro meetings #4220

### Changed

- Friendlier UI for tasks without assignees #4164

### Fixed

- Remove link to offensive rally song

## 5.20.1 2020-Oct-06

### Fixed

- SegmentIo client page call signature for Google Analytics

## 5.20.0 2020-Sep-30

### Added

- Remove shared templates by archived teams #4201
- Added tab access for due date #4135
- Poker Jira front-end (behind feature flag) #4158

### Changed

- New user task view #4105
- Multi-connection user presence with Redis #4147
- Bump GraphQL to v15 #4193

### Fixed

- Bug fix for first item in menu #4200
- Filter out teamIds in backup organization #4221
- Assign team task card to viewer #4223

## 5.19.1 2020-Sep-25

### Added

- Publish timeline events when a meeting ends (#4179)

### Fixed

- Toggle timestamp bug in task casks (#4187)
- Corrected Segment Google Analytics schema (#4190)
- Demo end meeting bug (#4192)

## 5.18.1 2020-Sep-18

### Fixed

- Remove trailing slash from intranet graphql url to fix graphiql

## 5.18.0 2020-Sep-16

### Added

- robots.txt to nginx (#4160)
- Retro Template Illustations (#4172)
- Revisit Check-in meetings (#4020)

### Fixed

- Invite UI Copy (#4168)
- Bump Node to v14 (#4154)

## 5.17.0 2020-Sep-10

### Added

- Production Dockerfile (#4103)
- Base scaffolding for new sprint poker meeting (#4113)
- Beginnings of frontend scaffolding for new sprint poker meeting (#4141)
- Enable fetching data from Parabol org for local development (#4089)

### Fixed

- Fix dev server hmr (#4134)
- Fix various Hubspot Segment bugs (#4142)
- Hotfix for on-premise deployment regarding SAML (#4126)
- Improved UI via automatic parsing for bulk email invite (#4131)
- Fix control bar undefined bug (#4121)
- Fix connect presence logic (#4149)

### Changed

- Make enableSAMLForDomain an upsert (#4087)
- Set Google Analytics clientId to Segment anonymous ID (#4117)
- Exclude timeline events from uninteresting teams (#4132)

## 5.16.0 2020-Aug-28

### Added

- Show who is commenting (#4050)
- New integration test DB tarball (#4078)
- Sprint Poker meeting type in new meeting carousel behind a feature flag (#4104)

### Fixed

- Bottom bar cover and floating snackbar (#4036)
- Discussion styling thread with long URL link; Lightened up the grey "ready" checkmark in meeting control bar (#4094)
- A couple of good fixes for invitation workflow (#4082)

## 5.15.1 2020-Aug-21

### Fixed

- Fix emoji pop up causing page lock up (#4096)

## 5.15.0 2020-Aug-21

### Added

- backupOrganization private schema query (#4089)
- logging for redis timeout errors (#4095)

### Fixed

- More robust invoicing for multiple unpause on the same user (#4089)

## 5.14.0 2020-Aug-14

### Added

- Shared Templates (#3942)
- DB tables for TemplateDimension and TemplateScale (#4042)
- Archived Items Checkbox on Task View (#4035)

### Fixed

- Refactor CustomPhaseItem to ReflectPrmpt (#4053)
- Disabled editing and due date slection on archived cards (#4047)
- Segment client initated events (#3942)
- Summaries show groups even if meeting was ended early (#3956)
- Menu navigation keyboard shortcuts wrap around (#4056)

## 5.13.1 2020-Aug-06

### Fixed

- Update OrgBillingView when CC is updated/added #3983
- Removed position sticky from timeline task header #4023

### Changed

- Various UI polishes #4026
  - Remove color hack on agenda icon
  - Yank punctuation on impertive tooltip copy
  - Swap meeting and team name for hierarchy
  - Fixes reaction button alignment in thread comments
  - Change inner padding to prevent clipping of card box-shadow

## 5.13.0 2020-Jul-23

### Fixed

- Don't show overlimit copy if user is a member of any paid org #3808
- Added required properties to segment track call for GA destination #3974

## 5.12.1 2020-Jul-17

- Internal metrics query fix
- Team creation timeline event was left as inactive when created

## 5.12.0 2020-Jul-15

### Added

- Added thread comments to the CSV export #3948
- Added automated screenshots for Parabol demo #3907
- Added `enableSAMLForDomain` mutation for private schema #3986
- Customized prettier for the Typescript file generated by [gql2ts](https://github.com/amount/gql2ts) #3995

### Changed

- Optimized metrics query to run faster #3978
- Set up config to enable client code debugging in VS Code #3985
- Deprecated `meetingSettingsByTeamId` in favor of `meetingSettingsByType` #3973

### Fixed

- Fixed source maps to enable debugging with breakpoints in VS Code #3982
- Fixed a typo for `utm_source` in meeting summary URL parameters #3977
- Fixed a typo in `DemoCreateAccountButton` #3972
- Fixed duplicate agenda item pins #3996

## 5.11.1 2020-Jun-29

### Fixed

- Merge duplicate users together

## 5.11.0 2020-Jun-18

### Added

- More segment events for the marketing team (#3911)
- Redis cache for the User object (#3924)

### Fixed

- Correctly get company based on orgId (#3919)
- Demo Export to CSV feature (#3926)
- Remove duplicate segment page event (#3941)
- Early termination of Checkin Meeting doesn't archive tasks (#3941)

## 5.10.1 2020-Jun-15

### Fixed

- Email password reset is now case insensitive

## 5.10.0 2020-Jun-10

### Added

- Check-in meeting agenda has a discussion thread (#3891)
- Agenda items can be pinned and persist across check-in meetings (#3892)
- Users can delete the account and leave feedback (#3905)
- Allows for custom plans in enterprise invoices (#3906)

### Changed

- A tooltip prompts users to tap again to confirm advancing or ending the meeting
- Updates the bottom bar control UI color usage
- Removes the tooltip on the timeline meeting event card menu (#3881)
- Removes the calendar event CTA section from the check-in summary (#3877)

### Fixed

- Fixes breaking changes to the demo (#3908)
- Fixes to Segment function (#3903)
- Miscellaneous bug fixes (#3898)
- Fixes for Cypress and demo tests (#3869)
- Guarantees all emails are lowercase in the database (#3889)
- Fixes graphql pubsub unsub (#3894)

## 5.9.1 2020-Jun-05

### Added

- Added email to all segment track events for slack integration

## 5.9.0 2020-Jun-02

### Added

- Company entity to group organizations (#3883)
- Segment Destination functions (#3883)

## 5.8.0 2020-May-21

### Added

- Retro template prompts now have customizable colors (#3722)

### Changed

- The Social Check-In phase is now called Icebreaker (#3850)
- Moved the invitation shortlink to the env (#3865)

### Fixed

- Fixed identify on the client for hubspot (#3872)

## 5.7.1 2020-May-15

### Fixed

- Only prompt next confirmation when on the last stage in phase

## 5.7.0 2020-May-13

### Fixed

- Throw error instead of string when redis response times out (#3847)
- Topic links on meeting summary emails (#3843)
- Remove wait pattern in cypress demo_discuss tests (#3837)

### Added

- email attribute to segment page events (#3847)
- support for other mail providers (#3838)
- Confirm on next and end buttons (#3823)

## 5.6.1 2020-May-12

### Fixed

- Put timeout on fetch to google

## 5.6.0 2020-May-06

### Fixed

- Ghost snackbar covering up meeting control bar (#3819)
- Empty emails when meeting is killed early (#3819)
- Correct active meeting current state (#3819)
- Can start retro when action is in progress (#3819)
- Scrolling in development works in firefox (#3813)
- Stripe removing a paused user (#3810)
- \_\_dirname incorrect in dev mode (#3806)

## 5.5.1 2020-Apr-30

### Fixed

- Save progress in demo

## 5.5.0 2020-Apr-24

### Added

- Stateless GraphQL Executor (#3771)
- Toolbox webpack config built separetely
- 1 command development & build
- More cypress tests (#3795)
- Comment count to the retro summary (#3777)

### Changed

- Server assets now built with webpack (#3771)
- Illustrations for upgrades & meetings (#3785)
- .env now lives in the project root (#3771)

### Removed

- Google Analytics bootstrap (#3798)

## 5.4.0 2020-Apr-16

### Added

- Floating bottom bar in meetings (#3723)
- Ready button in meetings (#3723)
- Add utm params to emails (#3736)

### Fixed

- No redirect on meeting end if not in meeting (#3736)
- WebRTC DataChannel safely sends (#3747)

## 5.3.1 2020-Apr-10

### Added

- GQL Request logging

## 5.3.0 2020-Apr-03

### Fixed

- Demo Discussion Topics were all concated together
- Add Team button appears on dashboard's leftnav when using iOS mobile

### Added

- "Report feedback" for fatal bugs (#3714)
- Custom voting (#3707)
- "Settings & Integrations" link added to Team Dashboard

### Changed

- New Meeting Snackbar created for new meetings (<5 mins ago) (#3713)

## 5.2.1 2020-Mar-26

### Fixed

- Broken timer

## 5.2.0 2020-Mar-25

### Added

- Links to discussion items in the meeting summary (#3708)
- Links to old meetings in the timeline events (#3683)
- Ability to re-enter old meetings (#3683)
- Tests for Group phase (#3665)

### Fixed

- Sanitize jpg user avatar uploads (#3706)
- Show task errors in footer (#3696)
- Calls to stripe are Atomic and throttled (#3673)
- Handful of Sentry fixes (#3670)
- case-insensitive email addresses (#3667)

## 5.1.0 2020-Mar-22

### Added

- Internal slack pulse

## 5.0.1 2020-Mar-18

### Fixed

- createTask borked with segment

## 5.0.0 2020-Mar-16

### Added

- Threaded Discussions

### Changed

- Replaced .googlecloudkey with .env vars

## 4.24.0 2020-Mar-04

### Added

- Can now archive an organization (#3625)
- rel="canonical" tags on all public routes (#3623)
- tags to mailgun emails (#3616)

### Fixed

- Disabled ability to create multiple simultaneous check-in meetings (#3626)
- Handful of small sentry bugs (#3628)
- Require longpress on mobile to drag reflection cards (#3624)

### Changed

- Renamed action to check-in (#3620)
- Upgrade typescript, sucrase (#3618)
- Rename timebox to time limit (#3617)

## 4.23.2 2020-Mar-02

### Fixed

- Attempted fix to reduce unauthed clients to init websockets

## 4.23.1 2020-Feb-26

### Fixed

- Extra logs to track down why unauthed clients init websockets

## 4.23.0 2020-Feb-17

### Added

- graphql-jit for faster GraphQL resolutions (#3580)
- threadSource, threadId to task. Replaces agendaId, reflectionGroupId (#3579)
- Comment entity to backend (#3579)

### Removed

- assigneeId from Task (remnant of soft team members) (#3576)
- reflectionGroupId, agendaId from Task (#3579)

## 4.22.0 2020-Feb-11

### Added

- User-defined schema to RethinkDB types (#3556)
- Nagging snack for over limit copy (#3566)
- Left nav teams broken out by organization (#3567)
- Tooltip to Task icons (#3564)

### Changed

- Notification page to notification menu (#3556)
- Notifications are never deleted (#3556)
- Segment end meeting event (#3569)

## 4.21.1 2020-Feb-07

### Changed

- Increase max prompts from 5 to 12
- Add Accounts Payable email for enterprise invoices

### Fixed

- Drop reflection flicker regression
- Mass Invitation token did not always refresh

## 4.21.0 2020-Feb-04

### Added

- Meeting phase to active meeting menu (#3493)
- Real-time updating of meeting name (#3532)
- Page name to mobile views (#3487)
- Blacklisted domains requiring email verification
- Refetch query on reconnect (#3020)

### Fixed

- No bouncing next when timer is running (#3495)
- Rename server secret .env var (#3482)
- Missing demo avatars (#3516)
- Missing demo timer (#3516)
- Collapse on escape (#3284)
- Janky grouping demo animations
- Bad reconnect logic (#3502)
- Editing status not firing (#3507)
- Cancel drags in expanded groups (#3560)
- Cards occassionally not being dragged

## 4.20.1 2020-Jan-30

### Fixed

- Reflection column height overflow (#3525)
- Team lead self-demote (#3530)
- Bork when inviting existing team member
- Hide facilitator bar when meeting is over
- Fix user-defined RegEx (#3201)
- Reflection expand/collapse animation (#3490)

## 4.20.0 2020-Jan-28

### Added

- Refresh button to check-in question
- Active meetings to the new meeting view

### Changed

- Upgraded to Relay v8.0.0
- Use meeting names in copy instead of the type of meeting

## 4.19.0 2020-Jan-23

### Changed

- Made a first pass at implementing the new dashboard IA see #3488
- Avatars only appear in the meeting when actually in the meeting view see #3496
- The meeting lobby remembers the last meeting type a team has run see #3501
- Updated uWS to v17.1.0 see #3512

### Fixed

- Made several bug fixes in a single PR see #3494
- Made minor fixes in the meeting lobby see #3500
- Bumped the version of uWS to clear up some errors see #3512

### Removed

- Dataloader caching per user see #3512
- Sending sentry errors for service worker scopes #3512

## 4.18.0 2020-Jan-15

### Added

- Reactjis during Discuss Phase
- Editable meeting name

## 4.17.5 2020-Jan-13

### Removed

- Disabled Datadog apm

## 4.17.4 2020-Jan-13

## Fixed

- Upgraded to Node v13.6.0, no longer treat RethinkDBError as an unhandledRejection

## 4.17.3 2020-Jan-12

## Added

- pm2 to production deploy with mem limit (~1.2G)
- Datadog apm

## 4.17.2 2020-Jan-10

### Fixed

- Safely handle closing websocket that doesn't yet have a connection context

## 4.17.1 2020-Jan-10

### Fixed

- Use forwarded IP address instead of IP of reverse proxy

## 4.17.0 2019-Dec-20

### Fixed

- ratelimiter for forgot example/bad login
- Memory leak in Relay SSR

### Added

- uWebSockets.js
- Session invalidation on password reset

### Removed

- Express.js, cws
- Auth0

### Changed

- Refactored dataloader to be much more memory efficient
- Shorter mass invite links #3469

## 4.16.1 2019-Dec-18

### Fixed

- querystring parsing for SAML urls with search params

## 4.16.0 2019-Dec-10

### Changed

- Broke GraphQL into 2 services
- Refactored objects to classes for easier memory leak debugging

### Added

- DataLoaderCache
- GraphQLRedisPubSub

### Fixed

- Memory leak traced to resolve fn in pullQueue of graphql-redis-subscription
- Borked version of GraphiQL

### Removed

- dataloader-warehouse
- graphql-redis-subscriptions

## 4.15.0 2019-Dec-04

### Added

- New meeting lobby (#3364)
- Optional check-in phase (#3364)
- console.logs for monitor when meeting summary does not scroll (#3397)
- Initial support for VSCode (#3398)
- Server debugger support for VSCode (#3400)
- A lightweight heap profiler that runs every hour (#3399)
- A heavy duty heap dumper that should only be run when there is no server load (#3399)

### Fixed

- GraphiQL Public Schema (#3397)
- Cannot vote on optimistic reflection groups (#3397)
- Snackbars can handle error string and object (#3397)
- GraphQL validation error when an abstract object could return a null or non-null of the same name (#3398)
- FOUC for Material Icons (#3400)
- Gracefully handle fetches that fail when Google's language API is down (#3400)
- Times in Slack notifications are relative to the timezone of whomever sent the message (#3400)
- Subscriptions work after initial login (#3400)
- AcceptTeamInnvitation has correct error when login credentials are wrong (#3405)

### Changed

- Disconnecting does not promote someone else to facilitator (#3397)

## 4.14.0 2019-Nov-27

### Added

- A subscription channel for each meeting (#3376)

### Removed

- Auth0 (#3372)

### Fixed

- Race condition to 2 votes (#3367)

## 4.13.1 2019-Nov-20

### Fixed

- Auto-checkin meeting members who joined the team after a meeting started
- Gracefully handle group/ungroup errors

## 4.13.0 2019-Nov-19

### Fixed

- Summary intermittently couldn't scroll (#3361)
- Errors caused by updateTask didn't show on the Task card (#3361)
- Empty reflections are now removed when completing the grouping phase (#3361)
- Empty tasks are removed before generating the meeting summary (#3361)
- Reflections being edited while advancing to the vote stage would stay editable (#3357)
- Drop animations for reflections at the bottom of a column (#3336)

### Added

- Back button to the Forgot Password view (#3358)
- Transitions to online avatars in the meetings (#3356)
- Backend support for an optional check-in round (#3355)
- Ability to add reflections from the Reflect phase while the Group phase is still in progress (#3354)

### Changed

- Invite Dialog View (#3351)
- Moved meetings from /meeting/:teamId to /meet/:meetingId to support future multi-meetings
- E4E Policy to reflect new funding round (#3347)
- Upgraded to Typescript 3.7
- Upgraded a bunch of other dependencies

## 4.12.0 2019-Nov-11

### Fixed

- Janky reflection animation when dropping & animating to the bottom of a scrollable column (#3297)
- Sentry bugs from Nov 6 - 11
- Regression where viewer could not add/remove reflect templates

### Removed

- Redux (#3323)

### Changed

- Refactored all old patterns that relied on unsafe react methods (#3323)

## 4.11.0 2019-Nov-06

## Fixed

- Janky expand/collapse reflection animation (#3322)
- Create reflections in demo group phase (#3321)
- Z-Index levels (#3320)
- Timer reset on stage change (#3319)
- Meeting sidebar headers (#3314)

### Changed

- Set client/server envs on Sentry (#3311)
- Upgraded to Relay v7 (#3306)

## 4.10.1 2019-Nov-04

## Fixed

- Mid-meeting invitation would reset meeting (hotfix)
- Bumped Cypress version to fix CI breaks

## 4.10.0 2019-Oct-31

### Fixed

- Randomize check-in order for retros (#3226)
- Removed a handful of calls to Sentry to reduce noise (#3292)

### Changed

- Moved to rethinkdb-ts driver from rethinkdbdash (#3285)

## 4.9.0 2019-Oct-16

### Fixed

- Editor crash on undefined mentions (#3272)
- Allow scrollable sections in meeting left nav (#3264)
- Fix team member name update (#3258)
- Redirect to correct meeting if hit the wrong url (#3257)

### Removed

- Legacy LoadableDraftJSModal (#3273)
- react-dnd & friends from deps (#3267)
- Active meeting dialog on team dash (#3262)

### Changed

- Meeting Avatar Group only shows connected members (#3266)
- Show retro groups without votes in discussion phase (#3260)

## 4.8.3 2019-Oct-15

### Fixed

- Delete single record for startNewMeeting race

## 4.8.2 2019-Oct-10

### Fixed

- Spelling error on sidebar "Faciltator" to "Facilitator"

## 4.8.1 2019-Oct-09

### Removed

- dumpy, the memory leak debugging tool, from starting on startup

## 4.8.0 2019-Oct-09

### Added

- New meeting sidebar
  - New mobile-friend control to appoint facilitator
  - Shows each meeting stage, and its completion status, more clearly
- Show discounts on invoices, other invoice calculaton and display improvements
- Adds better logging for console errors
- We now typecheck client & server in parallel
- Lazy make auth0 manager

### Fixed

- Hopefully fixes #3120, summary unable to be scrolled until refreshed
- Fix #3194, this.editorRef.current.focus is not a function
- Fix #3195, cannot read property 'findIndex' of undefined
- Fix #3196, TypeError: t is undefined
- Fix #3198, TypeError: Cannot read property 'firstElementChild' of undefined
- Fix #3229, add tolerance to matching up Stripe invoice data
- Clear dataloader cache for new account logins

## 4.7.0 2019-Oct-02

### Added

- Adds Google Tag Manager to SSR (PR #3215)

## 4.6.0 2019-Sep-25

### Added

- New retrospective grouping experience:
  - Preserves columns while grouping
  - Group across columns
  - Add and edit new items during grouping phase
  - Works on mobile
- New conversion squeeze modal which is turned on by an admin mutation

### Removed

- Refactor of the way our color palette is defined and used in the app

## 4.5.3 2019-Sep-23

### Removed

- Google language client (source of memory leak since v3.16.0)

## 4.5.2 2019-Sep-23

### Added

- Dumpy to dump stack heap info when SIGPIPE received

### Fixed

- make start meeting more transactional to avoid duplicate start meetings

## 4.5.1 2019-Sep-20

### Removed

- Test removing Sentry to verify memleak

## 4.5.0 2019-Sep-19

### Changed

- Moved webhook GraphQL handlers to the private schema

### Fixed

- Billing leaders now see inactivity tag on Org Member view

## 4.4.3 2019-Sep-18

### Fixed

- False positive for "Login with Google" when tms does not exist on auth0 token

## 4.4.2 2019-Sep-12

### Added

- Support moving multiple teams to a single org & archiving empty orgs

### Fixed

- Clean up legacy tables in DB
- Corrected JWT expiry

## 4.4.1 2019-Sep-11

### Fixed

- IdP-initiated login flow

## 4.4.0 2019-Sep-11

### Added

- Added enterprise invoicing (#3158)

## 4.3.2 2019-Sep-06

### Fixed

- Service worker no longer caches HTML documents, fixes SAML login
- Cypress credentials

## 4.3.0 2019-Sep-05

### Added

- SAML support

### Fixed

- UI touchups (Pro tag, timeline padding)

## v4.2.0 2019-Aug-28

### Added

- Modal at beginning of demo

### Removed

- Aprhodite in favor of emotion

### Fixed

- Various UI touch-ups:
  - uniform gutters for task column header
  - fixes ellipsis
  - fixes due date bg color
  - improves editing + due date block layout
  - Organization list now a responsive layout

## v4.1.0 2019-Aug-14

### Added

- Mobile-first reflect phase (#3087)
- New check-in questions (#3086)
- Task columns now use `react-beautiful-dnd`

### Changed

- Adds the lemma to the reflection when it is created/updated instead of when the reflect phase is complete (#3092)
- The Pro tier is now \$6 per user per month

### Fixed

- Many, many meeting bug fixes
- Fixed issues with tasks
- Fixed group demo animations & discuss overflow (#3097)
- Fixed another agenda scrolling regression

## v4.0.1 2019-Aug-09

### Fixed

- Temporarily remove tags from sentry to see if it caused mem leak

## v4.0.0 2019-Aug-05

### Added

- New repo, new major version: now a Parabol is a monorepo!
  - The client now has its own (much shorter) `package.json`
  - The client, server, testing suite, and service worker now all get their
    own tsconfig which means we can do much faster typechecking on incremental
    builds
  - We now use sucrase instead of babel to build the server, which means faster
    server startup (almost 75% faster!)
  - We can share `const enum` values across the client and server
- Added a service worker to manage the local cachng of files: Parabol is much
  snappier after it loads!
- Helpers to load cross-site SVG and Javascript files

### Fixed

- Timer snackbar z-index (#3050)
- Fix theme color (address bar on mobile)

### Removed

- We no longer depend on Fontawesome

## v3.17.2 2019-Jul-30

### Fixed

- Agenda list cannot be scrolled (#3070)

## v3.17.0 2019-Jul-26

### Added

- Segment events for team invites (#3040)
- Segment events for meeting timer (#3039)

### Changed

- Toasts to snackbar (#3026)
- Upgraded Relay to fork of v5 (#3014)
- Upgraded react-beautiful-dnd to v11 (#3041)
- Upgraded a bunch of smaller deps (#3041)

### Fixed

- Login bug for safari users (#3038)
- Calendar Schedule CTA in Action Meeting Summary (#3042)

### Removed

- auth0-js (#3038)
- iterall, known mem leak, but unsure if affects us (#3023)

## v3.16.2 2019-Jul-15

### Changed

- Updated sentry
- Send new error message for offline default facilitator
- Add tags to rate limiter sentry event
- Ignore 429 error and google nlp error for sentry

### Fixed

- Patched dataloader-warehouse
- Prevent duplicate SSE error events for the same user
- Prevent duplicate end meeting mutations sent from client
- Prevent missing getMasonry event on demo

## v3.16.1 2019-Jul-10

### Fixed

- ResizeObserverPolyfill wrong import

## v3.16.0 2019-Jul-10

### Added

- Mass invite link to the team invitation modal (#2994)
- Single cards can have group titles (#2990)
- Swipeable mobile left nav for dash and meeting (#3008)
- Improved logic for automatic facilitator selection (#3010, #2985)

### Fixed

- Timebox works on facilitator change (#2984)
- No bounce for async stage (#2982)
- Can’t remove child on portal (#2991)
- Scroll to agenda input if needed (#2900)
- Ignore unsupported Google NLP languages (#2850)
- Tags correctly sent to sentry (#2849)
- Handle rate limit reached (#2977)
- Improved responsive view styles (#3009)

## v3.15.0 2019-Jun-25

### Added

- Timer, Time Box, and associated Slack notifications
- Added SU permission to `resolveForBillingLeaders()`

### Fixed

- Segment fixes:
  - Capitailze first letter of meeting names
  - `identify()` events were occasionally passing the wrong HubSpot traits
  - renamed `name` trait to `parabolPreferredName`
  - Other misc fixes

### Removed

- Segment identify() call when viewer changes
- Some cruft from `ui.js`

### Fixed

- capitalized segment Meeting Completed events (#2916)

## v3.14.0 2019-Jun-19

### Changed

- Moved integration OAuth flow into their respective managers
- Refactored all flow components to typescript
- Improved handling of browsers without permissions API

### Removed

- Legacy Provider mutations
- Need for calling postdeploy in development

### Added

- Invite emails and dialog views conditionally have active team meeting context
- A primary button Create Free Account was added to the demo in the top bar and invite dialog

## v3.13.0 2019-Jun-12

### Changed

- Refactored the Slack integration to support target UX for team and personal notifications

### Fixed

- Create new stripe subscription after a failed payment followed by a CC update

### Removed

- Legacy meeting fields on the Team object in the DB

### Added

- New stripe per-event handling

## v3.12.0 2019-May-29

### Added

- Persist queryMap to DB, this allows folks to complete their old
  queries after a server upgrade.

### Fixed

- Org avatar input layout
- Team archive grid layout
- #2902 avatar shape
- Wonky invoice layout with wrapping div, bg colors

## v3.11.2 2019-May-28

### Fixed

- Meetings for safari users (support window.matchMedia)

## v3.11.1 2019-May-28

### Fixed

- Borked end action meeting (fast-rtc-swarm)
- Action Meeting Title

## v3.11.0 2019-May-15

### Changed

- Refactored Action meeting to new meeting format
- Refactored email summary to support GMail mobile app

### Fixed

- Redirect from /invtation-required

## v3.10.1 2019-May-14

### Fixed

- RemoveTeamMember now works (#2880)

## v3.10.0 2019-May-08

### Added

- New Segment events to track logins, adding Jira or GitHub cards, and opening help menus in the Retro

## v3.9.0 2019-May-01

### Added

- Fallback editor for Android

### Fixed

- Forgot password link

### Changed

- Use Google colors for OAuth2 Button
- Menus across entire app

## v3.8.2 2019-Apr-29

### Fixed

- call to missing primeStandardLoader

## v3.8.1 2019-Apr-25

### Fixed

- provider map borked team integrations if GitHub integration exists
- Error when publishing to Jira (#2829)

## v3.8.0 2019-Apr-24

### Added

- Jira integration for issues (#2807, #2814)
- GitHub integration direct from Task card (#2807)
- Extra traits on users when retro meeting ends (#2818)
- Extra call to identify on meeting end (#2795)
- Over free tier alert (#2797)
- Retro prompt descriptions (#2703)

### Removed

- Auto-end for long-running retrospective meetings (#2819)

### Changed

- Only allow 1 signup per email, regardless of OAuth or Email/pass

## v3.7.2 2019-Apr-03

### Fixed

- Borked demo from featureFlags

## v3.7.1 2019-Apr-02

### Added

- Improvements to beta video functionality (#2762)

## v3.7.0 - Unreleased

### Fixed

- New version toast (#2760)
- Superuser access to teams via orgs (#2754)

### Changed

- Tasks are blurred on Enter (#2751)

### Added

- Atlassian Integration OAuth via feature flag (#2743)
- Video alpha (#2726)

## v3.6.1 2019-Mar-14

### Fixed

- Demo was broken by #2712

## v3.6.0 2019-Mar-13

### Added

- Spellcheck to cards (#2706)
- Cypress.io tests
- Aggressive sub-powered query caching (#2712)

### Fixed

- Squelch Google NLP unsupported languages (again)
- Updated linter (#2725)
- Fix infinite recursion when facilitatorPhaseItem is invalid (#2724)
- Fix buld:dll (#2719)
- Lock check-in question editing to facilitator (#2718)
- Fix DashAlert when page is scrollable (#2714)
- Use Intersection Observer to detect when to load more (#2714)
- Bug allowing endNewMeeting to be called twice (#2650)
- Multiple logout bug (#2712)

### Removed

- Legacy invitation patterns & tables

## v3.5.1 2019-Feb-28

### Fixed

- OAuth Login problems
- Reset password problem

## v3.5.0 2019-Feb-25

### Added

- Sentry captures for OAuth failures (#2682)
- invitation-required fallback for visiting team-only view (#2667)

### Fixed

- Missing agendaId in demo (#2678)
- dataloader cache miss for missing NewMeeting (#2679)
- Sort ordering of template prompts (#2677)
- Squelch unsupported language errors from Google NLP (#2680)

### Changed

- Upgraded plenty of dependencies, notably Typescript (#2637)
- Re-implemented DLLs for faster development (#2637)
- Refactored all routes to use React.lazy (#2646)

### Removed

- react-portal-hoc (#2659)

## v3.4.1 2019-Feb-21

### Fixed

- Meeting Summaries available for archived teams

## v3.4.0 2019-Feb-08

### Fixed

- Can delete last card in demo (#2633)
- Bad teamId in url redirects to /me (#2635)
- Stuck floating card during group phase (#2610)
- Errors reported to sentry have a better stack trace (#2631)
- Viewer connection state updates when offline (#2555)
- Editing detection logic during Reflect phase (#2601)

### Added

- Source maps to app and sentry
- Active tasks column to team timeline
- Heuristics to detect phase completion (#2601)

### Changed

- User Settings renamed to User Profile
- Upgraded to Relay v2.0.0
- Use persisted queries instead of full query text

### Removed

- redux-form
- Usage of legacy React context

## v3.3.0 2019-Jan-31

### Added

- Timeline, Suggested Actions, What's New

### Fixed

- Stored XSS through SVGs
- Meta tags

### Removed

- Welcome wizard

## v3.2.0 2019-Jan-24

### Changed

- Switching between sign-up/sign-in forms now preserves entered email
- Add anonymous segmentId to login payload, aliasing to authenticated user
- Eased friction adding free users to organizations

## v3.1.0 2019-Jan-09

### Changed

- New invitation UX (see PRs #2550, #2556 and issues #2537, #2538, #2539, #2540)
- Refactored the relationship between organizations and their users (see PR #2560 and issue #2547)

### Fixed

- Check-in prompt editing UX #2548
- Organization help card styles #1968

## v3.0.0 2018-Dec-19

### Changed

- FREE! The whole thing is free!
- New Pro accounts cost \$12/user/mo

### Fixed

- Fixed due date color for past-due items
- Fixed check in question updates

## v2.21.0 2018-Dec-05

### Added

- Improvements to completed retro phases (PR #2518)
- Support page events for non-users (PR #2520)

### Changed

- Refactor redux out of toasts (PR #2501)

### Fixed

- Fixed remove provider (PR #2517)
- Fixed agenda input behavior issue for Safari (Issue #2521)

## v2.20.3 2018-Nov-27

### Fixed

- Can add GitHub repos #2347

## v2.20.2 2018-Nov-18

### Fixed

- When su permissions given: can run downgrade mutation & request certain
  nested team & org fields

## v2.20.0 2018-Nov-14

### Added

- Animations to demo help menu
- Downgrade mutation on the backend
- Click-to-expand ellipsis in the meeting summaries for reflections and tasks #2497

### Changed

- Team invite & notification emails look better

### Fixed

- Fix #2397 team name now updates without refresh
- Fix #2454 Use OS-specific keys in help modal
- Retro card groups now match the reflection group style
- Org Approvals are now visible to everyone on the team
- Minification bug caused export to CSV to fail
- Agenda list migrated to react-beautiful-dnd
- All components using react-beautiful-dnd now accurately update when dragging top to bottom

## v2.19.0 2018-Nov-07

### Added

- Added CSV download link to retrospective meeting summary email

### Fixed

- Fix #1956 bug: remove user from org fails
- Fix #2400 completed reflect phase is read only
- Fix #2432 resize grid when tasks update
- Fix #2468 retrospective demo bug on quick DnD/grouping
- Fix #2469 Support mentions in demo tasks
- Fix #2482 Delete Task not always working
- Many retrospective meeting demo copy updates

## v2.18.0 2018-Oct-31

### Added

- The Retro Demo, ready to try in marketing funnel
- A new Check-In question (#1531)

### Fixed

- Fixed invoice pagination for organizations

## v2.17.0 2018-Oct-25

### Added

- Demo (first pass, not advertised)
- End Meeting button to all phases
- Export to CSV button for retros

### Changed

- Bottom nav buttons in meeting
- Moved vote details to top of phase

## v2.16.0

### Added

- Completed switched to Material Design icons

### Removed

- Completely removed Font Awesome icons

## v2.15.0 2018-Oct-10

### Added

- Introduces Material Design icons (PR #2434)

### Fixed

- Fixed sidebar toggle in retro lobby (PR #2431)

### Removed

- Yanked serif typeface (PR #2433)

## v2.14.0 2018-Sep-26

### Added

- facilitator tooltip for focusing a reflection column

### Fixed

- button elevation
- reflection spacing inside grouping modal
- removed emoji popover when no results are found
- resize handling when editing reflections during reflect phase

## v2.13.1 2018-Sep-20

### Added

- GraphiQL now supports requests to the private schema

### Fixed

- Corrected the private schema (some mutations were listed as queries)
- Moved su\* queries from the public to private schema

### Removed

- Public schema no longer supports CLI (all relevant queries were moved to private schema)

## v2.13.0 2018-Sep-19

### Added

- Retro UI updates:
  - Discussion phase reflections and tasks are now layed out using masonry
  - Many cosmetic updates to card and stack styling
- Should loading the app from the CDN fail, we'll load it from the `/static` dir from
  location the app was served.
  - This may help the app load behind particularly restrictive corporate firewalls
- Build scripts now automatically rebuild the dll when yarn.lock changes

### Fixed

- #1349 no dupe team name during team creation & update
- #2169 no more double duck flashes when switching teams
- #2328 add waiting status after new team submit
- #2343 sort orgs by team
- #2351 due date picker can't change old dates
- #2383 Retrospective autogrouping
- Stale meetings should now automatically end, we've fixed the `endOldMeetings` mutation
- Graphiql works once again, now uses our new trebuchet transport
- Graphql endpoint can now fallback to vanilla HTTP transport

## v2.12.0 2018-Sep-13

### Added

- Retro prompt templates: users can select, customize, and create templates (PR #2366)
- Upgraded to Babel 7 (PR #2367)

### Fixed

- Reflection cards have the prompt footer during the discuss phase (#2304)

## v2.11.0 2018-Sep-05

### Added

- New reflect phase with personal stack & chits
- Typescript

## Fixed

- Meeting progress now requires 2 presses of the right arrow & disallows Enter #2356
- Closing a menu returns focus to the toggle #2333
- The grouping phase modal has a box shadow #2331

### Removed

- Removed all flow files that referenced typescript HOCs #2352

## v2.10.0 2018-Aug-23

### Added

- New layout for the Retro Discuss phase, PR #2320
- Retro meeting help menus link to our Retrospective Meetings 101 content, PR #2308
- App now falls back to SSE connections when websockets can’t be used, PR #2318
- New elevation system for UI inspired by Material Design, PR #2248

### Fixed

- Hides private cards in meeting summary, PR #2330

## v2.9.0 2018-Aug-15

### Added

- Completed transition to keyboard accessible Menu component to entire site

### Fixed

- Tasks are marked as being edited when a menu is open
- Fix Storybook & add support for Relay
- Fix admin route access
- Fix emoji menu clicks and enter handling
- Can join a meeting when its currently in the grouping phase

### Removed

- Legacy Menu component from /newteam, task column and integrations

## v2.8.0 2018-Aug-08

### Added

- Moved Facilitator voting controls from sidebar to bottom bar #2185
- Thumbs up emojis everywhere in Retros #2305

### Fixed

- Fixed voting race conditions fixes #2206 (see PR #2307)
- Changed log in/create account labels and language #2246
- Changed check marks to thumbs-up in all aspects of Retro voting phase #2241
- Group grid layout updates on sidebar toggle #2256
- `yarn storybook` fixed for Webpack 4 and Relay #2260

## v2.7.0 2018-Jul-24

### Fixed

- Fixed case no. 1 of retro group race bugs #2279
- Fixed reflection card overwrites, now caching in-progress reflection state #2280

## v2.6.0 2018-Jul-18

### Added

- More check-in questions #2251
- Collapsible new meeting sidebar #2243
- Rate limiting to invitation mutations #2275

### Fixed

- Promoting to billing leader auto-accepts their pending invites #2247
- All credit card modals use the updated components #2245

## v2.5.1 2018-Jul-17

### Fixed

- Hotfix preventing abuse sending email to particular domains

## v2.5.0 2018-Jul-09

### Added

- Changed Retrospective Reflect phase to submit new reflections on pressing
  the enter key
  - Shift-enter now creates newlines
- Re-implemented Retrospective grouping:
  - Uses grid-based "masonry" layout
  - Shows multiplayer drags from other users
  - Groups now expand to their own modal
  - Groups now display a count of how many cards are in the group
- Voting phase now uses thumbs-up icon following user feedback
- A variety of new check-in questions
- In-line affordances given to members on pending team invites,
  see #2108

### Fixed

- Clarified wording of cards auto-populated for new users #1067

## v2.4.1 2018-Jun-28

### Fixed

- Bug in uglify borking legacy credit card modal

## v2.4.0 2018-Jun-27

### Added

- Quietly working on custom scrollbars, not used in the app yet (#2113, #1763, #2198)

### Changed

- Refactored buttons throughout the app: button variants created using Emotion, styled components (#2193, #1928)
- More components moved from Aphrodite to Emotion

### Fixed

- Dashboard nav team name overflow (#1029)

## v2.3.0 2018-Jun-13

### Added

- Webpack v4 config for smaller, faster bundles

### Fixed

- Flash of login screen before loading dashboard
- Interrupting chicken during retro discuss phase

### Removed

- server-side rendering
- support for legacy browsers (IE11)

## v2.2.0 2018-May-30

### Added

- You can now reorder the discussion topics in a Retro meeting #2088
- Minor Retro meeting style improvements

### Fixed

- Help button now accounts for window.scrollX, remaining in it's proper place
  a when a user scrolls

## v2.1.0 2018-May-23

### Removed

- Removed the custom welcome email (#2110)

### Fixed

- Fixed the pending tooltip for team invites (#2116)
- Fixed the persistent bouncing button (#2099)

## v2.0.1 2018-May-22

### Fixed

- No meeting member when user joins team after meeting started
- Moving tasks to other teams does not update assigneeId (#2143)

## v2.0.0 2018-May-16

### Added

- Retrospectives for the general public
- Prettier and StandardJS style formatting
- Upgrade modal
- Segment analytics for socket connect/disconnect events

### Fixed

- Spotty page events for segment
- Multiple subscription bug #2053
- Card error in Meeting Summary #2034

## v1.9.0 2018-May-09

### Added

- Auto-grouping improvements: ignore plurality and case when grouping
- Added #2064 end meeting button to Action meeting
- Added #2087 due dates on Task cards
- Backend support for #1980, adding nudges for Personal-tier users to upgrade to Pro

### Fixed

- Fixed #2052 pad auth0 1-char names
- Fixed #2063 auto-grouping improvements
- Fixed #2097 empty reflections showing up in retrospective group phase
- Fixed #2094 overlap of deep stacks of reflection cards
- Fixed #2104 team unable to vote if team member joins after retro meeting started
- Strikethrough keyboard shortcut

## v1.8.0 2018-May-02

### Added

- Users now have a filter search control on My Dashboard #1887

### Changed

- Labels in the retro meeting: Group phase (Group was Theme), [Upvoted] Topic (Topic was Theme) #2041
- Improves rotation of check-in questions based on team #1578

### Fixed

- Fixed vote count in retro summary email
- Fixed false toast for not having web sockets #1955
- Fixed false positive for firewall detection
- Fixed logic for app upgrade without requiring refresh #2006
- Fixed navigational issues with the new meeting type #2062 #2060 #1979
- Trivial fix for suOrgCount query
- Suppresses task involvement notifications during meetings #1659
- Fixed archive bugs (card layout and scrolling to load) #1927 #1900

## v1.7.1 2018-Apr-26

### Fixed

- Various retro bugs
- replaced react-beautiful-dnd with react-dnd

## v1.7.0 2018-Apr-25

### Added

- new signin logic
- async emoji support in retros

### Fixed

- email invitations
- New meeting styles

### Removed

- Auth0-lock
- Persisted redux state in local storage

## v1.6.1 2018-Apr-19

### Fixed

- Minor retro bugs #2022

## v1.6.0 2018-Apr-18

### Added

- First end-to-end feature complete retrospective features
- Retrospective meetings now masked behind user feature flag, not server feature flag
- Ability to add user feature flags to emails matching regex via addFeatureFlag mutation
- First pass at styling the retrospective meeting
- New seed team ids following Auth0 dev/staging account "bankruptcy"

### Fixed

- #1997 fixed failure upon new account creation, Auth0 API exception

### Removed

- Reliance on Auth0 client API; now using Auth0 Management API exclusively

## v1.5.3 2018-Apr-12

### Fixed

- Possible login fix with extra logging

## v1.5.2 2018-Apr-12

### Added

- Error logging to login mutation

## v1.5.1 2018-Apr-12

### Fixed

- Regression in Draft-js #1993

## v1.5.0 2018-Apr-11

### Added

- Latest retro meeting progress behind the release flag
- A batch of UI style updates for consistency and improvements
- Ability to identify pro users accurately
- Help dialog content in Action meetings

### Fixed

- Segment identify logic #1901

## v1.4.0 2018-Apr-04

### Added

- More check-in questions

### Fixed

- Clear filter after leaving team dashboard #1871
- Make dash filter menus keyboard accessible
- Use react-emotion for global CSS styles

## v1.3.0 2018-Mar-28

### Added

- New authentication pages
- Many aesthetic UI updates:
  - Avatars now use new palette
  - Forms updated to match latest styles
  - Email templates match latest styles
  - Settings views updated
  - Notifications updated
  - Cards polished
- New button to start specific meeting types (behind feature flag)
- Upgraded Sentry to newest API version
- Retro reflect phase (behind feature flag)
- Retro card grouping backend (behind feature flag)
- Retro card auto grouping and auto-theme naming (behind feature flag)
- Retro card voting backend (behind feature flag)

### Fixed

- Fixes for Node v9.9
- Private tasks (#1863)

### Removed

- Stopped asking welcome wizard user for invitee's priority for the week
- Auth0 Lock

## v1.2.0 2018-Mar-21

### Added

- Retro card groups #1729 (behind feature flag)
- Retro social check-in #1741 (behind feature flag)
- Retro Backend: Creating & Editing Reflections #1742 (behind feature flag)

## v1.1.1 2018-Mar-19

### Fixed

- Regression that would mark team members present when absent was selected

## v1.1.0 2018-Mar-14

### Added

- Meeting views were updated to be closer to latest visual concepts
- Meeting views now have a designated control bar for grouping facilitation affordances
- Now using raven to handle server errors
- Added the new lobby UI for retro meetings

### Fixed

- Fixed #1866 infinite loop if you attempt to access admin without admin rights
- Fixed client-side error handling for graphql errors in http and ws
- Fixed #1740 phase navigation mutation on backend
- Fixed invoice history to show when truly paid instead of pending
- Fixed dataloader exceptions
- Fixed the ability for admins to impersonate

## v1.0.0 2018-Mar-07

### Added

- Client-side filtering behind the localFilter release flag
- A complete style makeover!
- React storybook!
- Retro cards inside storybook
- Hubspot tiering traits
- Retro meeting lobby (front-end without UI)

### Fixed

- Intranet GraphQL Ping query
- Auto-endMeeting now has dataloader and does not throw
- Notification bell highlighting goes away correctly #1806
- Team payment status is propagated in real time, no need for a refresh #1821
- Some links would refuse to be entered into a task #1791
- Wrong optimistic task when creating a task for someone else #1665
- Modal appears correctly and menu items inside it close correctly #1801
- Agenda doesn't jitter on the bottom #1734
- Agenda scrolls correctly #1802

### Removed

- Lengthy tests before deploying to development server

## v0.30.2 2018-Mar-05

### Fixed

- Don't log out when a bad invite token is attempted
- Keep dispatch after logout
- Show welcome toast to new team members (missing dispatch)

## v0.30.1 2018-Mar-01

### Fixed

- Hotfix for #1817, no longer require active subscription to update credit card

## v0.30.0 2018-Feb-28

### Added

- activeProOrgCount and activeProUserCount queries
- Change the team a card belogs to from _My Dashboard_ (#1474)
- Password recovery page (behind `newSignIn` release flag)
- Retro CTA to team dashboard

## v0.29.0 2018-Feb-21

### Fixed

- fixed withCoords
- added new sign-in page (controlled by `newSignIn` release flag)

## v0.28.1 2018-Feb-19

### Fixed

- unsentMessageQueue never released queries and mutations (#1775)

## v0.28.0 2018-Feb-14

### Added

- Done items in the meeting summary

### Fixed

- Connectivity messages for socket disconnects/reconnects/firewalls

### Removed

- SocketCluster in favor of vanilla uws

## v0.27.2 2018-Feb-11

### Fixed

- Regression caused by incomplete project -> task refactor (#1728)

## v0.27.0 2018-Feb-07

### Added

- Scroll to active agenda item during meeting
- Renamed Project to Task

### Fixed

- Minor style updates

## v0.26.1 2018-Jan-31

### Fixed

- E2E Timeouts

## v0.26.0 2018-Jan-31

### Added

- Soft team members

### Fixed

- Errors on removed team members (#1664)
- Regression in agenda list flow (#1668)
- Private cards showing up during updates phase (#1604)
- Vanishing links in cards (#1656)
- Integration regression (#1667)

## v0.25.0 2018-Jan-24

### Added

- Feature flags
- Message on websocket disconnects

### Removed

- Cashay. We're 100% Relay!

## v0.24.1 2018-Jan-10

### Fixed

- Unresponsive filtered add project button #1634

## v0.24.0 2018-Jan-08

### Added

- DataLoader to backend
- GraphQL mutation-based subscriptions
- Persisted presence

### Fixed

- Copy edits throughout meeting
- Scrolling card drag-n-drop
- Various notification bugs and inivtation logic

### Removed

- Dependencies on Cashay for all but user/org

## v0.23.0 2017-Nov-17

### Added

- Notifications when someone assigns/mentions you a task
- Create projects from your own meeting updates phase
- Send daily re-engagement emails when users have notifications in their Parabol inbox

### Fixed

- Security bug #17
- Homogenized notifications layout

### Fixed

- #1455 Database migration removing billing info from personal Organizations

## v0.22.2 2017-Nov-08

### Fixed

- #1455 Database migration removing billing info from personal Organizations

## v0.22.1 2017-Oct-26

### Fixed

- #1445 Regression where team archive was not viewable

## v0.22.0 2017-Sep-23

### Added

- Tooltip component
- Freemium UI implemented
- Invoices paginated
- End-to-end test framework and initial authentication tests
- Ability to edit the meeting check-in question for Pro teams

### Fixed

- Meeting link copier properly links to meeting lobby
- Toast alerts stay around for 10 seconds
- Stripe webhooks secured with webhook secret
- When moving to the next agenda item in a meeting, users adding project cards
  for the current agenda item stay behind until they're done editing
- Upgrade to React 16
- New Team/Organization workflow consolidated
- Authentication tokens get their own subscription channel
- Refactors
  - Moving GraphQL client code from Cashay to Relay Modern
  - Stripe webhook handlers change DB state through GraphQL

## v0.21.2 - 2017-Oct-23

### Fixed

- #1438 Fixed uncommon TypeError in SocketRoute component

## v0.21.1 - 2017-Oct-09

### Fixed

- #1373 Regression with null aud field on the JWT

## v0.21.0 - 2017-Sep-23

### Added

- When a user already belongs to Parabol, invitations arrive as notifications,
  not emails
- Moved the changeFacilitator, notification, invitation, and acceptance logic
  from cashay to relay
- Facilitation hints added to Updates, last Agenda Item
- Many new unit tests
- Smaller stuff:
  - Bumped node version to v8.5.0, bumped yarn version to v1.0.1
  - Card footer, owner label updates, ProjectEditor styles updated
  - Now loads Notifications system asynchronously
  - Improved leading blank line validation
  - Added more robust mock pub/sub for testing

### Fixed

- #788 adds meeting count to summary header
- #883 double alert modal layout
- #964 no same-day, same check-in question
- #1023, #1069, #1181, #1164, #1197, #1198, #1202, #1291, #1251, #1282 meeting
  process updates and fixes
- #1056, #1283 summary email content order
- #1119 correctly end stripe subscription for extendTrial
- #1175 focus url field when making link
- #1194 remove empty blocks from project top
- #1277 trial modal blocks left nav
- #1318 tagging seed projects
- #1340 bad invitation expirations on prod
- Fixed infinite loop & upgrade front-end router
- Segment event error when creating first team

### Removed

- Removed `webpack-shell-plugin`, `appTheme.json` now build from
  `npm run build:theme` and `npm run build:deps`; eliminates race condition
  during build

## v0.20.9 - 2017-Sep-02

### Added

- Upgrade to Node.js v8.4.0

### Fixed

- #1320, sendSegmentEvent exception (fixed by Node version update)
- #1317 TypeError: Cannot read property 'getIn' of undefined
  - Fixed by private fork of draft-js

## v0.20.8 - 2017-Aug-31

### Fixed

- #1312 getLength on truncateCard

## v0.20.7 - 2017-Aug-25

### Fixed

- #1303 Link Changer modal broke & caused an infinite loop

## v0.20.6 - 2017-Aug-24

### Fixed

- #1177 ensure that `teamId` and `orgId` are populated on most page load events
- #1179 no footer icons when menu is open
- #1193 teamIds to teamId
- #1206 semicolon delimitation on invites
- #1229 no space before new link
- #1233 add your first repo from meeting
- #1241 duplicate tags extracted from projects
- #1248 don't let repo admins unlink, destroy the repo if they get removed
- #1255 modal shudder
- #1258 Outcome Card editing state turns off when the link modal is open
- #1270 Archived Projects do not show up for some teams
- #1275 project placeholder
- #1279 portal remounts during unmount
- #1291 failed post-meeting emails
- #1298 failure on first github provider created
- #1299 bad rejoin facilitator logic

## v0.20.5 - 2017-Aug-16

### Removed

- Snyk (for now)

## v0.20.4 - 2017-Aug-16

### Fixed

- #1260 missing team names
- Upgraded to webpack 3, GraphQL 0.10.5, and much more

## v0.20.3 - 2017-Aug-14

### Fixed

- #1242 anyone can assign any team member
- #1252 fix several are editing bug
- #1253 regression on clicking card menus

## v0.20.2 - 2017-Aug-14

### Added

- add an adminUserId to every github integration

### Fixed

- #1239 Octocat styling regression

## v0.20.1 - 2017-Aug-14

### Fixed

- #1243 facilitator tethering issue
- #1246 be safe with createFromContent

## v0.20.0 - 2017-Aug-11

### Added

- Basic Slack integration:
  - Add integration in Team Settings to Slack channels of your choice
  - Get notified when a meeting begins and ends
- Basic GitHub integration:
  - Access integration settings from Team Settings
  - Create GitHub issues from project cards
  - Basic infrastructure laid for receiving webhooks from GitHub
- Pattern for animated transitions
- Fancy new menus for Project Cards
- Relay and our very own Relay pub/sub pattern

### Fixed

- #1135 yanks action email graphic
- #1128 toggle label for org members
- #1055 agenda prompt and create card UI text
- #1054 name prompt and #460 progress dots
- #1033 Updates is proper OOUX label
- #551 timestamp toggle

## v0.19.2 - 2017-Jun-29

### Fixed

- #1131 broken new team validation accepts blank name on client
- #1132 handle shouldValidate and handleSubmit on new team form

## v0.19.1 - 2017-Jun-26

### Fixed

- #914 improbable welcome wizard race condition
- #1047 refactor routing components to stop unnecessary rerenders
- #1086 teamId/orgId missing from Segment page events
- #1116 new cards during meeting shows incorrect owner
- #1117 meeting summary cards not rendering to HTML

## v0.19.0 - 2017-Jun-22

### Added

- Fancy new [draftjs](https://draftjs.org/)-based editor for
  Project cards

### Fixed

- #1085 Migrations on deploy broken (regeneratorRuntime not found)

## v0.18.3 - 2017-Jun-14

### Added

- #1070 Create segment event when meeting is automatically ended

### Fixed

- #1074 endOldMeetings: meeting already ended

## v0.18.2 - 2017-Jun-02

### Added

- Enhanced design of beta integrations configuration panel, starting with Slack

### Fixed

- Various dependency updates fixing potential security vulnerabilities

## v0.18.1 - 2017-May-18

### Added

- Removed references to "Action" as product name, now we're just going
  what people call us, "Parabol"
- Tech debt avoidance: switched to `react-router` v4 and now using
  `prop-types` module
- Added Slack notifications to CircleCI builds
- Copy updates on landing page
- During Check-In round, we now say "Here" instead of "Present" for
  our friends in the UK
- #990 new new Project card design

### Fixed

- #893 make card on team dash while user filter in on
- #924 Catch errors during auto-pause users cron job
- #970 Only send Segment Meeting Completed event for folks who were
  in the meeting
- #971 private not private when archived
- #972 tags don't exist in content
- #988 word-wrap for agenda placeholders
- #992 meeting link focus
- #994 DnD agenda items in team dash

## v0.18.0 - 2017-May-04

### Added

- Tags (#archive, #private)
- Calendar invites on first meeting Email Summary
- Integrator Microservice (Bull Job Queue, action-integrator)
- Slack integration (Naive meeting alerts)
- react-githubish-mentions
- emoji support in markdown

### Fixed

- CSS For auth0 modal on invitation route
- sorting first agenda item bug #896

### Removed

- Actions (in favor of private projects)
- redux-form from projects

## v0.17.6 - 2017-Apr-25

### Added

- Hello lang tooltips, we'll now tell you which language is saying
  hello to you during check-in round
- `teamId` added to most segment.io events, so we can account for
  metrics at the team level
- Various copy updates across the product

### Fixed

- #927 fix intranet query for un-ended meetings
- CircleCI `circle.yml` ssh key management regression fixed

## v0.17.5 - 2017-Apr-17

### Fixed

- typo in segment 'Meeting Completed' event
- fixes #350 and fixes #380 easter eggs
- fixes #498 column colors
- fixes #629 landing page
- fixes #867 free trial date copy change
- fixes #739 beta stamp
- fixes #864 team settings panel
- fixes #882 delete team button
- fixes #890 update voice of success copy

## v0.17.4 - 2017-Apr-07

### Added

- Team dash header changes: (hot lobby button! Team settings! and more!)
- New rallies!
- Updated copy for agenda last call

### Fixed

- #508 agenda input shortcut prompt
- #768 page title improvements
- Pencil after blur for editable
- Ensure meeting infinite loop fix
- Avatar group, dates

## v0.17.3 - 2017-Apr-05

### Added

- Action meeting layout and check-in UI/UX changes:
  - #717 Simplified meeting check-in process
  - #627 More vertical height during project updates
  - New placement and look for callouts and avatars
- New counters on project columns

## v0.17.2 - 2017-Apr-04

### Added

- #555 can now archive teams
  - N.B. teams can't yet be unarchived, so be careful :)
- #878 superuser GraphQL endpoint `extendTrial` to extend trial time

### Fixed

- #866 trial date completion bug
- #868, #879 agendas items not marked as complete

## v0.17.1 - 2017-Mar-29

### Fixed

- #859 infinite redirect loop when deleting the last phaseItem

## v0.17.0 - 2017-Mar-27

### Added

- Start of many copy edits (watch for more changes in future versions),
  including #716 meeting lobby updates

### Fixed

- #643 summary email subject line
- #839 max chars for projects
- #857 mystery notification

## v0.16.12 - 2017-Mar-22

### Added

- #344 meeting agenda list now reflects location of Facilitator and participants
- #837 added `Facilitator` badge and styling added to meeting Facilitator

### Fixed

- Better fix for #850 r.createdAt.getTime is not a function

## v0.16.11 - 2017-Mar-22

### Fixed

- Hotfix #850 r.createdAt.getTime is not a function

## v0.16.10 - 2017-Mar-22

### Added

- Clearer direction to meeting participants when they want to skip ahead
  of the meeting facilitator (#806, #392)
- Project cards once again submit on enter, not tab
- #728, #794 markdown now renders in email summary

### Fixed

- Re-adds user traits as context and properties to all segment events
- #840 column order:
  - We're more orthodox Kanban now dashboards (time flows left to right),
    but intentionally reversed in meetings so things are covered in a
    productive order
- #848 eager-load error validation error for stripCard

## v0.16.9 - 2017-Mar-20

### Added

- #404 add automated error reporting if meeting state gets stuck
- #762 spinner component
- #820 Trial and payment segment events
- Added raven message to meeting infiniteLoop watchdog

### Fixed

- Patch for rejoin button styles
- Ensure graphql gets a promise back from newly non-awaited calls
- Refactored segment.io calls to only pass identity traits on login and change
- #442 action disappears when creator reassigns to different owner
- #444, #663 LeftNav view glitch in Chrome
- #487 skipping updates to agenda via progress bar causes router loop
- #553, #773 DnD acts strangly when user filter active on team dashboard
- #592 facilitator abandons meeting; allow others to end it
- #660 new team member invite bug
- #714 Can't delete team members
- #718 Notification for leaving a team
- #738 Navigate to Team Settings, error ensues
- #780 Team settings invite validation allows multiple emails
- #808 Hey, I wanna pay!
- #818 highlighted team no worky
- #821 actions list not showing in my dashboard
- #824 Editing/cursor bug workaround, root cause still unknown

## v0.16.8 - 2017-Mar-14

### Fixed

- #811 Rejoin facilitator button cursor is pointer
- fix orgName update
- Dependency bumps & linting

## v0.16.7 - 2017-Mar-13

### Fixed

- #808 hey I want to pay!

## v0.16.5 - 2017-Mar-11

### Added

- Awesome spinner component
- Billing unit tests
- A few modifications and final touches to invoices

### Fixed

- #755 filter handle alignment regression
- #759 regression: clients unable to accept invitations
- #793 no such customer exception

## v0.16.3 - 8-Mar-2017

### Added

- Unit tests for Action mutations
- #462 source maps added to minified production builds
- Individual team and user project drag-and-drop sort orders now combined
  into one, universal sorting order used across the system
- Dashboard notification bar is now implemented as a "DashAlert" modal
- #736 permutations on invoice

### Fixed

- #780 email regex allowed multiple emails
- #782 regression on Project index used by archived projects
- #783 ensured CC always exists on org, no longer using pagination for invoiceList
- #784 invoice icon styling bug in production
- #553 fine tune DnD
- #714 can't delete team members
- #724 top notification bar & dash modal overlap
- #733 team project columns (filtered by team member) cache/redux error on DnD

## v0.16.2 - 4-Mar-2017

### Added

- Rejoin facilitator button
- Switched to [migrate-rethinkdb](https://github.com/ParabolInc/migrate-rethinkdb)

## v0.16.1 - 2-Mar-2017

### Added

- New unit tests

### Fixed

- Fix upcoming vs pending on invoices
- #751 production deploy, assets.json not found
- #753 cannot read property 'bestCursor' of undefined
- #755 filter handle alignment regression
- #757 add new team, always shows orgs as "Loading..."

## v0.16.0 - 2017-Feb-25

### Added

- **Organizations**: teams can be tied together into organizations
- User trials & billing: hey look! A business model!
  - New & grandfathered users start a 30 day trial
  - Trial & access expiry
  - Payment information & stripe integration
  - Invoicing
- **Notifications**: a new channel to communicate with our users
- **Portals**: we're using [react-portal-hoc](https://github.com/mattkrick/react-portal-hoc)
  to implement our dropdown menus and modals
- Updated to Node.js 7.6.0, native async/await
- Switched to [jest](https://facebook.github.io/jest/) for unit testing
  - Added first suite of server unit tests
- Refactored drag-and-drop support
- Refactored `KICK_OUT` message onto `USER_MEMO` websocket channel
- Much improved development build time by dll-izing vendor package
  - See: `npm run build:dll`
- Added `npm run start:tunnel` to start [ultrahook](http://www.ultrahook.com/)
  to facilitate Stripe & future webhook development
- Server data validation pattern
- Badge component
- Presence added to dashboards (#523)

### Fixed

- #253 auth0 token tms out of sync with rethinkdb
- #277 graphql browser CSS trouble
- #437 TypeError: Cannot read property 'openArea' of undefined
- #517 server exception encountered when generating meeting summary
- #530 duplicate team selection after reordering
- #558 when renaming on team settings, validation styling bug
- #573 Amazon S3 returning 403 for VPN clients
- #578 meeting Stuck at First Call
- #583 allow production build without S3
- #598 fix GraphQL v0.8.0 breaking changes
- #608 square avatars are square (with rounded styling)
- #718 toast notification for leaving a team copy
- #725 acceptInvitation race condition

## v0.15.3 - 2017-Feb-11

### Added

- OutcomeCard components (Projects, Action) now re-render their last-updated
  time on a smart timer

### Fixed

- Generate 'Meeting Completed' on server-side, client was not reliably
  sending this event

## v0.15.2 - 2017-Feb-01

### Fixed

- Incremented `package.json` version to match tag – oops!

## v0.15.1 - 2017-Jan-31

### Added

- `(<TAB> saves)` string to OutcomeCard components when editing
- `npm run test:xunit` command for CircleCI 2.0

## v0.15.0 - 2017-Jan-30

### Added

- When version is upgraded, we now emit a toast asking the user to upgrade
  their client version
- Markdown support added to Action and Project cards

## v0.14.2 - 2017-Jan-29

### Fixes

- #646 the first-time message meeting completion message was not displaying
- #659 auth0 profile picture meta-information now updated when user changes
  profile image

## v0.14.1 - 2017-Jan-16

### Added

- Adopted CircleCI 2.0 beta. See [circle.yml](circle.yml). Now deploys
  securely to `staging` and `production` servers directly from CI servers.
- Added three seed projects for new team leaders as a simplified on-boarding
  experience before we implement more immersive tutorial. Implements #631.
- Segment.io event tracking for welcome wizard during step3 when users only
  want to kick the tires (#638)

### Removed

- Segment.io analytics from `npm run dev` and `npm run start` when running on
  development machine.
- Only allow for /email route in development (#637)

### Fixed

- Fixes CircleCI caching issues building native bcrypt modules.

## v0.14.0 - 2017-Jan-09

### Added

- Implements #595; upload of user avatar images to S3
  - Works by securely signing S3 PutObject URL
    see [documentation](./docs/s3.md)
- `npm run build:deploy` and `npm run build:min` commands

## v0.13.6 - 2016-Dec-20

### Added

- User impersonation, login as a user with knowing their credentials on route
  `/admin/impersonate/:userid`
- Expanded requireAuthAndRole with optional args
- Added segment.io event on 'New Team' creation

## v0.13.5 - 2016-Dec-12

### Fixed

- #556 archived cards no longer let you change the owner
- #557 blur agenda item input after submit
- #559 participants stopped following the leader after meeting "Last Call"

## v0.13.4 - 2016-Dec-08

### Fixed

- #564 Fix email validation

## v0.13.3 - 2016-Dec-05

### Added

- Validations system (see: `src/universal/validations/legitify.js`)
  - Added client and server validations for all mutations
- Allow team leaders to skip step 3 of the welcome wizard (see #354)
- S3 deploys into versioned directories within bucket (see #493)

### Fixed

- #547 welcome wizard step 3 cleanup
- #549 welcome wizard step 3: removing email calls submit

## v0.13.2 - 2016-Nov-27

### Added

- 'Player joined' message when teammate accepts invitation

### Fixed

- #543 unable to end action meeting

## v0.13.1 - 2016-Nov-25

### Added

- Can now filter by team member on team dashboard Views
- Updated FontAwesome to v4.7.0

### Fixed

- #514 Relabeling Actions and Projects during agenda processing
  - Copy now reads "New private action" and "New team project"
- #536 Cashay warning while proceeding through check-in round

## v0.13.0 - 2016-Nov-22

We tagged v0.13.0 on our 1,300th commit. What a coinkidink!

### Added

- Drag-and-drop everywhere: My Dashboard (actions, projects),
  Team Dashboards (meeting agenda queue, projects), meeting project updates,
  and meeting agenda items

### Fixed

- #508 Agenda items collapse around 1265px
- #517 Server exception encountered when generating meeting summary

## v0.12.1 - 2016-Nov-15

### Fixed

- #518 Removed team member does not redirect away while on team dashboard

## v0.12.0 - 2016-Nov-15

### Added

- Added Team Settings implementation
  - Can now rename teams
  - Can promote a new team leader
  - Can invite new team members
    - Can resend invitations
    - Can revoke invitations
  - Can remove team members (even if they are in a meeting)

### Fixed

- #512 Grant facilitation permission to every team member

## v0.11.0 - 2016-Nov-05

### Added

- Added S3 deployment to `npm run build:client-min` and application

### Fixed

- #482 Avatar style improvements
  - Restores a default box shadow, with the option for border styling
  - Makes lobby and last call primary buttons more prominent
- #492 minor UI updates
  - DashModal has updated border styling
  - SummaryHeader has button-styled link to team dashboard
  - LastCall pulls success expression from array

## v0.10.0 - 2016-Nov-02

### Added

- #458 Added ability to create and invite new teams
- #466 Can now press escape to blur agenda list input
- `redux-raven-middleware` to include redux events in error reporting

### Fixed

- #161, #162 Changed lobby copy to better illustrate when check-in round begins
- #379 Uncaught TypeError: Cannot read property 'openArea' of undefined
- #411 Fix `isFacilitating` box shadow
- #474 Can steal facilitator role with refresh
- Updated styles for waiting message on last call
- Increased contrast of avatar outlines, misc. styling improvements
- Updated email link copy to summary

## v0.9.6 - 2016-Oct-29

### Added

- Automatic election of new facilitator when old facilitator disconnects
- Refactor of socket management; added container decorator to maintain
  socket connection

### Fixed

- #438 fixed TypeError: Cannot read property 'id' of undefined
- #447 unable to signout and login properly
- Fixed race condition landing on meeting summary route at end of meeting
- Fixed short urls

## v0.9.5 - 2016-Oct-25

### Fixed

- #433 server crashing on localhost
- #440 sentry.io bug on `id` field
- #445 summary rendering “0” when there aren’t members without new outcomes

## v0.9.4 - 2016-Oct-24

### Fixed

- #428 makeAppLink
- #429 race to meeting summary and lobby
- #430 generate only 1 email
- #431 killMeeting

## v0.9.3 - 2016-Oct-24

### Added

- New meeting summary web view and email
- Segment.io adoption funnel and usage tracking:
  - Welcome wizard events, 'Meeting Completed' events
  - Added segmentEventPage, renamed segmentEvent -> segmentEventTrack
  - Added Helmet components to update title on key routes
- Simple singular, plural for Last Call (#419)

### Fixed

- Segment page events now report correct document title
- #413 fixes build minification

## v0.8.1 - 2016-Oct-19

### Added

- Sentry.io automated error reporting for server and client

### Fixed

- #68 use auth0 refreshToken to keep a user logged in during a meeting
- #393 do not require enter key to advance check-in during a meeting
- #394 end meeting button copy should differ depending on user context
- #395 going back one meeting phase doesn't update phaseItem
- #396 creating agenda items from last call doesn't register them in the
  total or summary
- #397 breaks on react-router infinite loop redirect
- #400 Doesn't submit twice when using Enter to submit outcome changes

## v0.8.0 - 2016-Oct-18

### Added

- End of meeting summary

## v0.7.5 - 2016-Oct-15

### Added

- Temporarily wired meeting last call button to endMeeting mutation to enable
  more user testing
- Re-added piping to reload server code when running `npm run dev`

### Removed

- Double dependency in `package.json` on `react-hot-loader`

### Fixed

- Re-added actions subscription channel, was still being used by user dashboard

## v0.7.4 - 2016-Oct-12

### Added

- #333 Distribute auth0 clientId and domain via SSR, allows configurability
  of differing auth0 domains

### Fixed

- #325 Adding new action during action meeting shows others that
  new project is being created
- #326 Unable to make initial assignment of Action/Project to user other than
  self
- #327 Agenda order processing broken
- #328 Adding new agenda item causes other users to navigate away
- #331 Enhance design of "Whatcha need?" prompt of agenda processing
- #338 Font variants not loading
- #346 Error during meeting crashes browser
- #347 Archive Card textarea disabled state
- #349 Cannot start meeting
- #351 Font loads twice error
- #373 Read-only team name outline/focus

## v0.7.1 - 2016-Oct-05

### Fixed

- **Fixed**: #322, #323, #334, #335, #336

## v0.7.0 - 2016-Oct-04

### Added

- Now using [aphrodite](https://github.com/khan/aphrodite) for styling
- Me dashboard now has buttons to add new outcomes for Actions and Projects
- Me dashboard now has a filter option to see Projects by a specific team

### Removed

- Removed [react-look](https://github.com/rofrischmann/react-look)

### Fixed

- **Fixed**: #124, #190, #221, #227, #252, #276, #282, #290, #295, #302, #305,
  #307, #313

## v0.6.3 - 2016-Sep-28

### Fixed

- Agenda processing order fix for issue #294

## v0.6.2 - 2016-Sep-27

### Added

- Processing of agenda items during meeting into new projects and actions

### Fixed

- Add/remove rethinkdb entity from cache problem, see: <https://github.com/mattkrick/cashay/issues/125>
- Editors multiplayer field regression

## v0.6.1 - 2016-Sep-23

### Added

- Now supports removal of agenda items
- Stubbed in meeting last call for agenda items
- Now uses Cashay @live directive in subscriptions
- Added agenda hotkeys
- Partial implementation of agenda processing
- Extraction of 3rd party CSS files into their own static assets
  - Decouples Graphiql from `react-look`
- Many, many aesthetic dashboard and card improvements
- Agenda list updates
- Archiving and un-archiving of project cards
- Equity for Effort documentation updates

## Removed

- Switched back to official segment snippet generation function

## Fixed

- First call for agenda items causing infinite loop
- Fixes for `moveMeeting` mutation & `makePhaseItemFactory`
- Fixes #202, adds correct auth0 management token
- Fixes for #119, #188, #225, #231, #241, #233, and #260
- Merged #267 autofocus fix

## v0.5.3 - 2016-Aug-30

### Added

- Project updates section
- Rally easter eggs
- Segment.io metrics tracking
- Randomized check-in questions

### Removed

- editingDuck in favor of Cashay computed props

### Fixed

- Invitations and team membership + rethinkdb query optimization
- Simplified check-in cards design
- Landing page spacing
- Lots of copy updates
- redux-socket-cluster disconnect timeout
- Refactored dashboard components into many clearer containers

## v0.4.1 - 2016-Aug-16

### Added

- Added partial `/me` dashboard implementation
- Wired up project status and ownership assignment on dashboards
- Added displayed of multiplayer card editing status to project cards
  - Uses sockets-based presence system (see `@socketWithPresence` decorator)
- Improved styling of project columns on dashboards
- Temporary patch allowing invitation links to add existing users to teams
  - Later this will be handled exclusively by the dashboard

### Removed

- Unused file `universal/utils/schema.js`

### Fixed

- onBlur handler for project cards (`OutcomeCardTextAreaField` component)

## v0.4.0 - 2016-Aug-13

### Added

- User invitations
  - _Note:_ invites only process currently for new users
- Lots of infrastructure for pub/sub through the app
- User presence (who's here? who's just left?)
- `/logout` route
- Action meeting:
  - Lobby
    - Connection states
    - Start meeting
  - Check-in round
    - Update check-in states
    - Navigate forward and backward
  - Placeholder project updates layout
- Team dashboard:
  - Agenda items
  - Add new projects in column
  - Edit project description
  - Data model for sorting above list items
  - Dashboard div marking it unavailable when meeting is in progress
- Refactored auth token meta-data to include team membership, & more
- Refactored authDuck to parse auth token
- `npm run lint:fix`
- Many redux unit tests

### Removed

- **Breaking change:** removed original migrations. You'll need to wipe your
  database and start again.

## v0.3.0 - 2016-Jul-04

### Added

- `rethink-migrate` back to project
- CircleCI
- Toast notifications based upon `react-notification-system`
- [Cashay](https://github.com/mattkrick/cashay)
- JSON theme generation using `WebpackShellPlugin`
- `redux-form`
- `redux-persist`
- Email generation
  - `mailgun` sending emails
  - `oy` for HTML4 email content generation
  - `mailcomposer` for MIME email creation
  - `cheerio` to parse HTML and custom code to embed images
- Refactored team leader on-boarding journey to use `cashay` and refactored into `Welcome` module
- Refactored authentication token handling system (see `ReduxAuthEngine`)
- Numerous components
- First suite of unit tests

### Removed

- ImmutableJS
- `react-hot-loader` from production configuration

### Fixed

- GraphiQL queries with variables

## v0.2.0 (untagged)

- Adopted `react-look` for inline styling
- Restructured styles into a computed set of themes
- Began UI pattern library
- Reintroduced migrations using `rethink-migrate`
- Implemented new team creation and invitations process

## v0.1.0

### Added

- Moved to the meatier stack
- Fixed JWT expiry handling
- Fixed FOUCs in dev mode
- Removed cookies
- Removed sessions
- Removed Sails
- Remove migrations
- Switched from Falcor to GraphQL
- Added GraphiQL
- Upgraded to Babel 6
- Upgraded to react-router
- Upgraded to react-router-redux

## v0.0.1 (untagged)

### Added

- Initial fork from
  [react-redux-universal-hot-example](https://github.com/erikras/react-redux-universal-hot-example) by @jrhusney
- Initial UX design by @jrhusney & @ackernaut
- Initial CSS by @ackernaut
- Demonstration model and
  [falcor-saddle](https://github.com/ParabolInc/falcor-saddle) integration
  by @jrhusney
- socket.io change feed → client Redux implementation by @jrhusney
- Demonstration of realtime collaboration by @jrhusney & @ackernaut
- Documentation by @jrhusney
