# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## [15.27.2](https://github.com/ParabolInc/parabol/compare/v15.27.1...v15.27.2) (2026-11-12)


### Fixed

* **client:** don't mount private pages without an unexpired auth token ([#14114](https://github.com/ParabolInc/parabol/issues/14114)) ([879eafc](https://github.com/ParabolInc/parabol/commit/879eafc88dd3e9e2c2a1d80551509f76310e9285))
* **server:** give permission rules a nullable authToken type ([#14113](https://github.com/ParabolInc/parabol/issues/14113)) ([d29c564](https://github.com/ParabolInc/parabol/commit/d29c56474cdfac31d3ec8148a80b18471cd7aad7))

## [15.27.1](https://github.com/ParabolInc/parabol/compare/v15.27.0...v15.27.1) (2026-11-12)


### Fixed

* **server:** deny a signed-out caller in team permission rules instead of crashing ([#14111](https://github.com/ParabolInc/parabol/issues/14111)) ([6a41fba](https://github.com/ParabolInc/parabol/commit/6a41fba0cb9bc3d6ae72ce12ddc53ea6ad393eff))

## [15.27.0](https://github.com/ParabolInc/parabol/compare/v15.26.0...v15.27.0) (2026-11-12)


### Added

* **server:** group suggestions like teams do, and record grouping metrics for future optimization ([#14106](https://github.com/ParabolInc/parabol/issues/14106)) ([224a7aa](https://github.com/ParabolInc/parabol/commit/224a7aa062fbee0770bc8f8b4a62d0443ebda69d))


### Fixed

* only show the Reports glow to people who have met ([#14107](https://github.com/ParabolInc/parabol/issues/14107)) ([b9af681](https://github.com/ParabolInc/parabol/commit/b9af681f1f519bc93ef1b0abaa32ad645c38eb96))

## [15.26.0](https://github.com/ParabolInc/parabol/compare/v15.25.1...v15.26.0) (2026-11-12)


### Added

* **server:** require an error code on every GraphQLError ([#14099](https://github.com/ParabolInc/parabol/issues/14099)) ([0da9bf8](https://github.com/ParabolInc/parabol/commit/0da9bf8829284fade8d6ebbb91709d66f7f92010))


### Fixed

* **client:** don't report console errors that browser extensions log ([#14084](https://github.com/ParabolInc/parabol/issues/14084)) ([623f541](https://github.com/ParabolInc/parabol/commit/623f54173e56f7f30aced9113895c369fbfd4d63))
* **client:** send an HTTP query again when the load balancer drops its connection ([#14071](https://github.com/ParabolInc/parabol/issues/14071)) ([20d6ae3](https://github.com/ParabolInc/parabol/commit/20d6ae361bda6589ff8d3f608d1ba06fe74ebd6e))
* **client:** skip a removed prompt template whose team isn't loaded ([#14093](https://github.com/ParabolInc/parabol/issues/14093)) ([6f33467](https://github.com/ParabolInc/parabol/commit/6f3346783a3c7a1ee7b7c40b7fc79111d1d3d673))
* **client:** skip parse errors from scripts an extension injects into the page ([#14096](https://github.com/ParabolInc/parabol/issues/14096)) ([7250bed](https://github.com/ParabolInc/parabol/commit/7250bed9af85465f4dab51f42980be7dfc779309))
* **server:** deactivate a Slack auth whose token Slack reports as inactive or revoked ([#14092](https://github.com/ParabolInc/parabol/issues/14092)) ([7573185](https://github.com/ParabolInc/parabol/commit/757318552834a703f0dc459d69c399336cebeeec))
* **server:** let verifyEmail sign in an existing user who has no password identity ([#14094](https://github.com/ParabolInc/parabol/issues/14094)) ([89fa066](https://github.com/ParabolInc/parabol/commit/89fa066d44adbbb181ea702c92410f92621e6a21))
* **server:** make OAuth2 access tokens scope-limited credentials ([#13838](https://github.com/ParabolInc/parabol/issues/13838)) ([752d4ca](https://github.com/ParabolInc/parabol/commit/752d4ca45ccbda3bd28b646517371dbcd99c2e5b))

## [15.25.1](https://github.com/ParabolInc/parabol/compare/v15.25.0...v15.25.1) (2026-11-11)


### Fixed

* **client:** keep queries and subscriptions working while the socket reconnects ([#14086](https://github.com/ParabolInc/parabol/issues/14086)) ([1a6e50b](https://github.com/ParabolInc/parabol/commit/1a6e50bd55a95e6c21733bd43aaf6f10fdf3e3aa))
* **client:** recognize errors from other realms and Safari extensions when reporting client errors ([#14075](https://github.com/ParabolInc/parabol/issues/14075)) ([4bab378](https://github.com/ParabolInc/parabol/commit/4bab3781aa7872906e0947784256c5b2a9525d83))
* **dev:** seed meetings that open ([#14085](https://github.com/ParabolInc/parabol/issues/14085)) ([87a7f2a](https://github.com/ParabolInc/parabol/commit/87a7f2ae6b67e15186643c83668c1fb444cd4e2f))
* **pages:** don't put a permanently deleted page back in the left nav ([#14073](https://github.com/ParabolInc/parabol/issues/14073)) ([b2a8287](https://github.com/ParabolInc/parabol/commit/b2a8287db3739da8cab276d185cdbade23cf0c31))
* **poker:** don't let a story still being added to scope be dragged ([#14083](https://github.com/ParabolInc/parabol/issues/14083)) ([e6450bc](https://github.com/ParabolInc/parabol/commit/e6450bc0a92d779d59e3067d0c8c3ffec969cd24))
* reject websocket handshakes without an Upgrade header and tell blocked users why ([#14077](https://github.com/ParabolInc/parabol/issues/14077)) ([18fbca5](https://github.com/ParabolInc/parabol/commit/18fbca546cfb1103cd7f756e180526d869c98517))
* **server:** add SCIM group members before removing old ones, so replacing every member keeps the team ([#14079](https://github.com/ParabolInc/parabol/issues/14079)) ([4fde07f](https://github.com/ParabolInc/parabol/commit/4fde07fb83ef80f133f24d589034a3855108c37b))
* **server:** hand sockets and Yjs documents to the other servers on deploy ([#14089](https://github.com/ParabolInc/parabol/issues/14089)) ([0f91bd4](https://github.com/ParabolInc/parabol/commit/0f91bd4b661a9135972b4c7873339d26d4724500))
* **server:** leave exactly one team lead when promoting ([#14065](https://github.com/ParabolInc/parabol/issues/14065)) ([2545ffd](https://github.com/ParabolInc/parabol/commit/2545ffda5171fb1b50966d24a398135f524a711c))
* **slack:** stop notifying archived Slack channels ([#14070](https://github.com/ParabolInc/parabol/issues/14070)) ([77095ea](https://github.com/ParabolInc/parabol/commit/77095eaeff430b25ca73816834911560cef401da))


### Changed

* **gh-actions:** prewarm each release image for GKE image streaming ([#14080](https://github.com/ParabolInc/parabol/issues/14080)) ([5672439](https://github.com/ParabolInc/parabol/commit/5672439e1dbc635392374b9f0e8eb45d57e57ed4))

## [15.25.0](https://github.com/ParabolInc/parabol/compare/v15.24.0...v15.25.0) (2026-11-11)


### Added

* rainbow glow on Reports until the first visit ([#14076](https://github.com/ParabolInc/parabol/issues/14076)) ([21279c3](https://github.com/ParabolInc/parabol/commit/21279c3ad17d8d5b4e4e8bd285e2028eb0683e4b))
* Reports for every organization ([#14063](https://github.com/ParabolInc/parabol/issues/14063)) ([66686af](https://github.com/ParabolInc/parabol/commit/66686af2ba34d500e9028cec57f8198b54d6d27a))


### Fixed

* **client:** make every editor list each slash command it offers ([#14064](https://github.com/ParabolInc/parabol/issues/14064)) ([7119319](https://github.com/ParabolInc/parabol/commit/711931926b5d6397cf8239af9f9d57eada9e6696))
* **client:** remove only the ended meeting from a team's active meetings ([#14074](https://github.com/ParabolInc/parabol/issues/14074)) ([b49c548](https://github.com/ParabolInc/parabol/commit/b49c548d4850101c277e3b1f68ccb1d3a061d581))
* **client:** save a task card when an upload in it finishes or fails ([#14072](https://github.com/ParabolInc/parabol/issues/14072)) ([1f862ce](https://github.com/ParabolInc/parabol/commit/1f862ce6eee6baf4b02d669816031cdff3681f53))
* **server:** keep one Postgres pool when an idle connection fails ([#14067](https://github.com/ParabolInc/parabol/issues/14067)) ([f2ea489](https://github.com/ParabolInc/parabol/commit/f2ea489a1ebea66819d884c6fa3029c745482ac3))
* **server:** let POSTGRES_POOL_SIZE set the pool size ([#14066](https://github.com/ParabolInc/parabol/issues/14066)) ([c77d5f5](https://github.com/ParabolInc/parabol/commit/c77d5f5ed101095e683d451ec26c3808840a73f6))

## [15.24.0](https://github.com/ParabolInc/parabol/compare/v15.23.0...v15.24.0) (2026-11-11)


### Added

* **client:** pause a hidden tab's socket and refetch when it returns ([#14048](https://github.com/ParabolInc/parabol/issues/14048)) ([fd0812e](https://github.com/ParabolInc/parabol/commit/fd0812e2cff3fd01d04061d9c0f4e10677d90424))
* open the send menu instantly ([#14053](https://github.com/ParabolInc/parabol/issues/14053)) ([6c85893](https://github.com/ParabolInc/parabol/commit/6c8589344153289beca5ba0602f335b715bb5d39))
* say when a tool fails or needs reconnecting in the send menu ([#14054](https://github.com/ParabolInc/parabol/issues/14054)) ([b979b93](https://github.com/ParabolInc/parabol/commit/b979b932862c66f1fa046257e56f486a32abb7dc))
* suggest the tools your organization already uses ([#14046](https://github.com/ParabolInc/parabol/issues/14046)) ([3fd8354](https://github.com/ParabolInc/parabol/commit/3fd83540073af8a09093fb8f0785eb0a6adc5b3e))


### Fixed

* **client:** answer the task send button's query in the retro demo ([#14058](https://github.com/ParabolInc/parabol/issues/14058)) ([f5c7908](https://github.com/ParabolInc/parabol/commit/f5c7908a463469851bf1940502b2166e02b31445))
* **client:** only ask for invoices on the plans and billing page when the viewer is a billing leader ([#14036](https://github.com/ParabolInc/parabol/issues/14036)) ([688fc20](https://github.com/ParabolInc/parabol/commit/688fc2026918a96c0a5bd9714771a124a0a385f3))
* **client:** refetch when a tab that was away reconnects after a deploy ([#14044](https://github.com/ParabolInc/parabol/issues/14044)) ([d1ae4ab](https://github.com/ParabolInc/parabol/commit/d1ae4abaaca43d233b74648b36c83731255901c3))
* disable End Check-in Meeting while it ends, and end check-ins faster ([#14042](https://github.com/ParabolInc/parabol/issues/14042)) ([0ecd589](https://github.com/ParabolInc/parabol/commit/0ecd58929315831b3b8d2edb2a7a9290799f3428))
* **jira:** treat a 404 from a removed Atlassian site as no access ([#14030](https://github.com/ParabolInc/parabol/issues/14030)) ([dd0086c](https://github.com/ParabolInc/parabol/commit/dd0086cbe0816a082235524d744ac35a06f44a24))
* **server:** don't log an error when a retro leaves the group phase with no reflections ([#14023](https://github.com/ParabolInc/parabol/issues/14023)) ([71a244e](https://github.com/ParabolInc/parabol/commit/71a244ec43c9c88e3414bc5810299c4f004e17d9))
* **server:** forget a websocket that closes while it connects ([#14043](https://github.com/ParabolInc/parabol/issues/14043)) ([fe7471b](https://github.com/ParabolInc/parabol/commit/fe7471bd86ee4908401c8f45deb88b4979016cb7))
* **server:** pass rrule range bounds in UTC so DST-ambiguous times don't throw ([#14029](https://github.com/ParabolInc/parabol/issues/14029)) ([b34c45d](https://github.com/ParabolInc/parabol/commit/b34c45d2c650219fa2b5f15e2e666d6aab3f7e3b))
* **server:** refresh the auth cookie when addOrg or joinTeam adds the viewer to a team ([#14057](https://github.com/ParabolInc/parabol/issues/14057)) ([4a1eb03](https://github.com/ParabolInc/parabol/commit/4a1eb03339a37d85b1fdf186fb593544385eccfa))
* **server:** remove a team's departing members together so successors are always members who stay ([#14062](https://github.com/ParabolInc/parabol/issues/14062)) ([f0ec0ff](https://github.com/ParabolInc/parabol/commit/f0ec0ff24ecc1d32eda605c2efa7dd50ef227f12))
* **server:** share one write per user file path so GCS doesn't reject concurrent writes ([#14061](https://github.com/ParabolInc/parabol/issues/14061)) ([08ad1c4](https://github.com/ParabolInc/parabol/commit/08ad1c489239518f97083bb4701f7df60e554b83))
* show that End was clicked in every menu, and end all meetings faster ([#14047](https://github.com/ParabolInc/parabol/issues/14047)) ([deebe00](https://github.com/ParabolInc/parabol/commit/deebe00b92247fb713306366b582a92ad6abde0b))

## [15.23.0](https://github.com/ParabolInc/parabol/compare/v15.22.0...v15.23.0) (2026-11-10)


### Added

* show where a task can be sent on every card ([#14034](https://github.com/ParabolInc/parabol/issues/14034)) ([f4c81a7](https://github.com/ParabolInc/parabol/commit/f4c81a71d2b95602bcb1629245cbfbc3631e35ed))


### Fixed

* **server:** count a new web server's first websocket connects in the realtime SLO ([#14041](https://github.com/ParabolInc/parabol/issues/14041)) ([752e2bf](https://github.com/ParabolInc/parabol/commit/752e2bf6e949e3062891fc723af708e4e9235053))
* **server:** poker meetings crash when an org has a task with a JSON null integration ([#14037](https://github.com/ParabolInc/parabol/issues/14037)) ([8cece98](https://github.com/ParabolInc/parabol/commit/8cece9893186ed66cf9da5bfd8402ee860f1795e))

## [15.22.0](https://github.com/ParabolInc/parabol/compare/v15.21.2...v15.22.0) (2026-11-10)


### Added

* mark tasks created since the last retro when reviewing tasks ([#14024](https://github.com/ParabolInc/parabol/issues/14024)) ([df65fce](https://github.com/ParabolInc/parabol/commit/df65fce5ef26664f5cdfc84f7e86f4fa9b378c53))
* one Review Tasks stage when the team has no open tasks ([#14033](https://github.com/ParabolInc/parabol/issues/14033)) ([be30e13](https://github.com/ParabolInc/parabol/commit/be30e13fa8a3ebc4cfe06563cc0ee0fd4ec57b03))
* say why a Review Tasks stage is empty ([#14032](https://github.com/ParabolInc/parabol/issues/14032)) ([2d4a28a](https://github.com/ParabolInc/parabol/commit/2d4a28a5b032d355220576fdc4f4817e275dbff1))


### Fixed

* **client:** fill the avatar box with the fallback icon ([#14035](https://github.com/ParabolInc/parabol/issues/14035)) ([bb04025](https://github.com/ParabolInc/parabol/commit/bb040252406222eb2b538896bf0bd33e7cdbdc25))
* **client:** handle the meeting music mutation in the retro demo ([#14027](https://github.com/ParabolInc/parabol/issues/14027)) ([1acbc9e](https://github.com/ParabolInc/parabol/commit/1acbc9e87a2f96f8a4505ce2312116bdaf9505c3))
* **client:** wait for a poker story's stages to load before showing its dimensions ([#14028](https://github.com/ParabolInc/parabol/issues/14028)) ([3276a48](https://github.com/ParabolInc/parabol/commit/3276a4868106791048188b43a8dca4b11a838072))
* **server:** treat Jira's 403 page as an issue the account can't access ([#14025](https://github.com/ParabolInc/parabol/issues/14025)) ([9a5c1a8](https://github.com/ParabolInc/parabol/commit/9a5c1a8b0bcbd78ccab318286d0f8fdb6a5b7c84))

## [15.21.2](https://github.com/ParabolInc/parabol/compare/v15.21.1...v15.21.2) (2026-11-10)


### Fixed

* **client:** skip a failed service worker update in every browser, not only Chrome ([#14022](https://github.com/ParabolInc/parabol/issues/14022)) ([17fe8e1](https://github.com/ParabolInc/parabol/commit/17fe8e1f34eb893a4459ac20ca68054a4dddd7a5))
* only publish subscription payloads the client selects ([#14018](https://github.com/ParabolInc/parabol/issues/14018)) ([adcf0f4](https://github.com/ParabolInc/parabol/commit/adcf0f4ea0793942273750e6e2bc91af4eff4090))
* **server:** only allow reactjis on items in the authorized meeting ([#14016](https://github.com/ParabolInc/parabol/issues/14016)) ([1f063b2](https://github.com/ParabolInc/parabol/commit/1f063b2f2768ad3a6138156ddce9d938f58e8005))
* **server:** report missing subjects from applyFeatureFlag ([#14003](https://github.com/ParabolInc/parabol/issues/14003)) ([9ad6958](https://github.com/ParabolInc/parabol/commit/9ad6958d2be47552f541271adf6229b2e79554a4))

## [15.21.1](https://github.com/ParabolInc/parabol/compare/v15.21.0...v15.21.1) (2026-11-10)


### Fixed

* **client:** forward mutation responses with no data to Relay unchanged ([#14013](https://github.com/ParabolInc/parabol/issues/14013)) ([f5e5620](https://github.com/ParabolInc/parabol/commit/f5e5620c3aa195d4593cce49ce95f9d6de3ab0e2))
* **client:** select poker template editing payloads in TeamSubscription ([#13991](https://github.com/ParabolInc/parabol/issues/13991)) ([6814e5c](https://github.com/ParabolInc/parabol/commit/6814e5cc83b7bb7c6a103dbeedef967af17f8692))
* **client:** stop the team subscription asking for the credit card update's Stripe secret ([#14015](https://github.com/ParabolInc/parabol/issues/14015)) ([fb571d4](https://github.com/ParabolInc/parabol/commit/fb571d4c407dbf8c8b32d6720c84145bc8888ee7))
* **server:** resolve a retro discuss stage whose reflection group no longer exists ([#13982](https://github.com/ParabolInc/parabol/issues/13982)) ([891bab9](https://github.com/ParabolInc/parabol/commit/891bab982c5b1e176a54a7c18c3bc1c1fc54ba7a))

## [15.21.0](https://github.com/ParabolInc/parabol/compare/v15.20.0...v15.21.0) (2026-11-10)


### Added

* ClickUp integration built on the contributor kit ([#14004](https://github.com/ParabolInc/parabol/issues/14004)) ([2a30850](https://github.com/ParabolInc/parabol/commit/2a30850bda3d2c42b3b980cc90685fc2090e7ed1))
* **client:** show what's worth raising when reviewing tasks ([#14010](https://github.com/ParabolInc/parabol/issues/14010)) ([b1af0d4](https://github.com/ParabolInc/parabol/commit/b1af0d47c79ffe638f723c3eea6d48ece43468b3))
* **embedder:** count each model's fill jobs in a metric ([#14011](https://github.com/ParabolInc/parabol/issues/14011)) ([b656891](https://github.com/ParabolInc/parabol/commit/b6568910602f7dc8fbb2845ce5735c19bae77d3d))


### Fixed

* fetch a meeting only after its subscription is listening, and broadcast only the joiner's data ([#14008](https://github.com/ParabolInc/parabol/issues/14008)) ([90a625a](https://github.com/ParabolInc/parabol/commit/90a625a24b05f44cf70edf86e32a0bb06ad90c44))
* lock meetings while removing a team member's stages, and remove them on clients as a delta ([#14012](https://github.com/ParabolInc/parabol/issues/14012)) ([a394d3e](https://github.com/ParabolInc/parabol/commit/a394d3eb5bf53cd40a4389960d140d42c203a3b8))
* **server:** send the daily notification summary emails again ([#14007](https://github.com/ParabolInc/parabol/issues/14007)) ([7fdcb6e](https://github.com/ParabolInc/parabol/commit/7fdcb6e97853402b7201f2f857af7041f46b1e4a))


### Changed

* integration contributor kit and per-service file moves ([#14000](https://github.com/ParabolInc/parabol/issues/14000)) ([1728aff](https://github.com/ParabolInc/parabol/commit/1728affe657ddde12ee1268967c253c65edb5a2d))

## [15.20.0](https://github.com/ParabolInc/parabol/compare/v15.19.0...v15.20.0) (2026-11-07)


### Added

* measure data waterfalls per route, in dev and from real users ([#13999](https://github.com/ParabolInc/parabol/issues/13999)) ([bbb94a9](https://github.com/ParabolInc/parabol/commit/bbb94a9520c9aa523ff858a56ac9ce7827d0ef16))


### Fixed

* **client:** open the request-to-join review modal from its toast and notification ([#13997](https://github.com/ParabolInc/parabol/issues/13997)) ([0b5bc33](https://github.com/ParabolInc/parabol/commit/0b5bc336157478a57d0e51677d27af17963423a5))

## [15.19.0](https://github.com/ParabolInc/parabol/compare/v15.18.1...v15.19.0) (2026-11-06)


### Added

* post error feedback through the log line instead of a Google Form ([#13996](https://github.com/ParabolInc/parabol/issues/13996)) ([be3d498](https://github.com/ParabolInc/parabol/commit/be3d498adc650cb233f84c2b46bff9c7b1c48ea1))
* **server:** log error-form feedback with the crash's eventId ([#13988](https://github.com/ParabolInc/parabol/issues/13988)) ([15752b5](https://github.com/ParabolInc/parabol/commit/15752b5d0c6667899d81554f17e4d92605e1592b))


### Fixed

* **client:** fill the retro demo's Push to Integration menu ([#13994](https://github.com/ParabolInc/parabol/issues/13994)) ([53053ca](https://github.com/ParabolInc/parabol/commit/53053cac6fa5ec3b742388a1909c5ba3a166180d))
* **client:** open the activity library on favorites when the viewer has some ([#13993](https://github.com/ParabolInc/parabol/issues/13993)) ([1e1c3c1](https://github.com/ParabolInc/parabol/commit/1e1c3c14d1482c287d694dfdb92039b7d3d87495))
* **client:** receive DowngradeToStarterPayload in organization and team subscriptions ([#13985](https://github.com/ParabolInc/parabol/issues/13985)) ([e300f9f](https://github.com/ParabolInc/parabol/commit/e300f9f1aca78a8978812908910aaee9a187d7fe))
* **client:** split multipart responses on the line-starting delimiter, not the bare boundary ([#13984](https://github.com/ParabolInc/parabol/issues/13984)) ([914a12b](https://github.com/ParabolInc/parabol/commit/914a12b76061a913e5728d18e30a608b81854d09))
* **server:** give a SCIM group over 100 members a 400 that says why ([#13979](https://github.com/ParabolInc/parabol/issues/13979)) ([29aa0aa](https://github.com/ParabolInc/parabol/commit/29aa0aae561b41fe619397a09360a8daf74fc12d))


### Changed

* drop TaskIntegration.service and the deprecated GitLabIntegration.projects ([#13992](https://github.com/ParabolInc/parabol/issues/13992)) ([04351ce](https://github.com/ParabolInc/parabol/commit/04351ce2d73f0e9b737f9c7efc1d3a5a1119cb2e))
* move per-service id codecs into client/integrations ([#13995](https://github.com/ParabolInc/parabol/issues/13995)) ([b7eccbb](https://github.com/ParabolInc/parabol/commit/b7eccbbaafefa515a5ff54a7c631b04a44c6c5b1))

## [15.18.1](https://github.com/ParabolInc/parabol/compare/v15.18.0...v15.18.1) (2026-11-06)


### Fixed

* **client:** select DragEstimatingTaskSuccess in the meeting subscription ([#13965](https://github.com/ParabolInc/parabol/issues/13965)) ([98b1680](https://github.com/ParabolInc/parabol/commit/98b16803ef4ab7a6b72348747f0d8eeae5da7b3b))
* **server:** give a browser error one fingerprint in every browser and release ([#13981](https://github.com/ParabolInc/parabol/issues/13981)) ([70a98fa](https://github.com/ParabolInc/parabol/commit/70a98fad00fb0dcb6868b3c2e7b96e3e4a713c91))
* **server:** publish setTeamNotificationSetting under its TeamSubscriptionPayload field name ([#13971](https://github.com/ParabolInc/parabol/issues/13971)) ([0eeed3b](https://github.com/ParabolInc/parabol/commit/0eeed3b8f2cbe6a01897b603cfb883813111e3d3))
* **server:** stop publishing modifyCheckInQuestion results to the meeting subscription ([#13967](https://github.com/ParabolInc/parabol/issues/13967)) ([0ec1836](https://github.com/ParabolInc/parabol/commit/0ec1836b669aadbda4e957b237f3f75a3cd2c1ca))

## [15.18.0](https://github.com/ParabolInc/parabol/compare/v15.17.1...v15.18.0) (2026-11-05)


### Added

* **server:** run with a read-only root filesystem ([#13976](https://github.com/ParabolInc/parabol/issues/13976)) ([65d9f9d](https://github.com/ParabolInc/parabol/commit/65d9f9d0da8f03c7cbfda5228a5e0225489624cc))


### Fixed

* **server:** refresh Jira tokens a few at a time instead of all at once ([#13966](https://github.com/ParabolInc/parabol/issues/13966)) ([c508567](https://github.com/ParabolInc/parabol/commit/c5085677dc14641e84546f14120fb1c8f5c2eb0a))
* space the Done button below the new token ([#13975](https://github.com/ParabolInc/parabol/issues/13975)) ([be9a21b](https://github.com/ParabolInc/parabol/commit/be9a21b4d37999df8113f9eae35bcc7017ad4b5d))
* stop the meeting avatar row from flickering in large meetings ([#13978](https://github.com/ParabolInc/parabol/issues/13978)) ([98af5b8](https://github.com/ParabolInc/parabol/commit/98af5b83d6635265b3e4a923e1ea825fc0d264d7))


### Changed

* work drawers go through the integration registry ([#13658](https://github.com/ParabolInc/parabol/issues/13658)) ([ec9029b](https://github.com/ParabolInc/parabol/commit/ec9029b8af5df96013135d752ef8d66ca58aeacc))

## [15.17.1](https://github.com/ParabolInc/parabol/compare/v15.17.0...v15.17.1) (2026-11-05)


### Fixed

* **client:** stop reporting a failed initial WebSocket connect as a console error ([#13968](https://github.com/ParabolInc/parabol/issues/13968)) ([ca26ad7](https://github.com/ParabolInc/parabol/commit/ca26ad78645462204bb0f2827428a7ef445f817f))
* **client:** stop reporting an error when a navigate-meeting update arrives for a meeting the viewer has not loaded ([#13960](https://github.com/ParabolInc/parabol/issues/13960)) ([1623f91](https://github.com/ParabolInc/parabol/commit/1623f91eabde80ce65fbd6752bc55402d3f293f3))
* **embedder:** leave a new model's fill out of the backlog metric ([#13972](https://github.com/ParabolInc/parabol/issues/13972)) ([1fea2e4](https://github.com/ParabolInc/parabol/commit/1fea2e4b31c96fef5b86ee0099508f0432d640ce))
* **server:** don't log Jira issues the user can't access as errors ([#13962](https://github.com/ParabolInc/parabol/issues/13962)) ([94b630a](https://github.com/ParabolInc/parabol/commit/94b630a02f668532e198687c82675c624c57f704))
* **server:** keep integration auth when token refresh gets a non-JSON response ([#13964](https://github.com/ParabolInc/parabol/issues/13964)) ([185f847](https://github.com/ParabolInc/parabol/commit/185f84780f30be8ba0232dbb303ea6b1cc698fd5))
* **server:** use current facilitator stage when removing consecutive poker stages ([#13961](https://github.com/ParabolInc/parabol/issues/13961)) ([b48a1f3](https://github.com/ParabolInc/parabol/commit/b48a1f3a210e3872ae02c7d1f924816ee985d93f))

## [15.17.0](https://github.com/ParabolInc/parabol/compare/v15.16.0...v15.17.0) (2026-11-05)


### Added

* add a search text serializer for page blocks ([#13932](https://github.com/ParabolInc/parabol/issues/13932)) ([335e103](https://github.com/ParabolInc/parabol/commit/335e103997c6662ea05758cea242b6db7416afbe))
* add Harrier as an embedding model and fill its tables in priority order ([#13935](https://github.com/ParabolInc/parabol/issues/13935)) ([c281b1e](https://github.com/ParabolInc/parabol/commit/c281b1ecdaf2d520ff1e2d115faf59b13c5d3d2d))
* answer Reports questions about facilitators, standups, invitations, pages, team leads and spend ([#13950](https://github.com/ParabolInc/parabol/issues/13950)) ([d123efe](https://github.com/ParabolInc/parabol/commit/d123efe456532e653a2f186cb3dd8830164ddcc2))
* find related discussions from plain topic text on Harrier ([#13936](https://github.com/ParabolInc/parabol/issues/13936)) ([ff0aa02](https://github.com/ParabolInc/parabol/commit/ff0aa02ed6472fbfab63acbcd9b8097b07a8d8b8))
* let each embedding model choose its page chunker ([#13933](https://github.com/ParabolInc/parabol/issues/13933)) ([973868f](https://github.com/ParabolInc/parabol/commit/973868f2105c318830c6d2c53582aafabe5074ea))
* log the context needed to reproduce production errors ([#13946](https://github.com/ParabolInc/parabol/issues/13946)) ([610706f](https://github.com/ParabolInc/parabol/commit/610706f6ce3f0ca13c475274a8e9db11ea257c03))
* match misspelled words against page titles ([#13930](https://github.com/ParabolInc/parabol/issues/13930)) ([5ada975](https://github.com/ParabolInc/parabol/commit/5ada9750f1c720ccb5e1a3de8b78f99d2c6c9bf4))
* re-embed only the page chunks an edit changed ([#13934](https://github.com/ParabolInc/parabol/issues/13934)) ([4410114](https://github.com/ParabolInc/parabol/commit/4410114cbf958ac0385e3e4cec7c8755867e93c4))
* set template search and Similar Wording cut-offs per embedding model ([#13937](https://github.com/ParabolInc/parabol/issues/13937)) ([6094b9f](https://github.com/ParabolInc/parabol/commit/6094b9f8784e4062683a5cffd906d985d82cf747))
* turn a page block into another type from its menu ([#13941](https://github.com/ParabolInc/parabol/issues/13941)) ([9fbf056](https://github.com/ParabolInc/parabol/commit/9fbf0566567d01680f6d5e2a3c2bacd3947b6010))
* update the web client quietly and tell a stale client why it errored ([#13957](https://github.com/ParabolInc/parabol/issues/13957)) ([a31ab7f](https://github.com/ParabolInc/parabol/commit/a31ab7f85d262e62fb2327a50b8c19d363cb1d6a))
* wait for page edits to settle before embedding ([#13931](https://github.com/ParabolInc/parabol/issues/13931)) ([b8d0829](https://github.com/ParabolInc/parabol/commit/b8d08294a7acabe4e6e531f1d2974e1ddd825da1))


### Fixed

* [web] Error: [convertADFToTipTap] Unsupported ADF node type: &lt;str&gt; ([#13959](https://github.com/ParabolInc/parabol/issues/13959)) ([6937a5c](https://github.com/ParabolInc/parabol/commit/6937a5ca711539d9786828bc40f63b23cc4554fa))
* **deps:** upgrade packages with security advisories ([#13926](https://github.com/ParabolInc/parabol/issues/13926)) ([674d0a0](https://github.com/ParabolInc/parabol/commit/674d0a0ddfab8a74c59f84071b77af30044b33a6))
* embed every meeting template, including ones added after the first import ([#13928](https://github.com/ParabolInc/parabol/issues/13928)) ([f502150](https://github.com/ParabolInc/parabol/commit/f50215072274cf42a92169dd590797c07fa49539))
* keep a new open Details open when something updates it first ([#13944](https://github.com/ParabolInc/parabol/issues/13944)) ([54906ee](https://github.com/ParabolInc/parabol/commit/54906eed1986efa049aadbf0487e8000e6ade29c))
* keep recurring stand-ups on their template when its scope narrows ([#13956](https://github.com/ParabolInc/parabol/issues/13956)) ([f8e559f](https://github.com/ParabolInc/parabol/commit/f8e559f1d04eaad72ac270d7aedf92006f845fa0))
* keep Reports' AI from answering a different question, and let people rate its reports ([#13949](https://github.com/ParabolInc/parabol/issues/13949)) ([459f20c](https://github.com/ParabolInc/parabol/commit/459f20cd868e9148db605b1a4e29f4e820fccf46))
* **reports:** say each empty-state action once ([#13943](https://github.com/ParabolInc/parabol/issues/13943)) ([49aa641](https://github.com/ParabolInc/parabol/commit/49aa641833fc499bc9e74348e300540b153fe445))
* **server:** resend Redis commands a Valkey failover fails instead of crashing ([#13940](https://github.com/ParabolInc/parabol/issues/13940)) ([b4d756d](https://github.com/ParabolInc/parabol/commit/b4d756d591d88008773140a7edb00f7fb87bc766))
* stop Add another prompt crashing the template page ([#13955](https://github.com/ParabolInc/parabol/issues/13955)) ([0df4867](https://github.com/ParabolInc/parabol/commit/0df4867c09c873bbbe3ee698185cadf691418bfe))
* tell people when page search finds nothing ([#13929](https://github.com/ParabolInc/parabol/issues/13929)) ([2880d8f](https://github.com/ParabolInc/parabol/commit/2880d8f755464408554db2de385ec4fd9425803d))


### Changed

* add a dev service for Harrier and write up moving to a new model ([#13938](https://github.com/ParabolInc/parabol/issues/13938)) ([96d1b6a](https://github.com/ParabolInc/parabol/commit/96d1b6a76c6109cf443532ea2d92568050c46cc3))
* add the final page search gate ([#13939](https://github.com/ParabolInc/parabol/issues/13939)) ([550bb8b](https://github.com/ParabolInc/parabol/commit/550bb8b72723f57281494c70171ebc8f0f58dad0))
* remove Amplitude from the web client ([#13958](https://github.com/ParabolInc/parabol/issues/13958)) ([3948469](https://github.com/ParabolInc/parabol/commit/39484695f2fd53ecdcdf32ae5b6601f604f80722))
* remove server-side Amplitude ([#13945](https://github.com/ParabolInc/parabol/issues/13945)) ([6180768](https://github.com/ParabolInc/parabol/commit/6180768001025bd49445ada9e322ddcd1d0a27bb))

## [15.16.0](https://github.com/ParabolInc/parabol/compare/v15.15.2...v15.16.0) (2026-11-03)


### Added

* let page search match numbers like [#5](https://github.com/ParabolInc/parabol/issues/5) ([#13807](https://github.com/ParabolInc/parabol/issues/13807)) ([f034d85](https://github.com/ParabolInc/parabol/commit/f034d85a10a0c6b569705f428907a93fa619a58d))


### Fixed

* accept a team invitation once and let Back leave it ([#13922](https://github.com/ParabolInc/parabol/issues/13922)) ([0d0cc34](https://github.com/ParabolInc/parabol/commit/0d0cc340def65d4b7096b5e8a203811c6c5ad5cf))
* **dev:** install dependencies before the dev stack starts its tasks ([#13915](https://github.com/ParabolInc/parabol/issues/13915)) ([7a7d191](https://github.com/ParabolInc/parabol/commit/7a7d19148c393a59d848eceb732336d4c4a324c8))
* only track presence on the meeting cards that are on screen ([#13924](https://github.com/ParabolInc/parabol/issues/13924)) ([34958c1](https://github.com/ParabolInc/parabol/commit/34958c1b02ef4313cf7205a79a6c93415224149e))
* **reports:** stop iOS offering AutoFill Contact on the ask box ([#13925](https://github.com/ParabolInc/parabol/issues/13925)) ([5edeaf8](https://github.com/ParabolInc/parabol/commit/5edeaf8b2e1596c5a092edb6d8b33cbbc5519a0c))
* **server:** make each websocket wait on its own drain ([#13911](https://github.com/ParabolInc/parabol/issues/13911)) ([39fb8a0](https://github.com/ParabolInc/parabol/commit/39fb8a0e140a27c1a73bc5ceb1574afb8d29b3c6))
* **server:** resume websocket sends after uWS returns from drain ([#13921](https://github.com/ParabolInc/parabol/issues/13921)) ([0b20c65](https://github.com/ParabolInc/parabol/commit/0b20c651bc147d2f57e50407dd5e1a9689c12cd3))
* **server:** stop dropping websocket messages behind a large result ([#13917](https://github.com/ParabolInc/parabol/issues/13917)) ([2fda07a](https://github.com/ParabolInc/parabol/commit/2fda07a77cd816adb8c9816ec6bc1fa0012f92a6))
* show an image when Slack and others unfurl app links ([#13920](https://github.com/ParabolInc/parabol/issues/13920)) ([b7d0d6d](https://github.com/ParabolInc/parabol/commit/b7d0d6d210d1ad2110a48bd40b7efcf1b9b89af4))
* show invitees who have an account the sign-in form on the team invitation page ([#13923](https://github.com/ParabolInc/parabol/issues/13923)) ([cf4cb6d](https://github.com/ParabolInc/parabol/commit/cf4cb6de54607a1cf7f3be9ce61877adba757958))
* show teammates a new task's text once it is submitted ([#13916](https://github.com/ParabolInc/parabol/issues/13916)) ([436d9ba](https://github.com/ParabolInc/parabol/commit/436d9ba4168c417b1a2b7b34d8255cb92cfa511f))
* sign-in from a page returns to that page ([#13918](https://github.com/ParabolInc/parabol/issues/13918)) ([14eb479](https://github.com/ParabolInc/parabol/commit/14eb47957374dd4ba6891cb694e326b55ad54c57))
* throttle refused Yjs documents per user instead of every document per IP header ([#13919](https://github.com/ParabolInc/parabol/issues/13919)) ([e4b8f88](https://github.com/ParabolInc/parabol/commit/e4b8f88e2fef39f8d19d6411dfe509517a011588))


### Changed

* **gh-actions:** remove the maintainer approval check ([#13909](https://github.com/ParabolInc/parabol/issues/13909)) ([19db634](https://github.com/ParabolInc/parabol/commit/19db63463f698f0fa01c152fceedd742215cc886))

## [15.15.2](https://github.com/ParabolInc/parabol/compare/v15.15.1...v15.15.2) (2026-11-03)


### Fixed

* report client console errors to Google and trace the other HTTP routes ([#13908](https://github.com/ParabolInc/parabol/issues/13908)) ([c33c50e](https://github.com/ParabolInc/parabol/commit/c33c50e7741ed3a1a0a02788fd80b47cfcc54a43))
* **server:** choose the superuser schema per request over HTTP and websockets ([#13898](https://github.com/ParabolInc/parabol/issues/13898)) ([05b8079](https://github.com/ParabolInc/parabol/commit/05b8079a19e2de658da9e98ba85f387070847db9))
* **server:** record websocket connections the client abandons or onConnect fails ([#13899](https://github.com/ParabolInc/parabol/issues/13899)) ([cea6d3e](https://github.com/ParabolInc/parabol/commit/cea6d3e52f1e3cca5ef23017d5dbeed846cb3552))


### Changed

* **gh-actions:** make parabol-product the code owner of everything ([#13902](https://github.com/ParabolInc/parabol/issues/13902)) ([3917682](https://github.com/ParabolInc/parabol/commit/3917682c7e8dc9d15ba4d67ca73f212cd48e6686))
* **gh-actions:** require mattkrick or jordanh to approve everyone else's pull requests ([#13907](https://github.com/ParabolInc/parabol/issues/13907)) ([4866c1b](https://github.com/ParabolInc/parabol/commit/4866c1b3c5a579262712b7b204f73a3e9dd13e6b))
* **gh-actions:** stop granting id-token to Test and Style Check ([#13901](https://github.com/ParabolInc/parabol/issues/13901)) ([44d71b7](https://github.com/ParabolInc/parabol/commit/44d71b71b5b950b14d5507bb4125d5aeb9ed605d))
* remove Datadog ([#13905](https://github.com/ParabolInc/parabol/issues/13905)) ([41d2814](https://github.com/ParabolInc/parabol/commit/41d2814db841629202ffb20d13cde395b9342e93))

## [15.15.1](https://github.com/ParabolInc/parabol/compare/v15.15.0...v15.15.1) (2026-11-02)


### Fixed

* **server:** answer GET /stripe with a 405 ([#13872](https://github.com/ParabolInc/parabol/issues/13872)) ([8e39095](https://github.com/ParabolInc/parabol/commit/8e390958aae54d1d90a5815a795af3cb49c8b49c))
* **server:** attach Zoom summaries and transcripts that arrive before the meeting ends ([#13895](https://github.com/ParabolInc/parabol/issues/13895)) ([175bcc6](https://github.com/ParabolInc/parabol/commit/175bcc6f4ab865d88a73c7b09e9772ec14fa5fb4))
* **server:** ignore schema extension attributes in SCIM PATCH requests ([#13869](https://github.com/ParabolInc/parabol/issues/13869)) ([5910316](https://github.com/ParabolInc/parabol/commit/5910316bcee40c2629d842b674acaa201019c5d5))
* **server:** keep an impersonation token's expiry when it is re-issued ([#13861](https://github.com/ParabolInc/parabol/issues/13861)) ([5749752](https://github.com/ParabolInc/parabol/commit/5749752a58bc618a29c66f95e6f31cb8c06b9e33))


### Changed

* **gh-actions:** remove the docker-external workflow ([#13868](https://github.com/ParabolInc/parabol/issues/13868)) ([1ea011f](https://github.com/ParabolInc/parabol/commit/1ea011fd50eed97c86a8bd07e3d656a76f674210))
* **gh-actions:** remove the ironbank workflow ([#13873](https://github.com/ParabolInc/parabol/issues/13873)) ([57dfb15](https://github.com/ParabolInc/parabol/commit/57dfb15e845036e9b8bc0f61bb38d8f21988b77d))

## [15.15.0](https://github.com/ParabolInc/parabol/compare/v15.14.1...v15.15.0) (2026-10-31)


### Added

* **server:** audit every root field with its outcome and actor ([#13856](https://github.com/ParabolInc/parabol/issues/13856)) ([481dc57](https://github.com/ParabolInc/parabol/commit/481dc5774bca4d171f05b730bb69afaee33e926c))
* **server:** count unexpected GraphQL errors and websocket connect outcomes for SLOs ([#13854](https://github.com/ParabolInc/parabol/issues/13854)) ([f3bdb10](https://github.com/ParabolInc/parabol/commit/f3bdb1055122d242b00af1b04506fd11f60ab021))
* **server:** trace GraphQL operations, resolvers, Postgres, Valkey and outbound HTTP with OpenTelemetry ([#13857](https://github.com/ParabolInc/parabol/issues/13857)) ([c66f565](https://github.com/ParabolInc/parabol/commit/c66f565dd06ab945b2b3d71f894ee95004080e1c))


### Changed

* tell Kargo about each new release image ([#13858](https://github.com/ParabolInc/parabol/issues/13858)) ([24f1f34](https://github.com/ParabolInc/parabol/commit/24f1f345c1c649a59867684a2c4bd0a08eed2ff5))

## [15.14.1](https://github.com/ParabolInc/parabol/compare/v15.14.0...v15.14.1) (2026-10-31)


### Changed

* deploy production through Kargo instead of GitLab ([#13852](https://github.com/ParabolInc/parabol/issues/13852)) ([6550b5d](https://github.com/ParabolInc/parabol/commit/6550b5d87b80e158dc54f4b6e05c3b0228e852ca))

## [15.14.0](https://github.com/ParabolInc/parabol/compare/v15.13.0...v15.14.0) (2026-10-31)


### Added

* **server:** serve Prometheus metrics by default with product heartbeat counters ([#13848](https://github.com/ParabolInc/parabol/issues/13848)) ([cf14fd7](https://github.com/ParabolInc/parabol/commit/cf14fd7b74b3185aaeb37b591ddfe57658f9f035))


### Fixed

* **server:** verify Zoom webhook signatures before answering url_validation ([#13834](https://github.com/ParabolInc/parabol/issues/13834)) ([e16d452](https://github.com/ParabolInc/parabol/commit/e16d452b471a2d62bc5564dbbc72fb138ccbe79d))
* skip predeploy migrations when the database is ahead of the build ([#13844](https://github.com/ParabolInc/parabol/issues/13844)) ([692e242](https://github.com/ParabolInc/parabol/commit/692e2424f77bd942160734c9f3160864145b2da3))
* stop Yjs tabs from leaking providers into a reconnect loop ([#13849](https://github.com/ParabolInc/parabol/issues/13849)) ([7904a8e](https://github.com/ParabolInc/parabol/commit/7904a8ef67153b93c3be623a56054680e7509f13))


### Changed

* log the release version without the commit hash ([#13846](https://github.com/ParabolInc/parabol/issues/13846)) ([ff183cf](https://github.com/ParabolInc/parabol/commit/ff183cf24c2ccd5aaff95436db2eeb8b036f4594))
* stop deploying staging through GitLab ([#13847](https://github.com/ParabolInc/parabol/issues/13847)) ([503d957](https://github.com/ParabolInc/parabol/commit/503d9576b34cb9a49c05ec468cb6b6905c083e0f))

## [15.13.0](https://github.com/ParabolInc/parabol/compare/v15.12.1...v15.13.0) (2026-10-31)


### Added

* capture browser errors with breadcrumbs and log them as parabol-client ([#13828](https://github.com/ParabolInc/parabol/issues/13828)) ([939a61b](https://github.com/ParabolInc/parabol/commit/939a61bfba3be436546d560d3c66b8ce484c5734))


### Fixed

* only allow http, https and mailto links in stored TipTap content ([#13835](https://github.com/ParabolInc/parabol/issues/13835)) ([3a6286d](https://github.com/ParabolInc/parabol/commit/3a6286d91653d9c39741bceb3d22818e0c8c97bd))
* **server:** give subscription events without an operationId their own dataloader ([#13841](https://github.com/ParabolInc/parabol/issues/13841)) ([4ae16b7](https://github.com/ParabolInc/parabol/commit/4ae16b7815e6525b72db689c09c15344ff185870))
* **server:** log subscription events, process warnings and Redis errors with context ([#13842](https://github.com/ParabolInc/parabol/issues/13842)) ([e289c1e](https://github.com/ParabolInc/parabol/commit/e289c1eed6bd9a769c08a30e6b3bcf8db92cac69))
* **server:** only a session can create or update personal access tokens ([#13840](https://github.com/ParabolInc/parabol/issues/13840)) ([6ef5e2e](https://github.com/ParabolInc/parabol/commit/6ef5e2e7128c5579322f2ab471d7300c55d9af45))


### Changed

* bump node to 26.13.0 ([#13831](https://github.com/ParabolInc/parabol/issues/13831)) ([5c5c16d](https://github.com/ParabolInc/parabol/commit/5c5c16deeade4e66aac79334dee711bf2b3a6d96))

## [15.12.1](https://github.com/ParabolInc/parabol/compare/v15.12.0...v15.12.1) (2026-10-30)


### Fixed

* blank screen at / for signed-in users on React 19 ([#13833](https://github.com/ParabolInc/parabol/issues/13833)) ([164aa8a](https://github.com/ParabolInc/parabol/commit/164aa8ab9e2883f709091c48b9c971c84b88ed71))
* **server:** stop trusting IdP metadata named in the SAML RelayState ([#13829](https://github.com/ParabolInc/parabol/issues/13829)) ([7b7d5c1](https://github.com/ParabolInc/parabol/commit/7b7d5c18c717c4390a37384ef7dcf3722ad80c78))

## [15.12.0](https://github.com/ParabolInc/parabol/compare/v15.11.0...v15.12.0) (2026-10-30)


### Added

* connect client operations to server logs with trace and session ids ([#13762](https://github.com/ParabolInc/parabol/issues/13762)) ([d042baf](https://github.com/ParabolInc/parabol/commit/d042baf7ec2f5e4e1f9031e52a4fd289957216b0))
* **server:** structured logger with request context and error fingerprints ([#13757](https://github.com/ParabolInc/parabol/issues/13757)) ([a00deb9](https://github.com/ParabolInc/parabol/commit/a00deb9e9eb9976e9c363e8b7cac2ce1b156844a))


### Fixed

* keep a comment in edit mode after choosing Edit Comment ([#13819](https://github.com/ParabolInc/parabol/issues/13819)) ([8cde373](https://github.com/ParabolInc/parabol/commit/8cde373f219cf880fe6d97fd7641c21adb22b4a0))
* remove Partial and Preview GQL types ([#13788](https://github.com/ParabolInc/parabol/issues/13788)) ([d17946b](https://github.com/ParabolInc/parabol/commit/d17946bfedb57abf25c9383e9280ab9232640c51))
* retro discussion thread in React 19 dev mode ([#13823](https://github.com/ParabolInc/parabol/issues/13823)) ([89bd2f0](https://github.com/ParabolInc/parabol/commit/89bd2f0380c4174c62fc67f021c72a343163260e))
* **server:** type the page search eval's Logger.warn arguments ([#13818](https://github.com/ParabolInc/parabol/issues/13818)) ([f1e8796](https://github.com/ParabolInc/parabol/commit/f1e8796556c48f99f9bcac84f0ba0ed91481d6ed))


### Changed

* upgrade React to 19.3 ([#13804](https://github.com/ParabolInc/parabol/issues/13804)) ([b27164e](https://github.com/ParabolInc/parabol/commit/b27164e4525956e4c70a0b2059571f7022a7d8bf))

## [15.11.0](https://github.com/ParabolInc/parabol/compare/v15.10.0...v15.11.0) (2026-10-30)


### Added

* let page search match questions and pages with some of the words ([#13802](https://github.com/ParabolInc/parabol/issues/13802)) ([2134eb7](https://github.com/ParabolInc/parabol/commit/2134eb7c7b8c9c8c26d546d52a06ad9da4c2e1c3))
* re-tune how page search blends keyword and meaning matches ([#13803](https://github.com/ParabolInc/parabol/issues/13803)) ([9d27104](https://github.com/ParabolInc/parabol/commit/9d271049112ef3b68d5b67abef5c0914c591402c))
* skip near-empty pages in semantic page search ([#13801](https://github.com/ParabolInc/parabol/issues/13801)) ([fce4497](https://github.com/ParabolInc/parabol/commit/fce4497e0567f25464a71ef594c91fbb315f0afe))
* Team Health attention marks in Reports ([#13748](https://github.com/ParabolInc/parabol/issues/13748)) ([903d9da](https://github.com/ParabolInc/parabol/commit/903d9da650e2f3e203120fcf9d31bef8a59f99e0))


### Changed

* add a heavy-account corpus to the pages search eval ([#13799](https://github.com/ParabolInc/parabol/issues/13799)) ([3fe98b3](https://github.com/ParabolInc/parabol/commit/3fe98b386fedaa43834f23b5ef9a76a8ec64eab8))
* add a sealed holdout for the page search re-embed gate ([#13806](https://github.com/ParabolInc/parabol/issues/13806)) ([ba1395c](https://github.com/ParabolInc/parabol/commit/ba1395c7624e97ca4359bb1d000d3f8574675b41))

## [15.10.0](https://github.com/ParabolInc/parabol/compare/v15.9.0...v15.10.0) (2026-10-29)


### Added

* rank page search results per page ([#13793](https://github.com/ParabolInc/parabol/issues/13793)) ([bd35d14](https://github.com/ParabolInc/parabol/commit/bd35d14baabb37598875d7cf209d9b07e4b1029f))
* show keyword page search results while the best results load ([#13796](https://github.com/ParabolInc/parabol/issues/13796)) ([e7422c4](https://github.com/ParabolInc/parabol/commit/e7422c4c12abe6684a10962d5fa97d4ea10d3aab))

## [15.9.0](https://github.com/ParabolInc/parabol/compare/v15.8.1...v15.9.0) (2026-10-28)


### Added

* Reports, behind the Reports flag ([#13713](https://github.com/ParabolInc/parabol/issues/13713)) ([8f965d2](https://github.com/ParabolInc/parabol/commit/8f965d2572e550bf212fb12f7b2abf51e98c5d22))

## [15.8.1](https://github.com/ParabolInc/parabol/compare/v15.8.0...v15.8.1) (2026-10-28)


### Fixed

* explain bad embed links and let Escape or Backspace drop an empty embed ([#13784](https://github.com/ParabolInc/parabol/issues/13784)) ([8d6a844](https://github.com/ParabolInc/parabol/commit/8d6a84488a8f0628afb23e9851c6e813e2a8ceb8))
* show page link titles, not markdown, in search snippets ([#13783](https://github.com/ParabolInc/parabol/issues/13783)) ([75e627a](https://github.com/ParabolInc/parabol/commit/75e627a583f88230621bdefffd7885f4ee398d8f))

## [15.8.0](https://github.com/ParabolInc/parabol/compare/v15.7.4...v15.8.0) (2026-10-28)


### Added

* pages embed block ([#13779](https://github.com/ParabolInc/parabol/issues/13779)) ([c5e9532](https://github.com/ParabolInc/parabol/commit/c5e95325a15da3dcdb8759cbdfd3ff481c1baabc))


### Fixed

* keep page search working when embeddings are slow ([#13776](https://github.com/ParabolInc/parabol/issues/13776)) ([df5b3f3](https://github.com/ParabolInc/parabol/commit/df5b3f347378206b123caeff1f2fd6df42b1a828))

## [15.7.4](https://github.com/ParabolInc/parabol/compare/v15.7.3...v15.7.4) (2026-10-28)


### Fixed

* match Zoom transcripts to the host's meeting on any of their teams ([#13777](https://github.com/ParabolInc/parabol/issues/13777)) ([4f4d1ce](https://github.com/ParabolInc/parabol/commit/4f4d1cec54736a55cb463cbdec466c020f56b0d4))


### Changed

* add a page search eval harness ([#13774](https://github.com/ParabolInc/parabol/issues/13774)) ([50b3714](https://github.com/ParabolInc/parabol/commit/50b3714ad9819aa53011f4a580644ad1b423ee69))

## [15.7.3](https://github.com/ParabolInc/parabol/compare/v15.7.2...v15.7.3) (2026-10-27)


### Fixed

* Pages and realtime editing security hardening ([#13760](https://github.com/ParabolInc/parabol/issues/13760)) ([dbf832c](https://github.com/ParabolInc/parabol/commit/dbf832c67df391efe9d7cffcc263160f007da469))

## [15.7.2](https://github.com/ParabolInc/parabol/compare/v15.7.1...v15.7.2) (2026-10-27)


### Fixed

* keep the meeting task board up when adding a task ([#13769](https://github.com/ParabolInc/parabol/issues/13769)) ([d35312c](https://github.com/ParabolInc/parabol/commit/d35312cd9e8ca024d68174317f4ec7c93bbad51f))
* redirect the facilitator to the summary page after ending a meeting ([#13768](https://github.com/ParabolInc/parabol/issues/13768)) ([4297846](https://github.com/ParabolInc/parabol/commit/42978469ecddd5e409c35d2f4609f4a74745f40d))


### Changed

* tune meeting template embedding text for search ([#13749](https://github.com/ParabolInc/parabol/issues/13749)) ([0491929](https://github.com/ParabolInc/parabol/commit/0491929ae1249a230337903e7684a94d48613bd0))

## [15.7.1](https://github.com/ParabolInc/parabol/compare/v15.7.0...v15.7.1) (2026-10-27)


### Fixed

* keep old Azure DevOps work items out of the standup date window ([#13758](https://github.com/ParabolInc/parabol/issues/13758)) ([def562f](https://github.com/ParabolInc/parabol/commit/def562f72c0c99a337fe91781614f9ca35a9fc31))

## [15.7.0](https://github.com/ParabolInc/parabol/compare/v15.6.0...v15.7.0) (2026-10-26)


### Added

* AI summary and sentiment for each Team Health category ([#13738](https://github.com/ParabolInc/parabol/issues/13738)) ([dad789c](https://github.com/ParabolInc/parabol/commit/dad789c890ffa4952c988b8e691573af9de5441c))


### Fixed

* keep Activity Library keyword matches from being clobbered by semantic search ([#13746](https://github.com/ParabolInc/parabol/issues/13746)) ([d5a05db](https://github.com/ParabolInc/parabol/commit/d5a05db6c2418ef184e887142557d23eccbd17dd))
* keep non-latin1 WebSocket upgrade headers from crashing the server ([#13755](https://github.com/ParabolInc/parabol/issues/13755)) ([41f1159](https://github.com/ParabolInc/parabol/commit/41f11596c41f0cb73fed69285f131a035f14cd3d))
* shorter placeholder ([#13735](https://github.com/ParabolInc/parabol/issues/13735)) ([ccc7750](https://github.com/ParabolInc/parabol/commit/ccc77505f65d3ed6166e1b5cdf5403a963e5c139))


### Changed

* **ci:** reuse a webpack cache between test runs ([#13739](https://github.com/ParabolInc/parabol/issues/13739)) ([6176dd0](https://github.com/ParabolInc/parabol/commit/6176dd05c19e0d7268d55d2547874b607f532acc))

## [15.6.0](https://github.com/ParabolInc/parabol/compare/v15.5.2...v15.6.0) (2026-10-22)


### Added

* per-address results for team email invitations ([#13733](https://github.com/ParabolInc/parabol/issues/13733)) ([29edf67](https://github.com/ParabolInc/parabol/commit/29edf677a0dacabc9ec2e0eed3d4541fb3a2b29b))


### Fixed

* document UWS_HTTP_MAX_HEADERS_SIZE and default it to 8KB ([#13732](https://github.com/ParabolInc/parabol/issues/13732)) ([574daaf](https://github.com/ParabolInc/parabol/commit/574daaf72e4fa28b3c30815b678657ed1a975076))

## [15.5.2](https://github.com/ParabolInc/parabol/compare/v15.5.1...v15.5.2) (2026-10-22)


### Fixed

* clearer approved-domain error and no personal org for invited SSO users ([#13728](https://github.com/ParabolInc/parabol/issues/13728)) ([a6f11b8](https://github.com/ParabolInc/parabol/commit/a6f11b867696531430ddb56571108712cfa800d6))

## [15.5.1](https://github.com/ParabolInc/parabol/compare/v15.5.0...v15.5.1) (2026-10-21)


### Fixed

* fit the org Teams table on phones ([#13714](https://github.com/ParabolInc/parabol/issues/13714)) ([4972a73](https://github.com/ParabolInc/parabol/commit/4972a73cd19e895292ff8bebaaf88c676306f45b))
* stop nesting a &lt;td&gt; inside a &lt;td&gt; in org team rows ([#13712](https://github.com/ParabolInc/parabol/issues/13712)) ([f471fbe](https://github.com/ParabolInc/parabol/commit/f471fbe5683607544f0e3aedeb035318ec45e2d7))
* tag PAT requests in Datadog and test lastUsedAt ([#13680](https://github.com/ParabolInc/parabol/issues/13680)) ([f655d95](https://github.com/ParabolInc/parabol/commit/f655d9517a17267269a591e1b4fe96f3e81670af))

## [15.5.0](https://github.com/ParabolInc/parabol/compare/v15.4.0...v15.5.0) (2026-10-20)


### Added

* count active users over time & require attendance for active teams ([#13661](https://github.com/ParabolInc/parabol/issues/13661)) ([0d86f81](https://github.com/ParabolInc/parabol/commit/0d86f818a928f92d5a05aa909cd5372ffdd06fcf))


### Fixed

* keep blocked fetch destinations out of Datadog Error Tracking ([#13664](https://github.com/ParabolInc/parabol/issues/13664)) ([7f731d0](https://github.com/ParabolInc/parabol/commit/7f731d00d06a452acab50810b51c322c319d160f))
* let a team's recurring series start on the same tick ([#13674](https://github.com/ParabolInc/parabol/issues/13674)) ([e668811](https://github.com/ParabolInc/parabol/commit/e668811b7ff8bca0afff6ed12fc7739371d87128))


### Changed

* remove the dead inactivateUser mutation ([#13659](https://github.com/ParabolInc/parabol/issues/13659)) ([a941477](https://github.com/ParabolInc/parabol/commit/a94147770cfac07ff3df32b2db3ea012a7fae58e))

## [15.4.0](https://github.com/ParabolInc/parabol/compare/v15.3.0...v15.4.0) (2026-10-13)


### Added

* rebuild the Azure DevOps integration with per-project access ([#13618](https://github.com/ParabolInc/parabol/issues/13618)) ([c208d87](https://github.com/ParabolInc/parabol/commit/c208d87f3d9038efcc18739e29a6e98fd7d2eba3))


### Fixed

* give repo-list refresh pushes a dataloader ([#13652](https://github.com/ParabolInc/parabol/issues/13652)) ([2c690da](https://github.com/ParabolInc/parabol/commit/2c690da012636c1ffbae6142f6fb088b97161f8f))


### Changed

* Google Calendar joins the integration registry ([#13617](https://github.com/ParabolInc/parabol/issues/13617)) ([8d50ee4](https://github.com/ParabolInc/parabol/commit/8d50ee4573e137d423686130df1107873eb25a3f))

## [15.3.0](https://github.com/ParabolInc/parabol/compare/v15.2.5...v15.3.0) (2026-10-09)


### Added

* redesign the org billing plan cards ([#13644](https://github.com/ParabolInc/parabol/issues/13644)) ([26153b5](https://github.com/ParabolInc/parabol/commit/26153b51a93431ccd727a5aec1336565069856b2))

## [15.2.5](https://github.com/ParabolInc/parabol/compare/v15.2.4...v15.2.5) (2026-10-08)


### Changed

* **ci:** remove host networking from the release image build ([#13639](https://github.com/ParabolInc/parabol/issues/13639)) ([d941f6c](https://github.com/ParabolInc/parabol/commit/d941f6c33b7129d980927ef97f82f61918980fcc))

## [15.2.4](https://github.com/ParabolInc/parabol/compare/v15.2.3...v15.2.4) (2026-10-08)


### Fixed

* keep issue chip styling in standup responses ([#13638](https://github.com/ParabolInc/parabol/issues/13638)) ([372c88e](https://github.com/ParabolInc/parabol/commit/372c88ee517f94cd6b80466de9a68ca076aa4e38))
* wrap long URLs in the standup discussion drawer header ([#13636](https://github.com/ParabolInc/parabol/issues/13636)) ([ba4c3c9](https://github.com/ParabolInc/parabol/commit/ba4c3c97f12007d0fd686a087a33b15826422831))


### Changed

* **build:** skip type generation in release builds ([#13641](https://github.com/ParabolInc/parabol/issues/13641)) ([59380b9](https://github.com/ParabolInc/parabol/commit/59380b9cdaf0ee3700fa5efcd779da9946ec51ca))
* shorten issue and PR templates ([#13640](https://github.com/ParabolInc/parabol/issues/13640)) ([7813bf7](https://github.com/ParabolInc/parabol/commit/7813bf74cc874fdf995c60c1b18f085a3db16abf))

## [15.2.3](https://github.com/ParabolInc/parabol/compare/v15.2.2...v15.2.3) (2026-10-08)


### Fixed

* show only the current and last 3 invoices on org billing ([#13632](https://github.com/ParabolInc/parabol/issues/13632)) ([a4b2df7](https://github.com/ParabolInc/parabol/commit/a4b2df76e925429be37e81fc233f14fd99a78342))


### Changed

* remove dataCy attributes ([#13634](https://github.com/ParabolInc/parabol/issues/13634)) ([dafc7bc](https://github.com/ParabolInc/parabol/commit/dafc7bc2b1186831e042f2d9d9f494f2ac06c798))

## [15.2.2](https://github.com/ParabolInc/parabol/compare/v15.2.1...v15.2.2) (2026-10-08)


### Fixed

* add billing leader button does nothing ([#13628](https://github.com/ParabolInc/parabol/issues/13628)) ([ff3c97a](https://github.com/ParabolInc/parabol/commit/ff3c97aac8be045226920399295d4cd42e1ea998))


### Changed

* remove websocket connect and disconnect analytics events ([#13626](https://github.com/ParabolInc/parabol/issues/13626)) ([bd6d8f5](https://github.com/ParabolInc/parabol/commit/bd6d8f59435cf7eac9cae5caee3adb0498aabfe2))

## [15.2.1](https://github.com/ParabolInc/parabol/compare/v15.2.0...v15.2.1) (2026-10-08)


### Fixed

* rewrite the service worker, precache 3.6MB instead of 37MB ([#13613](https://github.com/ParabolInc/parabol/issues/13613)) ([cc97211](https://github.com/ParabolInc/parabol/commit/cc9721150e778e1c2fa5aa516fec523ccd8d3bac))


### Changed

* faster dev stack on rspack, without pm2 ([#13615](https://github.com/ParabolInc/parabol/issues/13615)) ([27793f3](https://github.com/ParabolInc/parabol/commit/27793f368da699b75398126545af5071a1094974))

## [15.2.0](https://github.com/ParabolInc/parabol/compare/v15.1.1...v15.2.0) (2026-10-08)


### Added

* redesign the TipTap link popup ([#13611](https://github.com/ParabolInc/parabol/issues/13611)) ([c589841](https://github.com/ParabolInc/parabol/commit/c5898416cdbd3d65f56e91f6251886452d72ac96))
* restyle page databases and fix their menu and tag picker bugs ([#13612](https://github.com/ParabolInc/parabol/issues/13612)) ([778c1e9](https://github.com/ParabolInc/parabol/commit/778c1e99b119e4e21fc9d50db94a595ff63801f9))

## [15.1.1](https://github.com/ParabolInc/parabol/compare/v15.1.0...v15.1.1) (2026-10-08)


### Changed

* build with swc, ship a minified client and cut the first load ([#13607](https://github.com/ParabolInc/parabol/issues/13607)) ([1db4da6](https://github.com/ParabolInc/parabol/commit/1db4da6b199921c5b8ea618762c237ad25f7f778))

## [15.1.0](https://github.com/ParabolInc/parabol/compare/v15.0.0...v15.1.0) (2026-10-07)


### Added

* cleaner titles and bodies for issues created from tasks ([#13600](https://github.com/ParabolInc/parabol/issues/13600)) ([75180e1](https://github.com/ParabolInc/parabol/commit/75180e1e170701123bea6154eefbf03917f535b8))
* new icebreakers, remove dupes ([#13596](https://github.com/ParabolInc/parabol/issues/13596)) ([54f2b42](https://github.com/ParabolInc/parabol/commit/54f2b42b761463e087a6da805d899f1e1118969f))
* suggest retro groups with AI by default ([#13587](https://github.com/ParabolInc/parabol/issues/13587)) ([146ee0b](https://github.com/ParabolInc/parabol/commit/146ee0b384de6f494e8305420321f4044ab3419c))


### Fixed

* notification toasts read fields from aliased fragments ([#13606](https://github.com/ParabolInc/parabol/issues/13606)) ([5df4f4a](https://github.com/ParabolInc/parabol/commit/5df4f4a0b61a9758d360b44fbceab59f79fa9d57))


### Changed

* one generic scoping panel for poker integrations ([#13524](https://github.com/ParabolInc/parabol/issues/13524)) ([fd8a63b](https://github.com/ParabolInc/parabol/commit/fd8a63b31618543c39e496590d0a67fe4147a3c8))

## [15.0.0](https://github.com/ParabolInc/parabol/compare/v14.4.0...v15.0.0) (2026-10-07)


### ⚠ BREAKING CHANGES

* Go distroless for a base image ([#13601](https://github.com/ParabolInc/parabol/issues/13601))

### Added

* Go distroless for a base image ([#13601](https://github.com/ParabolInc/parabol/issues/13601)) ([400c702](https://github.com/ParabolInc/parabol/commit/400c702ce5647a22eaf45328ee1af9d5bc5f13fc))

## [14.4.0](https://github.com/ParabolInc/parabol/compare/v14.3.4...v14.4.0) (2026-10-07)


### Added

* six new retro templates ([#13588](https://github.com/ParabolInc/parabol/issues/13588)) ([00dcecc](https://github.com/ParabolInc/parabol/commit/00dceccc83e51b796347d5cc182dbbdf1217f096))


### Fixed

* file uploads after the graphql-yoga bump ([#13599](https://github.com/ParabolInc/parabol/issues/13599)) ([48c81a7](https://github.com/ParabolInc/parabol/commit/48c81a7e7f7ea65cd1df8d8644020a5d6c6d0585))

## [14.3.4](https://github.com/ParabolInc/parabol/compare/v14.3.3...v14.3.4) (2026-10-06)


### Fixed

* bump graphql-yoga so @include/[@skip](https://github.com/skip) variables resolve ([#13594](https://github.com/ParabolInc/parabol/issues/13594)) ([5135ada](https://github.com/ParabolInc/parabol/commit/5135ada350021e2749e03b37f99755cbc4b8ca88))
* release PR only lists commits since the last production release ([#13592](https://github.com/ParabolInc/parabol/issues/13592)) ([b9497ca](https://github.com/ParabolInc/parabol/commit/b9497ca0aa19397cd056f2a04b357101e4cd4bdd))


### Changed

* run server tests in parallel and skip bcrypt cost in test signups ([#13591](https://github.com/ParabolInc/parabol/issues/13591)) ([f2a4293](https://github.com/ParabolInc/parabol/commit/f2a429383dfa1f9663d46fd40447b6816f5da417))

## [14.3.3](https://github.com/ParabolInc/parabol/compare/v14.3.2...v14.3.3) (2026-10-06)


### Fixed

* bump node, prepare for distroless ([#13581](https://github.com/ParabolInc/parabol/issues/13581)) ([edeef06](https://github.com/ParabolInc/parabol/commit/edeef06a23e645cf74552d491bed16930259e0d2))

## [14.3.2](https://github.com/ParabolInc/parabol/compare/v14.3.1...v14.3.2) (2026-10-06)


### Fixed

* standup character count crash on destroyed editor ([#13584](https://github.com/ParabolInc/parabol/issues/13584)) ([bebe317](https://github.com/ParabolInc/parabol/commit/bebe3178b9fa6842bfb48e52cea4a3648b0bee70))

## [14.3.1](https://github.com/ParabolInc/parabol/compare/v14.3.0...v14.3.1) (2026-10-06)


### Fixed

* bump deps like nodemailer ([#13573](https://github.com/ParabolInc/parabol/issues/13573)) ([1447c7c](https://github.com/ParabolInc/parabol/commit/1447c7c0e4d23d494bf9fbc96dc10e72aa7d3a40))
* Jira scoping crash when the Atlassian integration is null ([#13580](https://github.com/ParabolInc/parabol/issues/13580)) ([e2b3fa3](https://github.com/ParabolInc/parabol/commit/e2b3fa3fb2658bccb650ea8992fc371c2d63bfc0))
* Plex used for avatars ([#13579](https://github.com/ParabolInc/parabol/issues/13579)) ([cba8e38](https://github.com/ParabolInc/parabol/commit/cba8e389299262b8295d3df7e0f2ce37c6428c29))
* standup char count, link to slack integration, discussion ([#13582](https://github.com/ParabolInc/parabol/issues/13582)) ([ddb80f9](https://github.com/ParabolInc/parabol/commit/ddb80f9d55476f23664c7425f0ed19dbd1df5157))
* validate providerId ([#13549](https://github.com/ParabolInc/parabol/issues/13549)) ([5bc31f9](https://github.com/ParabolInc/parabol/commit/5bc31f924297739a82f7e12541e3fb060bda7f63))

## [14.3.0](https://github.com/ParabolInc/parabol/compare/v14.2.0...v14.3.0) (2026-10-06)


### Added

* standup templates ([#13570](https://github.com/ParabolInc/parabol/issues/13570)) ([40bba79](https://github.com/ParabolInc/parabol/commit/40bba790cf7eb11c7dcd833c355bd3f27ff6d5fc))

## [14.2.0](https://github.com/ParabolInc/parabol/compare/v14.1.0...v14.2.0) (2026-10-02)


### Added

* supprt multiple identity providers per org ([#13561](https://github.com/ParabolInc/parabol/issues/13561)) ([8961590](https://github.com/ParabolInc/parabol/commit/8961590976b8026613ec84fe0a1c2c51c7f4fade))


### Fixed

* add hover fill to the reactji chip ([#13560](https://github.com/ParabolInc/parabol/issues/13560)) ([ae85b36](https://github.com/ParabolInc/parabol/commit/ae85b367d4530d7d105b9e28b2ba3af3d5955962))
* atlassian dark mode icon updates ([#13558](https://github.com/ParabolInc/parabol/issues/13558)) ([5581fba](https://github.com/ParabolInc/parabol/commit/5581fba3695a85a5bb25b00cddba302dd2430621))

## [14.1.0](https://github.com/ParabolInc/parabol/compare/v14.0.1...v14.1.0) (2026-09-28)


### Added

* template illustrations ([#13552](https://github.com/ParabolInc/parabol/issues/13552)) ([d0001fd](https://github.com/ParabolInc/parabol/commit/d0001fd8368f18130d1a30647e772f7073cdd160))

## [14.0.1](https://github.com/ParabolInc/parabol/compare/v14.0.0...v14.0.1) (2026-09-23)


### Fixed

* add team health to marketing ([#13547](https://github.com/ParabolInc/parabol/issues/13547)) ([0c4e54f](https://github.com/ParabolInc/parabol/commit/0c4e54f73adadab564279c6aad0bbb6aa031d3e1))

## [14.0.0](https://github.com/ParabolInc/parabol/compare/v13.48.0...v14.0.0) (2026-09-22)


### ⚠ BREAKING CHANGES

* Team Health ([#13545](https://github.com/ParabolInc/parabol/issues/13545))

### Added

* Team Health ([#13545](https://github.com/ParabolInc/parabol/issues/13545)) ([80234ae](https://github.com/ParabolInc/parabol/commit/80234aeb0749a885fffac1cdc8a9d5c3988cfc3d))


### Fixed

* bump luna ([#13543](https://github.com/ParabolInc/parabol/issues/13543)) ([049918e](https://github.com/ParabolInc/parabol/commit/049918e2ee3f60e23f6ebf65eeccbfa94555cc82))

## [13.48.0](https://github.com/ParabolInc/parabol/compare/v13.47.0...v13.48.0) (2026-09-22)


### Added

* Demo Meeting Card ([#13538](https://github.com/ParabolInc/parabol/issues/13538)) ([8be988e](https://github.com/ParabolInc/parabol/commit/8be988e59dc1dee69bf814d594c98b583c79f57b))
* Team Health Demo ([#13535](https://github.com/ParabolInc/parabol/issues/13535)) ([91fe359](https://github.com/ParabolInc/parabol/commit/91fe3599201b81e526ff003e18df2e529bffdd7f))


### Fixed

* add respondent userIds above 3 ([#13540](https://github.com/ParabolInc/parabol/issues/13540)) ([c05c414](https://github.com/ParabolInc/parabol/commit/c05c414167904619e831e4df12237321da575eb3))
* bump pnpm ([#13541](https://github.com/ParabolInc/parabol/issues/13541)) ([31e85ce](https://github.com/ParabolInc/parabol/commit/31e85ce6ccbf38d532105c3b798414198c818613))
* reveal results for facilitator ([#13539](https://github.com/ParabolInc/parabol/issues/13539)) ([ee74699](https://github.com/ParabolInc/parabol/commit/ee746994525618fec8711c38155b529c60bcd3c5))

## [13.47.0](https://github.com/ParabolInc/parabol/compare/v13.46.1...v13.47.0) (2026-09-21)


### Added

* Team health first meeting preview ([#13526](https://github.com/ParabolInc/parabol/issues/13526)) ([7b21656](https://github.com/ParabolInc/parabol/commit/7b2165622c3e743fe7060e0bd82a9ede549fe0c6))

## [13.46.1](https://github.com/ParabolInc/parabol/compare/v13.46.0...v13.46.1) (2026-09-18)


### Fixed

* mobile view, no changing scope, highlight edit button on click ([#13522](https://github.com/ParabolInc/parabol/issues/13522)) ([f3a15ee](https://github.com/ParabolInc/parabol/commit/f3a15eeadd3f45ce261fe5bef2e78bf4c8117d58))


### Changed

* delete deprecated per-service dimension field mutations ([#13521](https://github.com/ParabolInc/parabol/issues/13521)) ([2d0ccea](https://github.com/ParabolInc/parabol/commit/2d0ccead56a48698a418b4b167fd003b8048eb51))

## [13.46.0](https://github.com/ParabolInc/parabol/compare/v13.45.2...v13.46.0) (2026-09-18)


### Added

* Add trendline to animation ([#13519](https://github.com/ParabolInc/parabol/issues/13519)) ([e069d0e](https://github.com/ParabolInc/parabol/commit/e069d0ef2e4ba4dbf2b20d8cf5ebbd7d0dc0311e))
* explain the team health question draw in the template editor ([#13516](https://github.com/ParabolInc/parabol/issues/13516)) ([1299aa9](https://github.com/ParabolInc/parabol/commit/1299aa9e87806aa293923885f62495884ba09992))


### Changed

* generic ProviderList host for task integrations (WIP) ([#13476](https://github.com/ParabolInc/parabol/issues/13476)) ([c29b543](https://github.com/ParabolInc/parabol/commit/c29b543755f9b2fa03485de61aa5c40d8d3fe5cc))

## [13.45.2](https://github.com/ParabolInc/parabol/compare/v13.45.1...v13.45.2) (2026-09-17)


### Fixed

* change template type in search results for team health ([#13510](https://github.com/ParabolInc/parabol/issues/13510)) ([0094ea3](https://github.com/ParabolInc/parabol/commit/0094ea341217e691766c6316ea0644290ad97b41))
* TaskCard padding ([#13515](https://github.com/ParabolInc/parabol/issues/13515)) ([5360f22](https://github.com/ParabolInc/parabol/commit/5360f22ed8cf158c7b2368c3ce4b64d8ae29d479))
* team menu selector ([#13514](https://github.com/ParabolInc/parabol/issues/13514)) ([c86a187](https://github.com/ParabolInc/parabol/commit/c86a187296a3f9ff1f7682a1bfba12812e8ae19a))

## [13.45.1](https://github.com/ParabolInc/parabol/compare/v13.45.0...v13.45.1) (2026-09-16)


### Fixed

* cleanup unused files in repo ([#13495](https://github.com/ParabolInc/parabol/issues/13495)) ([1d92d1b](https://github.com/ParabolInc/parabol/commit/1d92d1b91fecdd1ad242606dd2d4dad073351524))
* Relay alias ambiguous fragments ([#13391](https://github.com/ParabolInc/parabol/issues/13391)) ([5c7b9b3](https://github.com/ParabolInc/parabol/commit/5c7b9b3d96843b0cb7c3781df49aeb6991b95b9f))
* Team Health Activity Library tooltips and new activity ([#13508](https://github.com/ParabolInc/parabol/issues/13508)) ([07eb0b6](https://github.com/ParabolInc/parabol/commit/07eb0b6a41ff64577acfc0b7ac76d595022c13c8))
* vuln bumps ([#13507](https://github.com/ParabolInc/parabol/issues/13507)) ([7341da5](https://github.com/ParabolInc/parabol/commit/7341da573c4951402610d54fa7d83e26b15f5a89))

## [13.45.0](https://github.com/ParabolInc/parabol/compare/v13.44.0...v13.45.0) (2026-09-15)


### Added

* Support starting next meeting in series immediately ([#13490](https://github.com/ParabolInc/parabol/issues/13490)) ([19c780a](https://github.com/ParabolInc/parabol/commit/19c780a6d29830f675c4448739c5d8f95ffcabc4))


### Fixed

* integrations client host generalization ([#13460](https://github.com/ParabolInc/parabol/issues/13460)) ([3224715](https://github.com/ParabolInc/parabol/commit/3224715bf852c1a6b4343a66f299c82ed4013f82))

## [13.44.0](https://github.com/ParabolInc/parabol/compare/v13.43.0...v13.44.0) (2026-09-14)


### Added

* add notifications for team health meetings ([#13485](https://github.com/ParabolInc/parabol/issues/13485)) ([6a022c3](https://github.com/ParabolInc/parabol/commit/6a022c30b9c13563f79853d8452ce49b14311297))

## [13.43.0](https://github.com/ParabolInc/parabol/compare/v13.42.1...v13.43.0) (2026-09-10)


### Added

* add discussion to stages. add paraphrasing ([#13481](https://github.com/ParabolInc/parabol/issues/13481)) ([2f81f77](https://github.com/ParabolInc/parabol/commit/2f81f7725f0c3fc68abce2bd1b714e071782485e))
* convert results to per-category stages ([#13473](https://github.com/ParabolInc/parabol/issues/13473)) ([2a365ee](https://github.com/ParabolInc/parabol/commit/2a365eed6efa7a9577b3c62e5c247ce3178c25d7))


### Fixed

* support subscription push for updateMeetingTemplate ([#13469](https://github.com/ParabolInc/parabol/issues/13469)) ([fac95f6](https://github.com/ParabolInc/parabol/commit/fac95f6e92f2f4659569232702edb86a02cf9db5))
* Team Health admin when not on team ([#13482](https://github.com/ParabolInc/parabol/issues/13482)) ([ff2dc43](https://github.com/ParabolInc/parabol/commit/ff2dc4336dc86269868736b1d8c034b1cecd9c57))
* **theme:** adjust theme contrast and adds --shadow-bar-up ([#13474](https://github.com/ParabolInc/parabol/issues/13474)) ([04c87ad](https://github.com/ParabolInc/parabol/commit/04c87adc586187b9864bca9529fab375febc2079))


### Changed

* upgrade tiptap + xmldom ([#13468](https://github.com/ParabolInc/parabol/issues/13468)) ([d3d6394](https://github.com/ParabolInc/parabol/commit/d3d6394e97e0242a101989f11a09435910c9b4c4))

## [13.42.1](https://github.com/ParabolInc/parabol/compare/v13.42.0...v13.42.1) (2026-09-04)


### Fixed

* remove usePortal everywhere except useMenu, also ReflectionEmbeddingSuccess ([#13459](https://github.com/ParabolInc/parabol/issues/13459)) ([66624ac](https://github.com/ParabolInc/parabol/commit/66624ac46455a782ac44497161b4be78e8e40981))

## [13.42.0](https://github.com/ParabolInc/parabol/compare/v13.41.0...v13.42.0) (2026-09-03)


### Added

* multi team Meeting Series card ([#13456](https://github.com/ParabolInc/parabol/issues/13456)) ([52119f5](https://github.com/ParabolInc/parabol/commit/52119f57a80f692640cd524c43b417f488c3835d))


### Fixed

* hide Next button for participants if next stage isn't navigable ([#13462](https://github.com/ParabolInc/parabol/issues/13462)) ([5067b9a](https://github.com/ParabolInc/parabol/commit/5067b9a915395508a2c596dac8efa33e2b92388c))
* replace useTooltip with radix-ui ([#13458](https://github.com/ParabolInc/parabol/issues/13458)) ([4d990c7](https://github.com/ParabolInc/parabol/commit/4d990c79df6b2f83fa009d55eb4fee5240738691))


### Changed

* continue consolidating integration schema ([#13438](https://github.com/ParabolInc/parabol/issues/13438)) ([e542bdc](https://github.com/ParabolInc/parabol/commit/e542bdc32944d318bdbaf1a47a0d06c59c589507))

## [13.41.0](https://github.com/ParabolInc/parabol/compare/v13.40.0...v13.41.0) (2026-09-02)


### Added

* meeting series: support admin for teams the owner is not on ([#13443](https://github.com/ParabolInc/parabol/issues/13443)) ([4f7eed5](https://github.com/ParabolInc/parabol/commit/4f7eed515462bbd7cb1a2fbc80854ff3f69a841a))


### Changed

* disable RUM completely ([#13448](https://github.com/ParabolInc/parabol/issues/13448)) ([cb4114c](https://github.com/ParabolInc/parabol/commit/cb4114c327b8c05fb78a31af12b8bda296b4723f))

## [13.40.0](https://github.com/ParabolInc/parabol/compare/v13.39.0...v13.40.0) (2026-09-01)


### Added

* table of contents block for Pages ([#13433](https://github.com/ParabolInc/parabol/issues/13433)) ([21310c9](https://github.com/ParabolInc/parabol/commit/21310c943c4c7161bce2961488c96878632da5f2))


### Fixed

* add entropy to server test dummy data ([#13444](https://github.com/ParabolInc/parabol/issues/13444)) ([159c9ae](https://github.com/ParabolInc/parabol/commit/159c9aeee60eb75f28c9032e9d8d02090ed5f63b))
* exclude test files from PR sizes ([#13445](https://github.com/ParabolInc/parabol/issues/13445)) ([ef4aca8](https://github.com/ParabolInc/parabol/commit/ef4aca8791de5b91f3ab69524ed84828fb1fbf62))
* reject updatePersonalAccessToken with no fields ([#13447](https://github.com/ParabolInc/parabol/issues/13447)) ([d307210](https://github.com/ParabolInc/parabol/commit/d3072103307c7441ec68181cbb224d84b1b176e5))
* support multiple insights blocks on a Page ([#12465](https://github.com/ParabolInc/parabol/issues/12465)) ([#13446](https://github.com/ParabolInc/parabol/issues/13446)) ([72e10fd](https://github.com/ParabolInc/parabol/commit/72e10fdc64bd56341157f847eecfa4302c2c7563))


### Changed

* collapse server task-integration dispatch onto the registry ([#13429](https://github.com/ParabolInc/parabol/issues/13429)) ([46a40af](https://github.com/ParabolInc/parabol/commit/46a40af690057ecb5aacd06011bec6708a10da41))

## [13.39.0](https://github.com/ParabolInc/parabol/compare/v13.38.2...v13.39.0) (2026-08-28)


### Added

* Facilitator rotation ([#13439](https://github.com/ParabolInc/parabol/issues/13439)) ([74e08d6](https://github.com/ParabolInc/parabol/commit/74e08d6c419c447dc3620b7774c7bf317d59e570))


### Fixed

* handle incremental payloads for websockets ([#13436](https://github.com/ParabolInc/parabol/issues/13436)) ([f4b516c](https://github.com/ParabolInc/parabol/commit/f4b516c3b4339eda3258011740646839274610e6))
* truncate long Page titles with ellipsis ([#13432](https://github.com/ParabolInc/parabol/issues/13432)) ([d6fcf18](https://github.com/ParabolInc/parabol/commit/d6fcf18e5efd1223cbb348e631bdd159b3e5ce2c))


### Changed

* move Jira + GitHub auth onto IntegrationProvider/TeamMemberInt… ([#13399](https://github.com/ParabolInc/parabol/issues/13399)) ([aaa903c](https://github.com/ParabolInc/parabol/commit/aaa903c776132a8810bf4350bd0c9c77d93970ec))

## [13.38.2](https://github.com/ParabolInc/parabol/compare/v13.38.1...v13.38.2) (2026-08-25)


### Fixed

* page kebab menu jumps when cursor leaves the nav row ([#13417](https://github.com/ParabolInc/parabol/issues/13417)) ([b054cc5](https://github.com/ParabolInc/parabol/commit/b054cc5855349387fc8471d5481eadd2961fb966))

## [13.38.1](https://github.com/ParabolInc/parabol/compare/v13.38.0...v13.38.1) (2026-08-25)


### Fixed

* limit codeQL to pushes to master ([#13406](https://github.com/ParabolInc/parabol/issues/13406)) ([691d347](https://github.com/ParabolInc/parabol/commit/691d347e83555c45ebe6549e37d06a3d4d552b0d))
* meeting left nav right padding issues ([#13412](https://github.com/ParabolInc/parabol/issues/13412)) ([516f233](https://github.com/ParabolInc/parabol/commit/516f23357d460d4e9bc037e337a0b3f93a964e9b))
* page kebab menu triggers full page reload ([#13414](https://github.com/ParabolInc/parabol/issues/13414)) ([ad7effa](https://github.com/ParabolInc/parabol/commit/ad7effa6211f47b301d7c3dcaa6fb4d71189ebeb))
* persistedquerynotfound error ([#13401](https://github.com/ParabolInc/parabol/issues/13401)) ([97968a7](https://github.com/ParabolInc/parabol/commit/97968a719d7aac1fc980bc08a2f253f8862f43bd))
* various style fixes ([#13415](https://github.com/ParabolInc/parabol/issues/13415)) ([4feb3bd](https://github.com/ParabolInc/parabol/commit/4feb3bdeec47fc5a3da70aa5b7482861c848d426))

## [13.38.0](https://github.com/ParabolInc/parabol/compare/v13.37.0...v13.38.0) (2026-08-25)


### Added

* decrease necessary scope for google meet transcripts ([#13394](https://github.com/ParabolInc/parabol/issues/13394)) ([50f61ae](https://github.com/ParabolInc/parabol/commit/50f61ae899f07bb03b9db27564526e6ab99ac53f))
* update AI model to luna ([#13403](https://github.com/ParabolInc/parabol/issues/13403)) ([97799d2](https://github.com/ParabolInc/parabol/commit/97799d2067846535ed6b4ffa6e5542549476d673))

## [13.37.0](https://github.com/ParabolInc/parabol/compare/v13.36.4...v13.37.0) (2026-08-21)


### Added

* decouple HubSpot from app; add BigQuery integration ([#13277](https://github.com/ParabolInc/parabol/issues/13277)) ([bac5eb6](https://github.com/ParabolInc/parabol/commit/bac5eb69534ff7c4787e6e8db528573d09b371f5))
* Zoom transcripts to GA ([#13397](https://github.com/ParabolInc/parabol/issues/13397)) ([04f9641](https://github.com/ParabolInc/parabol/commit/04f9641c87642fa31f807c947981a5707046e87c))


### Fixed

* bump relay to v21 ([#13388](https://github.com/ParabolInc/parabol/issues/13388)) ([5e3883b](https://github.com/ParabolInc/parabol/commit/5e3883b9f499036e96c9b860b3ff9dd513ca7690))
* height reflection in flight. autofocus editor. editor height ([#13396](https://github.com/ParabolInc/parabol/issues/13396)) ([d20c588](https://github.com/ParabolInc/parabol/commit/d20c5888a99e4113b4ee55e281efdc875a966466))


### Changed

* task titles and integrations capability query (integrations refactor part 2) ([#13372](https://github.com/ParabolInc/parabol/issues/13372)) ([a64e9c1](https://github.com/ParabolInc/parabol/commit/a64e9c1335c81d9c72dc329f39d99e7dd6b97fbc))

## [13.36.4](https://github.com/ParabolInc/parabol/compare/v13.36.3...v13.36.4) (2026-08-18)


### Fixed

* Activity Library card tooltip text invisible in light mode ([#13384](https://github.com/ParabolInc/parabol/issues/13384)) ([dfb5081](https://github.com/ParabolInc/parabol/commit/dfb50819b9bc1a85daffa424cc3b5711aefac4b1))

## [13.36.3](https://github.com/ParabolInc/parabol/compare/v13.36.2...v13.36.3) (2026-08-18)


### Fixed

* accept private Slack channels at install time ([#13379](https://github.com/ParabolInc/parabol/issues/13379)) ([2b41ab8](https://github.com/ParabolInc/parabol/commit/2b41ab824846a262b02d758e4dac64d8c478edbc))
* mailgun attachments, cid images inlined ([#13376](https://github.com/ParabolInc/parabol/issues/13376)) ([1c64aae](https://github.com/ParabolInc/parabol/commit/1c64aaeefe2b618d040845fdbad85bd8b802bc6d))
* mailgun plaintext version, attachments ([#13375](https://github.com/ParabolInc/parabol/issues/13375)) ([fe2180a](https://github.com/ParabolInc/parabol/commit/fe2180a167ee7adde8ad993a8f6c799cfe969a42))
* reveal votes styling ([#13373](https://github.com/ParabolInc/parabol/issues/13373)) ([b757e39](https://github.com/ParabolInc/parabol/commit/b757e3940aa53150835c903163ceb10f9830a8ef))


### Changed

* add integration platform contracts and registries ([#13359](https://github.com/ParabolInc/parabol/issues/13359)) ([d2619c7](https://github.com/ParabolInc/parabol/commit/d2619c7c8b0d03023197fbd874152ecd07877ae8))

## [13.36.2](https://github.com/ParabolInc/parabol/compare/v13.36.1...v13.36.2) (2026-08-13)


### Fixed

* per-migration transactions ([#13369](https://github.com/ParabolInc/parabol/issues/13369)) ([7be3299](https://github.com/ParabolInc/parabol/commit/7be3299bfd39ee22525508d026eda68b0895fcf8))

## [13.36.1](https://github.com/ParabolInc/parabol/compare/v13.36.0...v13.36.1) (2026-08-13)


### Fixed

* chunk meeting settings inserts in migration ([#13366](https://github.com/ParabolInc/parabol/issues/13366)) ([8b134fb](https://github.com/ParabolInc/parabol/commit/8b134fbadef5bad0196dba0c1eb318915481d57b))

## [13.36.0](https://github.com/ParabolInc/parabol/compare/v13.35.0...v13.36.0) (2026-08-13)


### Added

* support AWS S3 IRSA ([#13365](https://github.com/ParabolInc/parabol/issues/13365)) ([9326547](https://github.com/ParabolInc/parabol/commit/93265478cf8eb556b8798d32edf4bf422395a7b3))


### Fixed

* vuln bumps ([#13362](https://github.com/ParabolInc/parabol/issues/13362)) ([746c27f](https://github.com/ParabolInc/parabol/commit/746c27f38a628596f32affac6213c79a7a1dfad5))

## [13.35.0](https://github.com/ParabolInc/parabol/compare/v13.34.1...v13.35.0) (2026-08-11)


### Added

* confluence integration (behind feature flag) ([#13322](https://github.com/ParabolInc/parabol/issues/13322)) ([9e31acd](https://github.com/ParabolInc/parabol/commit/9e31acd54754985b016fbbabca154470b38101e6))


### Fixed

* bump node to v24.19.0 ([#13360](https://github.com/ParabolInc/parabol/issues/13360)) ([6b9f536](https://github.com/ParabolInc/parabol/commit/6b9f53660dea3aedc3cf1042218b8cd43e2a5f61))

## [13.34.1](https://github.com/ParabolInc/parabol/compare/v13.34.0...v13.34.1) (2026-08-06)


### Changed

* no more emotion ([#13352](https://github.com/ParabolInc/parabol/issues/13352)) ([787d3c3](https://github.com/ParabolInc/parabol/commit/787d3c3138bbbb629f0d38bc55fab18eae4b42ed))

## [13.34.0](https://github.com/ParabolInc/parabol/compare/v13.33.0...v13.34.0) (2026-08-05)


### Added

* enable Task Review phase by default ([#13350](https://github.com/ParabolInc/parabol/issues/13350)) ([37d3e45](https://github.com/ParabolInc/parabol/commit/37d3e45851a0f88353143cf02f6fb9761869930b))
* Team Health Template Editing ([#13292](https://github.com/ParabolInc/parabol/issues/13292)) ([f35c9f1](https://github.com/ParabolInc/parabol/commit/f35c9f1b43c88e9dba51380197f1dbcecf304158))

## [13.33.0](https://github.com/ParabolInc/parabol/compare/v13.32.0...v13.33.0) (2026-08-04)


### Added

* remove suggestions, show suggestable without hover ([#13346](https://github.com/ParabolInc/parabol/issues/13346)) ([45b4d2e](https://github.com/ParabolInc/parabol/commit/45b4d2edcdb674581bd04b7ded8cba82b255b0a4))

## [13.32.0](https://github.com/ParabolInc/parabol/compare/v13.31.6...v13.32.0) (2026-08-03)


### Added

* Suggested Grouping ([#13332](https://github.com/ParabolInc/parabol/issues/13332)) ([4040f90](https://github.com/ParabolInc/parabol/commit/4040f900d2455d4df379f2034ccfdd74e002ee32))


### Fixed

* debug, dont warn, on blocked private IPs ([#13337](https://github.com/ParabolInc/parabol/issues/13337)) ([c81037c](https://github.com/ParabolInc/parabol/commit/c81037cedeae8781b80084640fed3b4b0ff53d9d))

## [13.31.6](https://github.com/ParabolInc/parabol/compare/v13.31.5...v13.31.6) (2026-07-31)


### Fixed

* refactor fetchUntrusted. support allowlist of private IPs ([#13330](https://github.com/ParabolInc/parabol/issues/13330)) ([56a9909](https://github.com/ParabolInc/parabol/commit/56a9909b30aefc06b2f801cc071c9b2b727f3a05))
* remove ICS endpoint ([#13326](https://github.com/ParabolInc/parabol/issues/13326)) ([4dc254e](https://github.com/ParabolInc/parabol/commit/4dc254e2a688c0f93fb6acc2fe3bd100132bdc53))

## [13.31.5](https://github.com/ParabolInc/parabol/compare/v13.31.4...v13.31.5) (2026-07-28)


### Fixed

* correct profile URL typo in llms.txt ([#13319](https://github.com/ParabolInc/parabol/issues/13319)) ([184f571](https://github.com/ParabolInc/parabol/commit/184f571ef5c724bcb840061afb433b08205e1f35))
* LeftNav selection, summary task style improvements ([#13324](https://github.com/ParabolInc/parabol/issues/13324)) ([28c55c0](https://github.com/ParabolInc/parabol/commit/28c55c002afb0d7d5b6a8386a03e36eae34eade3))

## [13.31.4](https://github.com/ParabolInc/parabol/compare/v13.31.3...v13.31.4) (2026-07-27)


### Fixed

* dangling team members from org member change ([#13316](https://github.com/ParabolInc/parabol/issues/13316)) ([9a68d64](https://github.com/ParabolInc/parabol/commit/9a68d646ac1e8b4f6a6871e53088d3f1536d0400))

## [13.31.3](https://github.com/ParabolInc/parabol/compare/v13.31.2...v13.31.3) (2026-07-24)


### Fixed

* bump nodejs to v24.17.0 ([#13301](https://github.com/ParabolInc/parabol/issues/13301)) ([f64aa03](https://github.com/ParabolInc/parabol/commit/f64aa03990c36197abd5de2360238e6f4a96a954))
* Dark mode touchups ([#13312](https://github.com/ParabolInc/parabol/issues/13312)) ([bf01ecd](https://github.com/ParabolInc/parabol/commit/bf01ecdbcca41f4ff89d91ca476756c54cf7f93c))
* race condition for re-joining an org ([#13314](https://github.com/ParabolInc/parabol/issues/13314)) ([fb2a1d2](https://github.com/ParabolInc/parabol/commit/fb2a1d24d23f91686b23e7870c021ffd9f6445b7))

## [13.31.2](https://github.com/ParabolInc/parabol/compare/v13.31.1...v13.31.2) (2026-07-23)


### Fixed

* Dark Mode touchups ([#13308](https://github.com/ParabolInc/parabol/issues/13308)) ([fa9240b](https://github.com/ParabolInc/parabol/commit/fa9240b7215c48c5849e5ecce212c6348b7e6202))

## [13.31.1](https://github.com/ParabolInc/parabol/compare/v13.31.0...v13.31.1) (2026-07-21)


### Fixed

* pre-prod darkMode fix ups ([#13305](https://github.com/ParabolInc/parabol/issues/13305)) ([ae7657f](https://github.com/ParabolInc/parabol/commit/ae7657f0d2529bdc0aba6f977db5cac525dc768c))

## [13.31.0](https://github.com/ParabolInc/parabol/compare/v13.30.0...v13.31.0) (2026-07-21)


### Added

* darkMode pre-login LightIsland, fix ups ([#13300](https://github.com/ParabolInc/parabol/issues/13300)) ([2f40910](https://github.com/ParabolInc/parabol/commit/2f40910415a596e0673da11c8226d046f1c1dafe))


### Fixed

* security deps bump ([#13298](https://github.com/ParabolInc/parabol/issues/13298)) ([e43371c](https://github.com/ParabolInc/parabol/commit/e43371cbacd0bb25553bf4e55a182a913620cee0))

## [13.30.0](https://github.com/ParabolInc/parabol/compare/v13.29.2...v13.30.0) (2026-07-21)


### Added

* dark mode (draft) ([#13285](https://github.com/ParabolInc/parabol/issues/13285)) ([dc503d7](https://github.com/ParabolInc/parabol/commit/dc503d7213caec9615e82fe9886d9f6cebe54f35))

## [13.29.2](https://github.com/ParabolInc/parabol/compare/v13.29.1...v13.29.2) (2026-07-17)


### Fixed

* check for org before destructure ([#13290](https://github.com/ParabolInc/parabol/issues/13290)) ([c563016](https://github.com/ParabolInc/parabol/commit/c563016a51acd809f10217af07bfe8fee8f854bc))
* Pages TODO style regression ([#13286](https://github.com/ParabolInc/parabol/issues/13286)) ([5ab8691](https://github.com/ParabolInc/parabol/commit/5ab86917d163c8b61e6d9fb572dc84980d3cea46))


### Changed

* split SMTP emails into batches ([#13284](https://github.com/ParabolInc/parabol/issues/13284)) ([66f1a30](https://github.com/ParabolInc/parabol/commit/66f1a30bff62f26bf4a8d2f6f40ef203bd80cbf4))

## [13.29.1](https://github.com/ParabolInc/parabol/compare/v13.29.0...v13.29.1) (2026-07-10)


### Fixed

* fetch discuss phase on navigate to discuss phase ([#13276](https://github.com/ParabolInc/parabol/issues/13276)) ([d43d430](https://github.com/ParabolInc/parabol/commit/d43d430e2d7aa63e94f21aa99774ecb3314cedcb))
* hide inspo in retro demo ([#13278](https://github.com/ParabolInc/parabol/issues/13278)) ([239c8ce](https://github.com/ParabolInc/parabol/commit/239c8ce4259728e904f06f36206ab204fabe7d26))
* move feature flags to in-app ([#13275](https://github.com/ParabolInc/parabol/issues/13275)) ([afd5ba8](https://github.com/ParabolInc/parabol/commit/afd5ba8e6e8d3f50fdfaf3a7dc6738bc5a65a811))


### Changed

* remove generateInsights and team-level insights ([#13273](https://github.com/ParabolInc/parabol/issues/13273)) ([873ae79](https://github.com/ParabolInc/parabol/commit/873ae79f6c9405fc56c14257bd2f6e7f7ec44b32))

## [13.29.0](https://github.com/ParabolInc/parabol/compare/v13.28.0...v13.29.0) (2026-07-08)


### Added

* Inspiration Items in Retros ([#13267](https://github.com/ParabolInc/parabol/issues/13267)) ([a742599](https://github.com/ParabolInc/parabol/commit/a742599fbec3041a30e3ea4ffc09cad866d39b51))


### Fixed

* linear refresh bug, parabol standups as inspo ([#13269](https://github.com/ParabolInc/parabol/issues/13269)) ([bd8f9af](https://github.com/ParabolInc/parabol/commit/bd8f9af57ac91ecda64d8f69046563e23c5f8a30))

## [13.28.0](https://github.com/ParabolInc/parabol/compare/v13.27.0...v13.28.0) (2026-07-02)


### Added

* add jira inspo ([#13262](https://github.com/ParabolInc/parabol/issues/13262)) ([f47bec4](https://github.com/ParabolInc/parabol/commit/f47bec46543e1fcae329b4525f2b6a6bcd80cc75))
* gcal inspo ([#13265](https://github.com/ParabolInc/parabol/issues/13265)) ([40461ca](https://github.com/ParabolInc/parabol/commit/40461ca7ece7cddae16233ee6ff0361474c8e466))
* linear inspo ([#13264](https://github.com/ParabolInc/parabol/issues/13264)) ([d33bd54](https://github.com/ParabolInc/parabol/commit/d33bd5476771a6fc7130f366cbdf2b368e15f7d2))

## [13.27.0](https://github.com/ParabolInc/parabol/compare/v13.26.7...v13.27.0) (2026-06-30)


### Added

* inspo for github work items ([#13259](https://github.com/ParabolInc/parabol/issues/13259)) ([7ecc572](https://github.com/ParabolInc/parabol/commit/7ecc572c98edd1fbe8c24a74e705076e16318a79))


### Fixed

* trim null bytes from email and domain ([#13258](https://github.com/ParabolInc/parabol/issues/13258)) ([47eef11](https://github.com/ParabolInc/parabol/commit/47eef113efd5f4a9d10b903cba5e865d51960407))

## [13.26.7](https://github.com/ParabolInc/parabol/compare/v13.26.6...v13.26.7) (2026-06-29)


### Fixed

* safeguard against invalid frame data ([#13255](https://github.com/ParabolInc/parabol/issues/13255)) ([3d87177](https://github.com/ParabolInc/parabol/commit/3d87177aa2ed8a49ff9d9f45ee7fbcd3f5c11344))

## [13.26.6](https://github.com/ParabolInc/parabol/compare/v13.26.5...v13.26.6) (2026-06-25)


### Fixed

* bump gh actions ([#13252](https://github.com/ParabolInc/parabol/issues/13252)) ([110c88e](https://github.com/ParabolInc/parabol/commit/110c88e8809e7f023153204b1ed1b79cae39d016))
* memory leak on subscribe ([#13251](https://github.com/ParabolInc/parabol/issues/13251)) ([4874922](https://github.com/ParabolInc/parabol/commit/4874922db39e084e67cf1de95f00718a0f6d910b))
* scrollable work drawer ([#13249](https://github.com/ParabolInc/parabol/issues/13249)) ([90e3363](https://github.com/ParabolInc/parabol/commit/90e33630680e28be8e519fe64eecec4c63677b9d))

## [13.26.5](https://github.com/ParabolInc/parabol/compare/v13.26.4...v13.26.5) (2026-06-23)


### Fixed

* bump hocus pocus ([#13245](https://github.com/ParabolInc/parabol/issues/13245)) ([9063fdc](https://github.com/ParabolInc/parabol/commit/9063fdc583527ab8d75d8d2671900bc452174dcd))

## [13.26.4](https://github.com/ParabolInc/parabol/compare/v13.26.3...v13.26.4) (2026-06-23)


### Fixed

* finally disconnect hocus pocus ([#13242](https://github.com/ParabolInc/parabol/issues/13242)) ([c349c97](https://github.com/ParabolInc/parabol/commit/c349c97b1ba5539bb122bae114d513038faac198))

## [13.26.3](https://github.com/ParabolInc/parabol/compare/v13.26.2...v13.26.3) (2026-06-19)


### Fixed

* fetch from team member instead of facilitator for integration auth ([#13239](https://github.com/ParabolInc/parabol/issues/13239)) ([a1cbcbd](https://github.com/ParabolInc/parabol/commit/a1cbcbd19adfaaaf6299138830377b10d3ecf78e))

## [13.26.2](https://github.com/ParabolInc/parabol/compare/v13.26.1...v13.26.2) (2026-06-17)


### Fixed

* hotfix perms ([#13236](https://github.com/ParabolInc/parabol/issues/13236)) ([b9702ea](https://github.com/ParabolInc/parabol/commit/b9702ea6a67bd98575fd67d868bcaf27b351d22b))

## [13.26.1](https://github.com/ParabolInc/parabol/compare/v13.26.0...v13.26.1) (2026-06-17)


### Fixed

* handle undefined reflections on group ([#13232](https://github.com/ParabolInc/parabol/issues/13232)) ([359210a](https://github.com/ParabolInc/parabol/commit/359210a452be4930568ab5e2ee17f17a86afc8b9))
* teammember.integrations ([#13233](https://github.com/ParabolInc/parabol/issues/13233)) ([fb9c813](https://github.com/ParabolInc/parabol/commit/fb9c813ad6725bd39fe83226b1f082b96802d0ae))

## [13.26.0](https://github.com/ParabolInc/parabol/compare/v13.25.6...v13.26.0) (2026-06-17)


### Added

* AI estimates on jira issues ([#13230](https://github.com/ParabolInc/parabol/issues/13230)) ([5473aa5](https://github.com/ParabolInc/parabol/commit/5473aa5c365fec8a4626de67334ed04a8466c391))


### Fixed

* meeting facilitator bar and discussion drawer overlap ([#13228](https://github.com/ParabolInc/parabol/issues/13228)) ([ed14f51](https://github.com/ParabolInc/parabol/commit/ed14f51d9ae4ad0bafeb4964dd5a107050bf67e1))

## [13.25.6](https://github.com/ParabolInc/parabol/compare/v13.25.5...v13.25.6) (2026-06-16)


### Fixed

* Correct search result ordering ([#13226](https://github.com/ParabolInc/parabol/issues/13226)) ([95006d2](https://github.com/ParabolInc/parabol/commit/95006d25585ff8d9195e9abfd7425b4ef5fa1338))
* poker scale menu stays open on edits ([#13225](https://github.com/ParabolInc/parabol/issues/13225)) ([4f00758](https://github.com/ParabolInc/parabol/commit/4f00758d8b675e1530e7c961879b86d715c6bb26))
* refactor useModal to Dialog ([#13221](https://github.com/ParabolInc/parabol/issues/13221)) ([8b339bf](https://github.com/ParabolInc/parabol/commit/8b339bf870b9664d7cedb1e08d98b13d885e6366))

## [13.25.5](https://github.com/ParabolInc/parabol/compare/v13.25.4...v13.25.5) (2026-06-15)


### Fixed

* document memory leak ([#13219](https://github.com/ParabolInc/parabol/issues/13219)) ([6c3671f](https://github.com/ParabolInc/parabol/commit/6c3671fea0e60e3fd486c16d53c6ab668156a910))
* public subpage access ([#13218](https://github.com/ParabolInc/parabol/issues/13218)) ([6b2d054](https://github.com/ParabolInc/parabol/commit/6b2d054f2626901cfcb93ca638ff87453df71e8d))

## [13.25.4](https://github.com/ParabolInc/parabol/compare/v13.25.3...v13.25.4) (2026-06-12)


### Fixed

* support redirects in saml ([#13215](https://github.com/ParabolInc/parabol/issues/13215)) ([c8527d1](https://github.com/ParabolInc/parabol/commit/c8527d1057995530b5705de4ee2965b593d9d9cd))

## [13.25.3](https://github.com/ParabolInc/parabol/compare/v13.25.2...v13.25.3) (2026-06-12)


### Fixed

* add more metadata to dd logs ([#13212](https://github.com/ParabolInc/parabol/issues/13212)) ([0863c6f](https://github.com/ParabolInc/parabol/commit/0863c6f12eabcca56fe8af67b632941037d9ffb2))

## [13.25.2](https://github.com/ParabolInc/parabol/compare/v13.25.1...v13.25.2) (2026-06-11)


### Fixed

* hidden last call copy ([#13209](https://github.com/ParabolInc/parabol/issues/13209)) ([6fb8374](https://github.com/ParabolInc/parabol/commit/6fb837481e24523de7b7f224c756e8166c9a2f75))

## [13.25.1](https://github.com/ParabolInc/parabol/compare/v13.25.0...v13.25.1) (2026-06-11)


### Fixed

* better hocuspocus typings ([#13203](https://github.com/ParabolInc/parabol/issues/13203)) ([76bb2f5](https://github.com/ParabolInc/parabol/commit/76bb2f507aa52277d264c1fc26f94467b0beff05))
* reflection card animation ([#13205](https://github.com/ParabolInc/parabol/issues/13205)) ([eba12e7](https://github.com/ParabolInc/parabol/commit/eba12e793033ff0421001761361439fcd9d1c457))

## [13.25.0](https://github.com/ParabolInc/parabol/compare/v13.24.2...v13.25.0) (2026-06-10)


### Added

* bump to hocuspocus v4 ([#13201](https://github.com/ParabolInc/parabol/issues/13201)) ([b34bb35](https://github.com/ParabolInc/parabol/commit/b34bb35db26aa0d150b42a41060e49a63e08da9e))
* outline reflections on hover ([#13197](https://github.com/ParabolInc/parabol/issues/13197)) ([b43a9f0](https://github.com/ParabolInc/parabol/commit/b43a9f0ae2846952c8aa9bfc87815b7befa85ad6))


### Fixed

* small errors MeetingControlBar Keys, NewMeetingAvatar user null,… ([#13198](https://github.com/ParabolInc/parabol/issues/13198)) ([e81c311](https://github.com/ParabolInc/parabol/commit/e81c3119cc0ecd12cecd0e39c14f406c5b12bc6f))

## [13.24.2](https://github.com/ParabolInc/parabol/compare/v13.24.1...v13.24.2) (2026-06-04)


### Fixed

* escape ([#13193](https://github.com/ParabolInc/parabol/issues/13193)) ([0da2365](https://github.com/ParabolInc/parabol/commit/0da236543715c1577ea3bdd30e5145a40cc42618))

## [13.24.1](https://github.com/ParabolInc/parabol/compare/v13.24.0...v13.24.1) (2026-06-03)


### Fixed

* MR3 ([#13190](https://github.com/ParabolInc/parabol/issues/13190)) ([ddf7cb5](https://github.com/ParabolInc/parabol/commit/ddf7cb55f748aabb42ac330feca2a1fcb080e2c1))

## [13.24.0](https://github.com/ParabolInc/parabol/compare/v13.23.0...v13.24.0) (2026-06-03)


### Added

* add parabol label to jira issues ([#13185](https://github.com/ParabolInc/parabol/issues/13185)) ([89e4f6e](https://github.com/ParabolInc/parabol/commit/89e4f6e614c7a1809a76565782d8e1b4fbfa4328))
* MR PPMI repos on docker-external (untested) ([#13187](https://github.com/ParabolInc/parabol/issues/13187)) ([23edea5](https://github.com/ParabolInc/parabol/commit/23edea5462f19fa2be70762c43ed0909031753db))

## [13.23.0](https://github.com/ParabolInc/parabol/compare/v13.22.4...v13.23.0) (2026-06-02)


### Added

* replace tenor with klipy ([#13171](https://github.com/ParabolInc/parabol/issues/13171)) ([b98707a](https://github.com/ParabolInc/parabol/commit/b98707ac76422b4a2f0b4bdc9b0f147d05ab1cd4))

## [13.22.4](https://github.com/ParabolInc/parabol/compare/v13.22.3...v13.22.4) (2026-06-02)


### Fixed

* support no teams in create meeting ([#13180](https://github.com/ParabolInc/parabol/issues/13180)) ([f662fc6](https://github.com/ParabolInc/parabol/commit/f662fc68a7ae30924906f2d0854c797cc9631b61))

## [13.22.3](https://github.com/ParabolInc/parabol/compare/v13.22.2...v13.22.3) (2026-06-02)


### Fixed

* dialog open prop Page scroll behavior ([#13177](https://github.com/ParabolInc/parabol/issues/13177)) ([43c9253](https://github.com/ParabolInc/parabol/commit/43c9253ac60dc3f39251f19f2ef46f1c45656b5c))

## [13.22.2](https://github.com/ParabolInc/parabol/compare/v13.22.1...v13.22.2) (2026-06-01)


### Fixed

* migration order ([#13174](https://github.com/ParabolInc/parabol/issues/13174)) ([ae91ac7](https://github.com/ParabolInc/parabol/commit/ae91ac7df46a404c4f9e34c58b1854b71a310297))

## [13.22.1](https://github.com/ParabolInc/parabol/compare/v13.22.0...v13.22.1) (2026-06-01)


### Fixed

* audit scope perms ([#13172](https://github.com/ParabolInc/parabol/issues/13172)) ([66dffc9](https://github.com/ParabolInc/parabol/commit/66dffc952fe6b5880af8dfcbd48c603b418271ea))

## [13.22.0](https://github.com/ParabolInc/parabol/compare/v13.21.1...v13.22.0) (2026-06-01)


### Added

* recurrence no longer must start meeting immediately ([#13140](https://github.com/ParabolInc/parabol/issues/13140)) ([10ecf17](https://github.com/ParabolInc/parabol/commit/10ecf17f11267b9606119accd75dee2e6b5df59b))


### Fixed

* avatar fallbacks and delay opening in meeting ([#13166](https://github.com/ParabolInc/parabol/issues/13166)) ([4477e1b](https://github.com/ParabolInc/parabol/commit/4477e1bf968cae801f8a2c81f03a679a72ec489c))
* bugs from datadog: deadlock, parsing, etc ([#13163](https://github.com/ParabolInc/parabol/issues/13163)) ([2a6501c](https://github.com/ParabolInc/parabol/commit/2a6501ccda4e70ff4fc95ef5f60a70835f0710d3))
* remove useTransition ([#13169](https://github.com/ParabolInc/parabol/issues/13169)) ([d137d7b](https://github.com/ParabolInc/parabol/commit/d137d7b10abbb91d5ba71713c9dd7ef0e5dc496c))
* updating radix dialogs ([#13167](https://github.com/ParabolInc/parabol/issues/13167)) ([67f0a03](https://github.com/ParabolInc/parabol/commit/67f0a037be117d3ef42bc06e4965cf7e245a428e))

## [13.21.1](https://github.com/ParabolInc/parabol/compare/v13.21.0...v13.21.1) (2026-05-28)


### Fixed

* re-add arr_append_uniq SQL function ([#13160](https://github.com/ParabolInc/parabol/issues/13160)) ([f26a7a0](https://github.com/ParabolInc/parabol/commit/f26a7a036de30341489a06893dbb3920d1680a3c))

## [13.21.0](https://github.com/ParabolInc/parabol/compare/v13.20.3...v13.21.0) (2026-05-28)


### Added

* IS_SINGLE_ORG ([#13151](https://github.com/ParabolInc/parabol/issues/13151)) ([cfc5764](https://github.com/ParabolInc/parabol/commit/cfc57647d9759d8db48c19446b0d1fbf0be14435))
* Meeting avatars to motion ([#13157](https://github.com/ParabolInc/parabol/issues/13157)) ([c393758](https://github.com/ParabolInc/parabol/commit/c393758fc7ead964fc8b2bd6797af3d6f6b657e5))


### Fixed

* can reset retro with updates phase ([#13153](https://github.com/ParabolInc/parabol/issues/13153)) ([381c4bc](https://github.com/ParabolInc/parabol/commit/381c4bc098708d27e179ba3cb65d5cd8fe73d324))
* check for invalid scope key before it goes to postgres ([#13156](https://github.com/ParabolInc/parabol/issues/13156)) ([a11108f](https://github.com/ParabolInc/parabol/commit/a11108f9eb1562865dca4065aa62053189ad1315))
* invitations race condition ([#13155](https://github.com/ParabolInc/parabol/issues/13155)) ([2638436](https://github.com/ParabolInc/parabol/commit/263843649b62ffb4bc33d42ae065b73a4da56f5e))


### Changed

* drop User.tms ([#13154](https://github.com/ParabolInc/parabol/issues/13154)) ([8a4de20](https://github.com/ParabolInc/parabol/commit/8a4de2070ef54dcde8a1a53804e80c357f32bf2f))

## [13.20.3](https://github.com/ParabolInc/parabol/compare/v13.20.2...v13.20.3) (2026-05-25)


### Fixed

* [#12222](https://github.com/ParabolInc/parabol/issues/12222) text selection in estimation phase ([#13146](https://github.com/ParabolInc/parabol/issues/13146)) ([338cf75](https://github.com/ParabolInc/parabol/commit/338cf75054c6364a07bfec2fb002daa67d1559a1))

## [13.20.2](https://github.com/ParabolInc/parabol/compare/v13.20.1...v13.20.2) (2026-05-25)


### Fixed

* avatar images in emails ([#13144](https://github.com/ParabolInc/parabol/issues/13144)) ([71a51b2](https://github.com/ParabolInc/parabol/commit/71a51b2f014b47f0425b66945ac267526b64a72c))

## [13.20.1](https://github.com/ParabolInc/parabol/compare/v13.20.0...v13.20.1) (2026-05-25)


### Fixed

* ambiguous teamId column that broke related discussions ([#13142](https://github.com/ParabolInc/parabol/issues/13142)) ([c54d6d2](https://github.com/ParabolInc/parabol/commit/c54d6d29d310fac66268a001c05198cc1ab7fb89))
* drag handle shortcuts now work when menu is open ([#13143](https://github.com/ParabolInc/parabol/issues/13143)) ([ffad4c5](https://github.com/ParabolInc/parabol/commit/ffad4c5917b3956bdc04788413f66fb5f7a5004d))
* guard against null commandManager after Editor.destroy() ([#13141](https://github.com/ParabolInc/parabol/issues/13141)) ([427c818](https://github.com/ParabolInc/parabol/commit/427c818a1867176aad4bce1c52895b3c0a923451))
* invitation required on extant team after deleting a team ([#13000](https://github.com/ParabolInc/parabol/issues/13000)) ([3571ca5](https://github.com/ParabolInc/parabol/commit/3571ca5db7cfda95fdc8dd867d0e5a90705b933f))

## [13.20.0](https://github.com/ParabolInc/parabol/compare/v13.19.0...v13.20.0) (2026-05-22)


### Added

* display GDrive integration errors, enable Zoom connection for debug ([#13137](https://github.com/ParabolInc/parabol/issues/13137)) ([58abb87](https://github.com/ParabolInc/parabol/commit/58abb87d1747a96cee7987eab66a3b90fadc9b28))

## [13.19.0](https://github.com/ParabolInc/parabol/compare/v13.18.2...v13.19.0) (2026-05-22)


### Added

* add support for Zoom integration ([#13098](https://github.com/ParabolInc/parabol/issues/13098)) ([5eee3c5](https://github.com/ParabolInc/parabol/commit/5eee3c5f53b3839801d8e8a3cf121b6ec809a5bb))


### Fixed

* update Tiptap dependencies to 3.23.6. ([#13134](https://github.com/ParabolInc/parabol/issues/13134)) ([f3db9bd](https://github.com/ParabolInc/parabol/commit/f3db9bdf351b9ddba8ec0cce4fbde53fcdf43ddb))

## [13.18.2](https://github.com/ParabolInc/parabol/compare/v13.18.1...v13.18.2) (2026-05-22)


### Fixed

* bump nodejs ([#13130](https://github.com/ParabolInc/parabol/issues/13130)) ([4cc3beb](https://github.com/ParabolInc/parabol/commit/4cc3beb9775172088f75ba135183ac24d5796e95))

## [13.18.1](https://github.com/ParabolInc/parabol/compare/v13.18.0...v13.18.1) (2026-05-21)


### Fixed

* disable trial expiration limits  ([#13125](https://github.com/ParabolInc/parabol/issues/13125)) ([07dd9e1](https://github.com/ParabolInc/parabol/commit/07dd9e160bca61272b713aaea729b3ed35a631ea))


### Changed

* **deps:** bump samlify from 2.10.2 to 2.13.0 ([#13122](https://github.com/ParabolInc/parabol/issues/13122)) ([4fa968d](https://github.com/ParabolInc/parabol/commit/4fa968dd307a1ebc1397e5c245391a4d6730730a))
* update CC whenever a payment succeeds ([#13123](https://github.com/ParabolInc/parabol/issues/13123)) ([4db817b](https://github.com/ParabolInc/parabol/commit/4db817b0ec7932d496835627d0b079a2fee169e3))

## [13.18.0](https://github.com/ParabolInc/parabol/compare/v13.17.1...v13.18.0) (2026-05-20)


### Added

* related discussions gate ([#13116](https://github.com/ParabolInc/parabol/issues/13116)) ([25628b4](https://github.com/ParabolInc/parabol/commit/25628b4e5ed385e42f2173cb532b96fddc0077af))


### Fixed

* update recurrence settings ([#13115](https://github.com/ParabolInc/parabol/issues/13115)) ([8c88004](https://github.com/ParabolInc/parabol/commit/8c88004742741fc0ee78424484d424fc9714007a))


### Changed

* upgrade release-please-action to v5, hoist sanitize-html ([#13108](https://github.com/ParabolInc/parabol/issues/13108)) ([1202bc1](https://github.com/ParabolInc/parabol/commit/1202bc179fb0879b084177ab91a171b5d11ce410))

## [13.17.1](https://github.com/ParabolInc/parabol/compare/v13.17.0...v13.17.1) (2026-05-20)


### Fixed

* add error handling and logging to plaintext generation ([#13103](https://github.com/ParabolInc/parabol/issues/13103)) ([1cf843f](https://github.com/ParabolInc/parabol/commit/1cf843f595cecd20269aa9e4339e89f3e0516b26))
* remove resize-observer-polyfill in favor of native ([#13106](https://github.com/ParabolInc/parabol/issues/13106)) ([5e72b12](https://github.com/ParabolInc/parabol/commit/5e72b12d079cccf003fa8775425bed4189522abb))

## [13.17.0](https://github.com/ParabolInc/parabol/compare/v13.16.0...v13.17.0) (2026-05-19)


### Added

* Google Meet Transcripts in Drawer ([#13096](https://github.com/ParabolInc/parabol/issues/13096)) ([c52cc62](https://github.com/ParabolInc/parabol/commit/c52cc6218075e97904071973eb8f0b4ae2518251))

## [13.16.0](https://github.com/ParabolInc/parabol/compare/v13.15.0...v13.16.0) (2026-05-18)


### Added

* adds task review to retro ([#13087](https://github.com/ParabolInc/parabol/issues/13087)) ([2b9fb6b](https://github.com/ParabolInc/parabol/commit/2b9fb6bc75345be6f8653222856193b75c53c8c6))


### Fixed

* SCIM OAuth Client Credentials sub mapping ([#13092](https://github.com/ParabolInc/parabol/issues/13092)) ([43503da](https://github.com/ParabolInc/parabol/commit/43503da228589e17291737b57cca660d5cbe9a12))

## [13.15.0](https://github.com/ParabolInc/parabol/compare/v13.14.3...v13.15.0) (2026-05-15)


### Added

* Jira getIssues extend timeout ([#13088](https://github.com/ParabolInc/parabol/issues/13088)) ([2f36620](https://github.com/ParabolInc/parabol/commit/2f3662075732d77ffb7c8cae02d1fc97ed32edea))


### Fixed

* bump kysely ([#13085](https://github.com/ParabolInc/parabol/issues/13085)) ([6c41fae](https://github.com/ParabolInc/parabol/commit/6c41fae6795716af5bf74fce0209b8e864d2b147))

## [13.14.3](https://github.com/ParabolInc/parabol/compare/v13.14.2...v13.14.3) (2026-05-12)


### Fixed

* remove  isOrgAdminBySAMLDomain permission rule for parseSAMLMetadata ([#13082](https://github.com/ParabolInc/parabol/issues/13082)) ([3dca003](https://github.com/ParabolInc/parabol/commit/3dca003ec9982c7ae9e397bbaa55e5791ce3895f))

## [13.14.2](https://github.com/ParabolInc/parabol/compare/v13.14.1...v13.14.2) (2026-05-12)


### Fixed

* update useArmor to support extracting docId from multipart/form-data ([#13080](https://github.com/ParabolInc/parabol/issues/13080)) ([533863d](https://github.com/ParabolInc/parabol/commit/533863da504143c9e376e3299f685cb0a273e134))

## [13.14.1](https://github.com/ParabolInc/parabol/compare/v13.14.0...v13.14.1) (2026-05-11)


### Fixed

* update sentiment score only when a valid value is generated ([#13075](https://github.com/ParabolInc/parabol/issues/13075)) ([6353221](https://github.com/ParabolInc/parabol/commit/6353221918c9e1382ebf716f8abd0545f9181e3d))

## [13.14.0](https://github.com/ParabolInc/parabol/compare/v13.13.0...v13.14.0) (2026-05-08)


### Added

* add token management toolbar to GraphiQL ([#13066](https://github.com/ParabolInc/parabol/issues/13066)) ([e08003b](https://github.com/ParabolInc/parabol/commit/e08003b1d9372da184af251cb4b4857037f4f89b))


### Fixed

* debounce meeting member disconnection status updates ([#13068](https://github.com/ParabolInc/parabol/issues/13068)) ([c1f6309](https://github.com/ParabolInc/parabol/commit/c1f6309adec463fec14169f9a6f36b6dbbff98af))
* table buttons on hover, editPageContent ([#13071](https://github.com/ParabolInc/parabol/issues/13071)) ([cd5c005](https://github.com/ParabolInc/parabol/commit/cd5c005ee08a429462229febcbc0fa097df94ee4))


### Changed

* remove unused axios and @hocuspocus/extension-redis dependencies ([#13073](https://github.com/ParabolInc/parabol/issues/13073)) ([da90f4d](https://github.com/ParabolInc/parabol/commit/da90f4d573d7627f492d03fed7898af9e0bfffba))

## [13.13.0](https://github.com/ParabolInc/parabol/compare/v13.12.4...v13.13.0) (2026-05-06)


### Added

* Expose GraphiQL ([#13057](https://github.com/ParabolInc/parabol/issues/13057)) ([a0706a7](https://github.com/ParabolInc/parabol/commit/a0706a73454c5c9c735e2f5693b744bf0fa2d12c))
* Expose GraphQL Schema ([#13062](https://github.com/ParabolInc/parabol/issues/13062)) ([b560550](https://github.com/ParabolInc/parabol/commit/b560550bd0d6fadea19f1a7f8295dfaf52c94723))
* llms.txt and readme rewrite ([#13063](https://github.com/ParabolInc/parabol/issues/13063)) ([4f55d97](https://github.com/ParabolInc/parabol/commit/4f55d974c81182f4e3856d0110f9f9e15218e722))


### Fixed

* formatting of GraphQL API section in README ([#13064](https://github.com/ParabolInc/parabol/issues/13064)) ([0c82955](https://github.com/ParabolInc/parabol/commit/0c8295503844497b115af6868f1cb9599920662b))


### Changed

* disable Datadog session recording and user interaction tracking ([#13060](https://github.com/ParabolInc/parabol/issues/13060)) ([9f12dad](https://github.com/ParabolInc/parabol/commit/9f12dadd036db41c1d2b3ae9f2af598fb67a89a9))

## [13.12.4](https://github.com/ParabolInc/parabol/compare/v13.12.3...v13.12.4) (2026-05-04)


### Fixed

* downgrade dd-trace to v5.67.0 to resolve compatibility issues ([#13056](https://github.com/ParabolInc/parabol/issues/13056)) ([1f1c59b](https://github.com/ParabolInc/parabol/commit/1f1c59b3648bbba44ad21980adc621c33cf7164d))
* xmldom, datadog-ci, pm2 bumps ([#13054](https://github.com/ParabolInc/parabol/issues/13054)) ([7b36945](https://github.com/ParabolInc/parabol/commit/7b369452d9d1f8a6bb65071819bff3a59b6b41d1))

## [13.12.3](https://github.com/ParabolInc/parabol/compare/v13.12.2...v13.12.3) (2026-05-04)


### Fixed

* always assign docId from subscriptions on persisted queries ([#13051](https://github.com/ParabolInc/parabol/issues/13051)) ([074a684](https://github.com/ParabolInc/parabol/commit/074a684e26bbc73ece4252b0f95efdd5b8df6b78))

## [13.12.2](https://github.com/ParabolInc/parabol/compare/v13.12.1...v13.12.2) (2026-05-04)


### Fixed

* revert resource grants ([#13047](https://github.com/ParabolInc/parabol/issues/13047)) ([df41bae](https://github.com/ParabolInc/parabol/commit/df41baed78e83ca96376b6c839d7b3b854bf1937))

## [13.12.1](https://github.com/ParabolInc/parabol/compare/v13.12.0...v13.12.1) (2026-05-02)


### Fixed

* allow query access to ghost team and organization resources ([#13043](https://github.com/ParabolInc/parabol/issues/13043)) ([4d16334](https://github.com/ParabolInc/parabol/commit/4d163345cfc7462cda1f1032cf3cb0b87a0c58f4))

## [13.12.0](https://github.com/ParabolInc/parabol/compare/v13.11.4...v13.12.0) (2026-05-01)


### Added

* Use resource grants on queries ([#13040](https://github.com/ParabolInc/parabol/issues/13040)) ([0c8b960](https://github.com/ParabolInc/parabol/commit/0c8b9607e232fae22c56de4767e3d97a86645f33))

## [13.11.4](https://github.com/ParabolInc/parabol/compare/v13.11.3...v13.11.4) (2026-05-01)


### Fixed

* case insensitive persistentNameId as SCIM userName ([#13036](https://github.com/ParabolInc/parabol/issues/13036)) ([9d6266a](https://github.com/ParabolInc/parabol/commit/9d6266a119ab67341c4d335c2632702c4610a6f4))

## [13.11.3](https://github.com/ParabolInc/parabol/compare/v13.11.2...v13.11.3) (2026-04-29)


### Fixed

* User.inactive in csv export ([#13032](https://github.com/ParabolInc/parabol/issues/13032)) ([c531983](https://github.com/ParabolInc/parabol/commit/c5319839fc4e62d5fea3a8111c9af8cc26bae6fb))

## [13.11.2](https://github.com/ParabolInc/parabol/compare/v13.11.1...v13.11.2) (2026-04-29)


### Fixed

* use Promise.allSettled in removeFromOrg ([#13029](https://github.com/ParabolInc/parabol/issues/13029)) ([b512817](https://github.com/ParabolInc/parabol/commit/b5128176f6b3d96d7608d78d9dce2f9b3188381a))

## [13.11.1](https://github.com/ParabolInc/parabol/compare/v13.11.0...v13.11.1) (2026-04-29)


### Fixed

* volume mount for local pg ([#13024](https://github.com/ParabolInc/parabol/issues/13024)) ([efa85a4](https://github.com/ParabolInc/parabol/commit/efa85a46ded028fa7f23b86b4425a418f4099659))


### Changed

* update dependencies and replace uuid with native crypto.random ([#13022](https://github.com/ParabolInc/parabol/issues/13022)) ([cadeab1](https://github.com/ParabolInc/parabol/commit/cadeab1e73fcb2c6f5630536c31de9ff93b0de8e))

## [13.11.0](https://github.com/ParabolInc/parabol/compare/v13.10.6...v13.11.0) (2026-04-24)


### Added

* Pages typography improvements ([#13017](https://github.com/ParabolInc/parabol/issues/13017)) ([16cb7fb](https://github.com/ParabolInc/parabol/commit/16cb7fb06a7f4c3514a995ffb2dd4ce20ffe5acb))


### Fixed

* Pages intermittent newlines ([#13019](https://github.com/ParabolInc/parabol/issues/13019)) ([bb4ad34](https://github.com/ParabolInc/parabol/commit/bb4ad349a79b1050db5be68d5432786c7ef41055))

## [13.10.6](https://github.com/ParabolInc/parabol/compare/v13.10.5...v13.10.6) (2026-04-21)


### Fixed

* recurring meeting regression ([#13010](https://github.com/ParabolInc/parabol/issues/13010)) ([bbafb99](https://github.com/ParabolInc/parabol/commit/bbafb99e1883efe00b6599396f5f982998084c82))
* unable to end meetings started by recurrence ([#13013](https://github.com/ParabolInc/parabol/issues/13013)) ([236d7ee](https://github.com/ParabolInc/parabol/commit/236d7ee63d3ddd17eb7d99bc96c70abe01fffdef))

## [13.10.5](https://github.com/ParabolInc/parabol/compare/v13.10.4...v13.10.5) (2026-04-21)


### Fixed

* silent coercion between token failure and absence ([#13006](https://github.com/ParabolInc/parabol/issues/13006)) ([4716b2e](https://github.com/ParabolInc/parabol/commit/4716b2e95e222f2425872e615c552b8efebdb6bb))
* various handle leak fixes ([#13001](https://github.com/ParabolInc/parabol/issues/13001)) ([f500334](https://github.com/ParabolInc/parabol/commit/f500334ea68f8ceb90dde417dc22c73403499ff9))

## [13.10.4](https://github.com/ParabolInc/parabol/compare/v13.10.3...v13.10.4) (2026-04-18)


### Fixed

* handle undefined tms in isTeamMember ([#13002](https://github.com/ParabolInc/parabol/issues/13002)) ([1fe0529](https://github.com/ParabolInc/parabol/commit/1fe0529e53ab172343999415ed9780b711dfb979))

## [13.10.3](https://github.com/ParabolInc/parabol/compare/v13.10.2...v13.10.3) (2026-04-16)


### Fixed

* sync auth token changes from mutations back to the WS connection ([#12997](https://github.com/ParabolInc/parabol/issues/12997)) ([2372906](https://github.com/ParabolInc/parabol/commit/2372906c4344d0f75943fd8ff444aa748407915c))

## [13.10.2](https://github.com/ParabolInc/parabol/compare/v13.10.1...v13.10.2) (2026-04-16)


### Changed

* cleanup legacy /newteam route ([#12994](https://github.com/ParabolInc/parabol/issues/12994)) ([94cb2a2](https://github.com/ParabolInc/parabol/commit/94cb2a218759b045ecf704c31774aa90ccb093fd))

## [13.10.1](https://github.com/ParabolInc/parabol/compare/v13.10.0...v13.10.1) (2026-04-16)


### Fixed

* jwt race on new team ([#12991](https://github.com/ParabolInc/parabol/issues/12991)) ([a78e4d3](https://github.com/ParabolInc/parabol/commit/a78e4d3f038e0eb166f6a2af64f49d81d465816f))

## [13.10.0](https://github.com/ParabolInc/parabol/compare/v13.9.2...v13.10.0) (2026-04-14)


### Added

* add [@scope](https://github.com/scope) directive to gql schema ([#12977](https://github.com/ParabolInc/parabol/issues/12977)) ([bdb743c](https://github.com/ParabolInc/parabol/commit/bdb743c1d02d302761ee737bda71799bea0bee45))
* add read authorization scopes to GraphQL ([#12984](https://github.com/ParabolInc/parabol/issues/12984)) ([651b15f](https://github.com/ParabolInc/parabol/commit/651b15f3c1428b810dd30e8676d9156f19228196))
* Personal Access Tokens ([#12972](https://github.com/ParabolInc/parabol/issues/12972)) ([e73a74b](https://github.com/ParabolInc/parabol/commit/e73a74bd263bfdd1fb281a0f614ff537294dcf06))


### Fixed

* activity library null filter, pat error path ([#12987](https://github.com/ParabolInc/parabol/issues/12987)) ([96a0c63](https://github.com/ParabolInc/parabol/commit/96a0c63c20135228ee4b1c9a77d79e5bc1c84bf0))
* log 400 SCIM errors ([#12980](https://github.com/ParabolInc/parabol/issues/12980)) ([b841de6](https://github.com/ParabolInc/parabol/commit/b841de614e810cbc15ac31c29960bf0f9ab712ac))
* prevent memory leak and socket exhaustion in publish + fetch paths ([#12986](https://github.com/ParabolInc/parabol/issues/12986)) ([a217cde](https://github.com/ParabolInc/parabol/commit/a217cde05c78df345b057e4c10dca2f6f6689b32))
* schema descriptions ([#12982](https://github.com/ParabolInc/parabol/issues/12982)) ([7d3f77f](https://github.com/ParabolInc/parabol/commit/7d3f77f18649419154877a0ff62ce92775f9626f))

## [13.9.2](https://github.com/ParabolInc/parabol/compare/v13.9.1...v13.9.2) (2026-04-08)


### Fixed

* support su for moveTeamToOrg ([#12978](https://github.com/ParabolInc/parabol/issues/12978)) ([853f465](https://github.com/ParabolInc/parabol/commit/853f46562cea1002aa061dc75657f9fc4f7afbad))

## [13.9.1](https://github.com/ParabolInc/parabol/compare/v13.9.0...v13.9.1) (2026-04-07)


### Fixed

* text style kit  ([#12975](https://github.com/ParabolInc/parabol/issues/12975)) ([ae2c45b](https://github.com/ParabolInc/parabol/commit/ae2c45b481117be7f89b479c6820822b5ce883d3))

## [13.9.0](https://github.com/ParabolInc/parabol/compare/v13.8.0...v13.9.0) (2026-04-07)


### Added

* add Highlight and TextStyle extensions to all Tiptap editors ([#12974](https://github.com/ParabolInc/parabol/issues/12974)) ([4e2688e](https://github.com/ParabolInc/parabol/commit/4e2688e7efae71ff2d85871db1d9e12b856e0372))


### Fixed

* deadlock on renew ([#12970](https://github.com/ParabolInc/parabol/issues/12970)) ([9fe07c2](https://github.com/ParabolInc/parabol/commit/9fe07c2dccdf938bd1dd17526c8dc5f4cf776216))

## [13.8.0](https://github.com/ParabolInc/parabol/compare/v13.7.9...v13.8.0) (2026-04-04)


### Added

* implement ADF to TipTap conversion so users can edit jira poker issues ([#12968](https://github.com/ParabolInc/parabol/issues/12968)) ([836a7aa](https://github.com/ParabolInc/parabol/commit/836a7aa99d83b109e0886f244175a28a32b3e518))


### Fixed

* moves gql perms to permissions.ts ([#12965](https://github.com/ParabolInc/parabol/issues/12965)) ([5072ad7](https://github.com/ParabolInc/parabol/commit/5072ad7f30ad8ad8a07319bea854919db5f5393d))


### Changed

* update project dependencies and lockfile ([#12967](https://github.com/ParabolInc/parabol/issues/12967)) ([5b978bc](https://github.com/ParabolInc/parabol/commit/5b978bca5fc19715a6178d2b4a53003dba47ebb6))

## [13.7.9](https://github.com/ParabolInc/parabol/compare/v13.7.8...v13.7.9) (2026-04-01)


### Fixed

* blacklist old authToken on refreshSession ([#12951](https://github.com/ParabolInc/parabol/issues/12951)) ([497b23d](https://github.com/ParabolInc/parabol/commit/497b23ddbbbb08313ca63430b61529b0bc3c444a))
* hash password reset tokens ([#12955](https://github.com/ParabolInc/parabol/issues/12955)) ([2d15045](https://github.com/ParabolInc/parabol/commit/2d1504511dcbb81720fbb901c2de06998fcc6066))
* sanitize reflections ([#12948](https://github.com/ParabolInc/parabol/issues/12948)) ([054ce42](https://github.com/ParabolInc/parabol/commit/054ce4297061452af9880fac57a271bfba85f733))
* share page wrong url ([#12962](https://github.com/ParabolInc/parabol/issues/12962)) ([a952d94](https://github.com/ParabolInc/parabol/commit/a952d9412469a645f47eae9ddf570947edb744f7))


### Changed

* explicit index check for team health votes ([#12950](https://github.com/ParabolInc/parabol/issues/12950)) ([e17e99c](https://github.com/ParabolInc/parabol/commit/e17e99c991dbe36fd92a76e4a8b2ee8db8661f7f))
* use execFile in backupOrganization ([#12953](https://github.com/ParabolInc/parabol/issues/12953)) ([fc9df0f](https://github.com/ParabolInc/parabol/commit/fc9df0f56ee0e81dea72b8cb3efea0a6a9ae3834))
* use google-auth-library in GoogleServerManager ([#12952](https://github.com/ParabolInc/parabol/issues/12952)) ([f7eec67](https://github.com/ParabolInc/parabol/commit/f7eec67a1735340ca0a48de72bfc6ad30a112d41))
* use postUntrusted for webhook calls ([#12956](https://github.com/ParabolInc/parabol/issues/12956)) ([d7188e6](https://github.com/ParabolInc/parabol/commit/d7188e6bbd6e0fde497357bbaff0644286cc94b0))

## [13.7.8](https://github.com/ParabolInc/parabol/compare/v13.7.7...v13.7.8) (2026-03-30)


### Fixed

* catch and log childPageId decrypt errors ([#12946](https://github.com/ParabolInc/parabol/issues/12946)) ([3b070ce](https://github.com/ParabolInc/parabol/commit/3b070ce480f58a64df14a96174d500edfd32c45a))
* use fetchUntrusted in parseSAMLMetadata ([#12940](https://github.com/ParabolInc/parabol/issues/12940)) ([4660320](https://github.com/ParabolInc/parabol/commit/4660320ab6315b20c8f5d8db51b7f64590cbe913))

## [13.7.7](https://github.com/ParabolInc/parabol/compare/v13.7.6...v13.7.7) (2026-03-27)


### Fixed

* sanitize external HTML for tasks ([#12938](https://github.com/ParabolInc/parabol/issues/12938)) ([967756c](https://github.com/ParabolInc/parabol/commit/967756ce9aaa8f56af843576f214166434c3b694))
* selfHostedHandler path prefix ([#12939](https://github.com/ParabolInc/parabol/issues/12939)) ([cfae060](https://github.com/ParabolInc/parabol/commit/cfae060da6d231954ed723dc354e1016a17bb1e8))


### Changed

* stricter tsHeadline types ([#12942](https://github.com/ParabolInc/parabol/issues/12942)) ([e13ba0b](https://github.com/ParabolInc/parabol/commit/e13ba0bb0809cd6bcbaed923ed7a68b0d16ff0b5))

## [13.7.6](https://github.com/ParabolInc/parabol/compare/v13.7.5...v13.7.6) (2026-03-27)


### Fixed

* bump dev pg to v18 ([#12936](https://github.com/ParabolInc/parabol/issues/12936)) ([a71a755](https://github.com/ParabolInc/parabol/commit/a71a75550b988ddc1caf833c45d3227ae5ffe2af))
* bump pg vector to latest ([#12935](https://github.com/ParabolInc/parabol/issues/12935)) ([43cc491](https://github.com/ParabolInc/parabol/commit/43cc491d06a19fec778391877edf370595cd3877))
* Jira images in tasks ([#12931](https://github.com/ParabolInc/parabol/issues/12931)) ([3ad946e](https://github.com/ParabolInc/parabol/commit/3ad946e5e81d6198d47d280419d24798821da12d))
* refactor graphql permissions to a single file pt.1 ([#12933](https://github.com/ParabolInc/parabol/issues/12933)) ([e3181b6](https://github.com/ParabolInc/parabol/commit/e3181b66b0ebc283f402d3e82e127d44e102efea))

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
