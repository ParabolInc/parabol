## [7.52.1](https://github.com/ParabolInc/parabol/compare/v7.52.0...v7.52.1) (2024-10-21)


### Fixed

* if not exists on meetingsCount ([#10386](https://github.com/ParabolInc/parabol/issues/10386)) ([fcf66d7](https://github.com/ParabolInc/parabol/commit/fcf66d7db3ddf8c082b22a1a9b68c58e6bc9297b))

## [7.52.0](https://github.com/ParabolInc/parabol/compare/v7.51.5...v7.52.0) (2024-10-21)


### Added

* add insights feedback UI modal ([#10341](https://github.com/ParabolInc/parabol/issues/10341)) ([5446b2d](https://github.com/ParabolInc/parabol/commit/5446b2dc6bface31eb7ca677b0868a315a99228c))


### Fixed

* Crash when starting a checkin with agenda items ([#10383](https://github.com/ParabolInc/parabol/issues/10383)) ([6b817ee](https://github.com/ParabolInc/parabol/commit/6b817eee5babed03f4f530b48285b249a9a562a7))
* no duplicate notification inserts ([#10380](https://github.com/ParabolInc/parabol/issues/10380)) ([2450d5e](https://github.com/ParabolInc/parabol/commit/2450d5ef820bee5aabf2fc296367ea1f83296d75))


### Changed

* Add migration for shared secret integration provider ([#10382](https://github.com/ParabolInc/parabol/issues/10382)) ([21551df](https://github.com/ParabolInc/parabol/commit/21551dfdb7e4366ae2769e9e61aac37d336b251d))
* remove usage stats ([#10260](https://github.com/ParabolInc/parabol/issues/10260)) ([e6238a5](https://github.com/ParabolInc/parabol/commit/e6238a5686cd21b360d1e0bbac4e2c1be67a6311))

## [7.51.5](https://github.com/ParabolInc/parabol/compare/v7.51.4...v7.51.5) (2024-10-18)


### Fixed

* complete partial value for updateTaskPayload ([#10373](https://github.com/ParabolInc/parabol/issues/10373)) ([74b2e01](https://github.com/ParabolInc/parabol/commit/74b2e01b7d51a559e06133a4a09641bb0cb5ed78))

## [7.51.4](https://github.com/ParabolInc/parabol/compare/v7.51.3...v7.51.4) (2024-10-18)


### Fixed

* shortcircuit looking up tasks my integrationHash ([#10371](https://github.com/ParabolInc/parabol/issues/10371)) ([27a9752](https://github.com/ParabolInc/parabol/commit/27a9752453584405f5d1fa3c179856dd40159191))


### Changed

* **rethinkdb:** Add missing foreign key constraints ([#10359](https://github.com/ParabolInc/parabol/issues/10359)) ([c5b0d08](https://github.com/ParabolInc/parabol/commit/c5b0d089d22ba4e6a655e83caac5c1287cf0106c))

## [7.51.3](https://github.com/ParabolInc/parabol/compare/v7.51.2...v7.51.3) (2024-10-17)


### Changed

* **rethinkdb:** Notification: Phase 2 ([#10356](https://github.com/ParabolInc/parabol/issues/10356)) ([41ee5f5](https://github.com/ParabolInc/parabol/commit/41ee5f5049b2d5b011c6e524e60323485b69be64))
* **rethinkdb:** Notification: Phase 3 ([#10357](https://github.com/ParabolInc/parabol/issues/10357)) ([6fb62a7](https://github.com/ParabolInc/parabol/commit/6fb62a74d3bb87afa0c11dc9bb98b4862de3dc83))

## [7.51.2](https://github.com/ParabolInc/parabol/compare/v7.51.1...v7.51.2) (2024-10-17)


### Changed

* **rethinkdb:** Notification: Phase 1 ([#10350](https://github.com/ParabolInc/parabol/issues/10350)) ([3964c7c](https://github.com/ParabolInc/parabol/commit/3964c7c9d639bf28f3ae90c780c66f3c999ae0cd))

## [7.51.1](https://github.com/ParabolInc/parabol/compare/v7.51.0...v7.51.1) (2024-10-17)


### Fixed

* correct serialization of Task.content ([#10362](https://github.com/ParabolInc/parabol/issues/10362)) ([a4ea952](https://github.com/ParabolInc/parabol/commit/a4ea9521a452cc13747f3b97a6330d85714590ef))

## [7.51.0](https://github.com/ParabolInc/parabol/compare/v7.50.12...v7.51.0) (2024-10-16)


### Added

* add Insights UI skeleton ([#10254](https://github.com/ParabolInc/parabol/issues/10254)) ([aa8e931](https://github.com/ParabolInc/parabol/commit/aa8e9313603d081e445d5b6193059d27dfdcb268))
* **orgAdmin:** Add org admin teaser in org team page for non-enterprise orgs ([#10253](https://github.com/ParabolInc/parabol/issues/10253)) ([ca069db](https://github.com/ParabolInc/parabol/commit/ca069dbd97e3f33e81983298676aea748eda0664))
* show default insight ([#10283](https://github.com/ParabolInc/parabol/issues/10283)) ([f99e63a](https://github.com/ParabolInc/parabol/commit/f99e63a3f05a4f2b863e4b3052950de7d02cce5e))


### Changed

* remove feature flag owner ([#10319](https://github.com/ParabolInc/parabol/issues/10319)) ([dfdb68c](https://github.com/ParabolInc/parabol/commit/dfdb68cd25c4b9fb49ea1bf6a5e7cfa775151d21))
* **rethinkdb:** Task: Phase 3 ([#10339](https://github.com/ParabolInc/parabol/issues/10339)) ([7965ab6](https://github.com/ParabolInc/parabol/commit/7965ab691f3d4dc9599d9b958ecebc2c46649fad))

## [7.50.12](https://github.com/ParabolInc/parabol/compare/v7.50.11...v7.50.12) (2024-10-16)


### Changed

* **rethinkdb:** Task: Phase 2 ([#10338](https://github.com/ParabolInc/parabol/issues/10338)) ([62977ae](https://github.com/ParabolInc/parabol/commit/62977aed62f8b749476541adb924f8542934fb38))

## [7.50.11](https://github.com/ParabolInc/parabol/compare/v7.50.10...v7.50.11) (2024-10-15)


### Changed

* **deployment:** PR title for the PR that deploys to production states its purpose ([#10348](https://github.com/ParabolInc/parabol/issues/10348)) ([0932822](https://github.com/ParabolInc/parabol/commit/09328223cf0170ef7f1df94e6e326b5fdcdc0a93))
* **rethinkdb:** Task: Phase 1 ([#10336](https://github.com/ParabolInc/parabol/issues/10336)) ([5202a3b](https://github.com/ParabolInc/parabol/commit/5202a3b59c1183e8ca7eb6c0906dc2a6baf5b82e))

## [7.50.10](https://github.com/ParabolInc/parabol/compare/v7.50.9...v7.50.10) (2024-10-15)


### Changed

* remove old invite notifications ([#10345](https://github.com/ParabolInc/parabol/issues/10345)) ([6c8d420](https://github.com/ParabolInc/parabol/commit/6c8d420fa3d29243a141862fee095a3e05fed7df))

## [7.50.9](https://github.com/ParabolInc/parabol/compare/v7.50.8...v7.50.9) (2024-10-15)


### Fixed

* **dd-trace:** upgrade to v5.0.0 ([#10343](https://github.com/ParabolInc/parabol/issues/10343)) ([a3aba86](https://github.com/ParabolInc/parabol/commit/a3aba863580fb866c4affad42f03454afd0d77e8))


### Changed

* **rethinkdb:** TeamInvitation: Phase 3 ([#10327](https://github.com/ParabolInc/parabol/issues/10327)) ([9b52d49](https://github.com/ParabolInc/parabol/commit/9b52d4958d8aace5c3adc2322ede58f638a947cd))

## [7.50.8](https://github.com/ParabolInc/parabol/compare/v7.50.7...v7.50.8) (2024-10-10)


### Changed

* **rethinkdb:** TeamInvitation: Phase 2 ([#10326](https://github.com/ParabolInc/parabol/issues/10326)) ([f8486ba](https://github.com/ParabolInc/parabol/commit/f8486bae6feeeb7a69088a864e8277c53d052061))

## [7.50.7](https://github.com/ParabolInc/parabol/compare/v7.50.6...v7.50.7) (2024-10-10)


### Changed

* **rethinkdb:** NewFeature: OneShot ([#10312](https://github.com/ParabolInc/parabol/issues/10312)) ([92deddf](https://github.com/ParabolInc/parabol/commit/92deddf30645ad4d479f29eb7ab66737a3218946))
* **rethinkdb:** TeamInvitation: Phase 1 ([#10325](https://github.com/ParabolInc/parabol/issues/10325)) ([72ea4e1](https://github.com/ParabolInc/parabol/commit/72ea4e1bde79cdec9d9d4eda80932e32e880d19c))

## [7.50.6](https://github.com/ParabolInc/parabol/compare/v7.50.5...v7.50.6) (2024-10-09)


### Fixed

* catch error if user tries to join meeting twice ([#10320](https://github.com/ParabolInc/parabol/issues/10320)) ([887abd4](https://github.com/ParabolInc/parabol/commit/887abd49d6467207c60ade8f62b4e496fa9378b6))


### Changed

* **rethinkdb:** MassInvitation: OneShot ([#10311](https://github.com/ParabolInc/parabol/issues/10311)) ([fc1ef4d](https://github.com/ParabolInc/parabol/commit/fc1ef4d44568193f018a31c378181b5df92da355))
* update snyk workflow to use node20 ([#10324](https://github.com/ParabolInc/parabol/issues/10324)) ([8e1222f](https://github.com/ParabolInc/parabol/commit/8e1222fa88368d1296d125e8236d2992c05294b4))

## [7.50.5](https://github.com/ParabolInc/parabol/compare/v7.50.4...v7.50.5) (2024-10-08)


### Fixed

* timeRemaining ([#10316](https://github.com/ParabolInc/parabol/issues/10316)) ([de9df6c](https://github.com/ParabolInc/parabol/commit/de9df6ca85e9187a87fb3585279a295d29665220))

## [7.50.4](https://github.com/ParabolInc/parabol/compare/v7.50.3...v7.50.4) (2024-10-08)


### Changed

* **rethinkdb:** MeetingMember: Phase 2 ([#10294](https://github.com/ParabolInc/parabol/issues/10294)) ([af50d0a](https://github.com/ParabolInc/parabol/commit/af50d0a1420ae21b4e48ddc040c0d79f9d81e2cf))
* **rethinkdb:** MeetingMember: Phase 3 ([#10298](https://github.com/ParabolInc/parabol/issues/10298)) ([dee4e0f](https://github.com/ParabolInc/parabol/commit/dee4e0f0119bd46167175043405bc24abd49d88b))

## [7.50.3](https://github.com/ParabolInc/parabol/compare/v7.50.2...v7.50.3) (2024-10-08)


### Fixed

* **webserver:** exits with code 0 when SIGTERM is handled ([#10301](https://github.com/ParabolInc/parabol/issues/10301)) ([de317d2](https://github.com/ParabolInc/parabol/commit/de317d2dabcf6834b0564f7aab1af5ad02443d66))


### Changed

* **rethinkdb:** MeetingMember: Phase 1 ([#10289](https://github.com/ParabolInc/parabol/issues/10289)) ([abd8281](https://github.com/ParabolInc/parabol/commit/abd8281cc7e637311ea0920f21b8822b42396acd))
* **rethinkdb:** NewMeeting: Phase 3 ([#10273](https://github.com/ParabolInc/parabol/issues/10273)) ([1667810](https://github.com/ParabolInc/parabol/commit/1667810a192e82bd8d2cd49b2ed0ba138559458f))

## [7.50.2](https://github.com/ParabolInc/parabol/compare/v7.50.1...v7.50.2) (2024-10-07)


### Changed

* **metrics:** update org activities GraphQL query ([#10278](https://github.com/ParabolInc/parabol/issues/10278)) ([ef99718](https://github.com/ParabolInc/parabol/commit/ef997187ffa92fce0e8866f93943abfbf59ea660))

## [7.50.1](https://github.com/ParabolInc/parabol/compare/v7.50.0...v7.50.1) (2024-10-07)


### Changed

* improve feature flag error feedback ([#10304](https://github.com/ParabolInc/parabol/issues/10304)) ([6c058ac](https://github.com/ParabolInc/parabol/commit/6c058acf51b1031edb53feee0102602788d3bfca))

## [7.50.0](https://github.com/ParabolInc/parabol/compare/v7.49.1...v7.50.0) (2024-10-07)


### Added

* add feature flag tables ([#10184](https://github.com/ParabolInc/parabol/issues/10184)) ([ff6c25e](https://github.com/ParabolInc/parabol/commit/ff6c25e38dbab78075bc7398f32939fec5b44f45))

## [7.49.1](https://github.com/ParabolInc/parabol/compare/v7.49.0...v7.49.1) (2024-10-04)


### Fixed

* endTeamPrompt bugs ([#10295](https://github.com/ParabolInc/parabol/issues/10295)) ([d18a7a4](https://github.com/ParabolInc/parabol/commit/d18a7a4bf2703ded03a807f6778c9e85e8d92b82))

## [7.49.0](https://github.com/ParabolInc/parabol/compare/v7.48.3...v7.49.0) (2024-10-03)


### Added

* **misc:** add timer control to more meeting phases ([#10279](https://github.com/ParabolInc/parabol/issues/10279)) ([1c87753](https://github.com/ParabolInc/parabol/commit/1c87753102fcb2268ae3863d33cf99b72e663990))


### Fixed

* deadlock on teamprompt ([#10290](https://github.com/ParabolInc/parabol/issues/10290)) ([ae72c0d](https://github.com/ParabolInc/parabol/commit/ae72c0d88e7329e05597eae40ba730f927a21537))

## [7.48.3](https://github.com/ParabolInc/parabol/compare/v7.48.2...v7.48.3) (2024-10-01)


### Changed

* **rethinkdb:** NewMeeting: Phase 2 ([#10266](https://github.com/ParabolInc/parabol/issues/10266)) ([1a86d3c](https://github.com/ParabolInc/parabol/commit/1a86d3cddcb299880308211e8c8ffd7bd270f7be))

## [7.48.2](https://github.com/ParabolInc/parabol/compare/v7.48.1...v7.48.2) (2024-10-01)


### Fixed

* Fix crash in end checkin without pinned agenda items ([#10282](https://github.com/ParabolInc/parabol/issues/10282)) ([66097b8](https://github.com/ParabolInc/parabol/commit/66097b8e6fc0d5f41c79f1b1b2a3ea3e5676526b))


### Changed

* **deps:** bump express from 4.19.2 to 4.20.0 ([#10212](https://github.com/ParabolInc/parabol/issues/10212)) ([b8e9925](https://github.com/ParabolInc/parabol/commit/b8e99253757735212b0e6979d5a7a47ab8417a99))

## [7.48.1](https://github.com/ParabolInc/parabol/compare/v7.48.0...v7.48.1) (2024-09-27)


### Fixed

* stop series when team is no more ([#10268](https://github.com/ParabolInc/parabol/issues/10268)) ([203835e](https://github.com/ParabolInc/parabol/commit/203835e4296f17f51c8d6f968b41f7fb64e820ab))


### Changed

* **rethinkdb:** NewMeeting: Phase 1a ([#10216](https://github.com/ParabolInc/parabol/issues/10216)) ([6273411](https://github.com/ParabolInc/parabol/commit/6273411f5c5e7e03dc569b3359a49902b88dc11c))
* **rethinkdb:** NewMeeting: Phase 1b ([#10250](https://github.com/ParabolInc/parabol/issues/10250)) ([8070a7e](https://github.com/ParabolInc/parabol/commit/8070a7e82d156d7b587742f1bde8279419ea85db))

## [7.48.0](https://github.com/ParabolInc/parabol/compare/v7.47.5...v7.48.0) (2024-09-24)


### Added

* **metrics:** add mutation to generate usage report ([#10236](https://github.com/ParabolInc/parabol/issues/10236)) ([b72decd](https://github.com/ParabolInc/parabol/commit/b72decd56c08239ca990fa23552faf5d33182012))


### Fixed

* bump relay so it shares react's scheduler ([#10262](https://github.com/ParabolInc/parabol/issues/10262)) ([5893e38](https://github.com/ParabolInc/parabol/commit/5893e38a008597ec2e659b488ec0e3444338a2ff))
* isPaid flag when moving teams to 0-team org ([#10263](https://github.com/ParabolInc/parabol/issues/10263)) ([b625d7e](https://github.com/ParabolInc/parabol/commit/b625d7e51b5ef4fe196251110699d99249d44fc9))
* **misc:** show full length of agenda item text when hovering ([#10251](https://github.com/ParabolInc/parabol/issues/10251)) ([89661a7](https://github.com/ParabolInc/parabol/commit/89661a7425898418461aefb65428179622c70b78))

## [7.47.5](https://github.com/ParabolInc/parabol/compare/v7.47.4...v7.47.5) (2024-09-16)


### Fixed

* Remove duplicate org users ([#10198](https://github.com/ParabolInc/parabol/issues/10198)) ([cafbf32](https://github.com/ParabolInc/parabol/commit/cafbf320f02f652ba9b011a4a06b0606a4faf81e))

## [7.47.4](https://github.com/ParabolInc/parabol/compare/v7.47.3...v7.47.4) (2024-09-12)


### Fixed

* add quotes to constraint ([#10230](https://github.com/ParabolInc/parabol/issues/10230)) ([7071759](https://github.com/ParabolInc/parabol/commit/7071759492febb7df44d3189a4e9fae103ca1cef))

## [7.47.3](https://github.com/ParabolInc/parabol/compare/v7.47.2...v7.47.3) (2024-09-12)


### Fixed

* threadParent can exist outside comment table ([#10228](https://github.com/ParabolInc/parabol/issues/10228)) ([05ac90b](https://github.com/ParabolInc/parabol/commit/05ac90b3830b9ff0cbf65ebea21cf4907e6b2916))


### Changed

* Speed up processRecurrence test ([#10204](https://github.com/ParabolInc/parabol/issues/10204)) ([45964d1](https://github.com/ParabolInc/parabol/commit/45964d128679ea7c50634d9ad3ef2cd3c6dbde7d))

## [7.47.2](https://github.com/ParabolInc/parabol/compare/v7.47.1...v7.47.2) (2024-09-11)


### Changed

* **rethinkdb:** PasswordResetRequest: One-shot ([#10210](https://github.com/ParabolInc/parabol/issues/10210)) ([12315b0](https://github.com/ParabolInc/parabol/commit/12315b05e741f4de7289d020d63579e109465d1f))
* **rethinkdb:** PushInvitation: One-shot ([#10213](https://github.com/ParabolInc/parabol/issues/10213)) ([7f95a81](https://github.com/ParabolInc/parabol/commit/7f95a81b5facdd780f2c9e3a99470636c884d941))
* **rethinkdb:** ReflectPhase: Phase 2 ([#10208](https://github.com/ParabolInc/parabol/issues/10208)) ([3fddb97](https://github.com/ParabolInc/parabol/commit/3fddb9750746c5b27ab6d9c59d9e785e5d7d6cd0))
* **rethinkdb:** ReflectPhase: Phase 3 ([#10209](https://github.com/ParabolInc/parabol/issues/10209)) ([1131785](https://github.com/ParabolInc/parabol/commit/1131785e26e870909f5cb2db2c99322b007e4546))

## [7.47.1](https://github.com/ParabolInc/parabol/compare/v7.47.0...v7.47.1) (2024-09-11)


### Fixed

* move to rrule-rust ([#10181](https://github.com/ParabolInc/parabol/issues/10181)) ([2952c3d](https://github.com/ParabolInc/parabol/commit/2952c3d88b60aa3ebc6001ecd10eca10357b7570))


### Changed

* **rethinkdb:** ReflectPrompt: Phase 1 ([#10193](https://github.com/ParabolInc/parabol/issues/10193)) ([e48732b](https://github.com/ParabolInc/parabol/commit/e48732b73e1c52de05ded693bc5e8b69d628dcba))

## [7.47.0](https://github.com/ParabolInc/parabol/compare/v7.46.3...v7.47.0) (2024-09-10)


### Added

* Enable connecting to different GitLab integration providers ([#10025](https://github.com/ParabolInc/parabol/issues/10025)) ([8806839](https://github.com/ParabolInc/parabol/commit/880683996e4afb117ed21918a2c91574b649d4d9))


### Fixed

* Anonymous comments ([#10206](https://github.com/ParabolInc/parabol/issues/10206)) ([45501a3](https://github.com/ParabolInc/parabol/commit/45501a3950f1d511bfc428c80bbb8e537cae8837))
* **orgAdmin:** user should be able to remove themselves from the org ([#10201](https://github.com/ParabolInc/parabol/issues/10201)) ([4368c0b](https://github.com/ParabolInc/parabol/commit/4368c0bc6af2310f62133ae07c331912bb048628))


### Changed

* **deps-dev:** bump webpack from 5.89.0 to 5.94.0 ([#10168](https://github.com/ParabolInc/parabol/issues/10168)) ([e7d25ea](https://github.com/ParabolInc/parabol/commit/e7d25ea4048a0f2c4716968be072ca139ee09485))
* **deps:** bump fast-xml-parser from 4.3.2 to 4.4.1 ([#10047](https://github.com/ParabolInc/parabol/issues/10047)) ([e3b528f](https://github.com/ParabolInc/parabol/commit/e3b528ff2eda697797c0731df9041df34e77afd5))
* **Snyk:** Upgrade openapi-fetch from 0.9.8 to 0.10.0 ([#9955](https://github.com/ParabolInc/parabol/issues/9955)) ([06f0b0b](https://github.com/ParabolInc/parabol/commit/06f0b0b5491db2d4049d06758ea7afb35298e4a2))

## [7.46.3](https://github.com/ParabolInc/parabol/compare/v7.46.2...v7.46.3) (2024-09-09)


### Changed

* **metrics:** Only track 'Loaded a Page' event to Amplitude when userId is known ([#9193](https://github.com/ParabolInc/parabol/issues/9193)) ([be5d28a](https://github.com/ParabolInc/parabol/commit/be5d28a05d3d839ead0924fe79b736bd49abbce8))
* **rethinkdb:** Comment: Phase 3 ([#10172](https://github.com/ParabolInc/parabol/issues/10172)) ([22c3b5b](https://github.com/ParabolInc/parabol/commit/22c3b5bfa392d0bcaeed997ce7698a72edf9b23c))

## [7.46.2](https://github.com/ParabolInc/parabol/compare/v7.46.1...v7.46.2) (2024-09-06)


### Fixed

* insert discussion before comment ([#10194](https://github.com/ParabolInc/parabol/issues/10194)) ([724a340](https://github.com/ParabolInc/parabol/commit/724a340e5872fc13963cad278bb13017f0ec1270))

## [7.46.1](https://github.com/ParabolInc/parabol/compare/v7.46.0...v7.46.1) (2024-09-06)


### Fixed

* multiple slack notifications ([#10190](https://github.com/ParabolInc/parabol/issues/10190)) ([c4444ef](https://github.com/ParabolInc/parabol/commit/c4444ef9814a30bb2659427d17f639dbf151f46e))


### Changed

* **rethinkdb:** Comment: Phase 2 ([#10180](https://github.com/ParabolInc/parabol/issues/10180)) ([9148205](https://github.com/ParabolInc/parabol/commit/91482054870809d133fbc70af078b033d55c6ace))

## [7.46.0](https://github.com/ParabolInc/parabol/compare/v7.45.2...v7.46.0) (2024-09-04)


### Added

* **orgAdmin:** search in org members page ([#10187](https://github.com/ParabolInc/parabol/issues/10187)) ([968452e](https://github.com/ParabolInc/parabol/commit/968452e28003b188f6706f10b005d84508e11634))
* **orgAdmins:** Make org members view sortable ([#10146](https://github.com/ParabolInc/parabol/issues/10146)) ([97bb948](https://github.com/ParabolInc/parabol/commit/97bb948330e1e57a331113e267ec5965a84ea6e4))


### Changed

* **deps:** bump micromatch from 4.0.5 to 4.0.8 ([#10164](https://github.com/ParabolInc/parabol/issues/10164)) ([70f69ce](https://github.com/ParabolInc/parabol/commit/70f69ce039f9550c52f391c0f556919a7fe4589b))

## [7.45.2](https://github.com/ParabolInc/parabol/compare/v7.45.1...v7.45.2) (2024-08-29)


### Fixed

* add discussion before comments ([#10178](https://github.com/ParabolInc/parabol/issues/10178)) ([911ab90](https://github.com/ParabolInc/parabol/commit/911ab904550c9235f34a2bd48606d036d2b229e3))


### Changed

* **rethinkdb:** Comment: Phase 2 ([#10173](https://github.com/ParabolInc/parabol/issues/10173)) ([635fb15](https://github.com/ParabolInc/parabol/commit/635fb15cb30e0819268256866d1cb5511dc6b9a8))

## [7.45.1](https://github.com/ParabolInc/parabol/compare/v7.45.0...v7.45.1) (2024-08-29)


### Fixed

* consolidate org user menus ([#10162](https://github.com/ParabolInc/parabol/issues/10162)) ([b172a2f](https://github.com/ParabolInc/parabol/commit/b172a2fa4e29245a916fe4046b29366b0f0b2b0e))


### Changed

* bump eslint ([#10170](https://github.com/ParabolInc/parabol/issues/10170)) ([002aac2](https://github.com/ParabolInc/parabol/commit/002aac201159e99d45367f44634e065566f1553f))
* **rethinkdb:** Comment: Phase 1 ([#10166](https://github.com/ParabolInc/parabol/issues/10166)) ([d712811](https://github.com/ParabolInc/parabol/commit/d7128119c320efed44721fe6c4aad500d4617dbf))

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
