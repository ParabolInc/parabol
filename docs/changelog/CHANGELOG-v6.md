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
