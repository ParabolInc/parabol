# Parabol Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## 6.107.2 2023-Jun-09

### Fixed:

- Bump max mem restart to 24GB to support heapdumping GQL Executor

## 6.107.1 2023-June-8

### Fixed:

- fix: Many public templates not displayed

## 6.107.0 2023-June-7

### Added

- feat: add zoom transcription (#7949)
- feat(checkout-flow): add org details (#8280)
- feat(team health): voting and reveal (#8286)
- feat(Team Health): Add summary (#8298)
- feat(DX): Infer parent portal IDs through React context (#8310)
- feat(checkout-flow): credit card UI (#8318)
- feat(analytics): Track meeting category on meeting start (#8336)
- feat(rid): Add new users to feature flag (#8337)
- feat(rid): Add pre-/post-mortem templates (#8319)

### Fixed

- fix: auto update billing leader (#8277)
- fix(prompt-to-join): fix add teammate routing when opened on a new tab (#8302)
- fix(rid): Correct styles for non-owner readonly scales (#8301)
- fix: fix loader.load with undefined in accept team invitation (#8300)
- fix: Drain rethinkdb pool after running all migrations (#8315)
- fix(rid): Long team names truncate instead of wrapping (#8311)
- fix: update the default enterprise plan ID (#8320)
- fix: dumpHeap to /tmp directory (#8325)
- fix: show all slack channels in dropdown (#8329)
- fix: better description for failed to execute removeChild on Node error (#8333)

### Changed

- chore(prompt-to-join): disable buttons when running accept request mutation(#8297)
- chore: remove slackin broken link from readme (#8307)
- chore: remove rethink templates (#8217)
- chore: refactor updateUserProfile (#8295)
- chore(prompt-to-join): allow non-verified emails (#8313)
- chore: refactor FileStoreManager API (#8294)
- style: updating plans UI for mobile screens (#8075)
- chore: use git clean under the hood of yarn clean (#8342)

## 6.106.0 2023-May-31

### Added

- feat(suggest-groups): click button to group reflections (#8132)

### Fixed

- fix(rid): Fix changing prompt colors in activity library (#8279)
- fix(recurrence): Incorrect start times due to timezone weirdness (#8269)
- fix(summaries): Race condition around bulk task exports (#8287)

## 6.105.1 2023-May-31

### Fixed

- fix: dumpHeap PROJECT_ROOT

### Changed

- chore(share-summary): Add feature flag (#8249)

## 6.105.0 2023-May-24

### Added

- feat(summaries): Bulk task export button (#7933)
- feat(checkout-flow): handle 3D Secure cards (#8162)
- feat(standups): Meeting ended integration notification (#8258)
- feat(retros-in-disguise): added standup activity details (#8199)
- feat(Team Health): add new stage to retrospective (#7942)
- feat(rid): Sidebar for standups + checkins (#8226)
- feat: mutable category (#8159)
- chore(metrics): Add event parameter is_patient_0 to GA4 sign up events (#8223)
- feat(rid): Add feature flag based on params for email + google signups (#8211)
- feat(prompt-to-join): Add teammate mutation (#8160)
- feat: Don't show discussion mention toast if already on stage (#8270)

### Fixed

- chore: update max token limit (#8267)
- fix(copy): Make copy for ending meeting consistent (#8256)
- fix: Fix team change in new meeting window (#8253)
- fix(tiptap): Prevent showing edit components in readonly mode (#8259)
- fix(discussions): Fix editing comments in standups + check-ins (#8248)
- fix: NewMeeting dialog rendered the dashboard twice (#8246)
- chore: refactor addFeatureFlagToOrg to updateOrgFeatureFlag (#8244)
- chore(docker): documentation on how to build the docker image locally improved (#8230)
- fix(chore): properly count emojis length (#8116)
- chore: add checkout flow tracking (#8235)
- chore(prompt-to-join): domainJoinRequest - replace string id with auto increment (#8191)
- fix: Add subject explicitly to create Jira key script (#8237)
- fix: regenerate yarn.lock (#8236)
- chore: remove \_\_jsxRuntime path (#8154)
- fix(rid): Navigate to activity lib for floating action button (#8215)
- fix: slack notification race condition (#8197)
- fix(standups): Remove CSV download button in standups (#8255)
- fix: checkbox color overriden by styled components (#8257)

## 6.104.0 2023-May-17

### Added

- feat(recurrence): Prev/next meeting navigation (#8157)
- feat(rid): Enter edit mode automatically for new templates (#8156)
- feat(pipeline): Docker build pipeline (#8030)
- feat(checkout-flow): add billing leader functionality (#8121)
- feat: can edit & delete AI comment (#8164)
- feat: prime new columns on MeetingTemplate (#8081)
- feat(rid): Navigate to activity lib by default from CTA (#8210)
- feat: build no-deps (#8196)

### Fixed

- fix: remove flushall redis on migrate (#8175)
- fix(rid): Ignore category in search empty state (#8144)
- fix: more logs for voting error (#8167)

### Changed

- chore(pg-migrations): message when no migrations need to be run on PG showing it is actually PosgreSQL (#8174)
- chore: ignore generated files in PR size (#8165)
- chore: Verify all checked in generated files are clean (#8161)
- chore: AI opt out at org level (#8163)
- chore(deps): bump vm2 from 3.9.17 to 3.9.18 (#8198)
- chore: remove node-fetch from app code (#8178)

## 6.103.0 2023-May-05

### Added

- feat(retros-in-disguise): Prompt user to use org scope (#8120)
- feat(retros-in-disguise):Create new poker template (#8143)
- feat(retros-in-disguise): Poker details view (#8131)
- chore(prompt-to-join): Allow to open add teammate dialog from the snackbar (#8136)
- feat(suggest-groups): Add suggestGroups org feature flag (#8130)
- feat: add mainCategory and illustrationUrl to MeetingTemplate (#8074)

### Fixed

- fix: subscribe to acceptInvite paylods in subscription (#8127)

## 6.102.0 2023-May-3

### Added

- feat(retros-in-disguise): added create new activity view (#8069)
- feat(rid): Edit Mode (#8108)
- feat: add more dd tracing (#7774)
- feat(templates): Share to org by default (#8129)

### Changed

- chore: remove User table from RethinkDB (#8115)
- chore: bump webpack to secure version
- chore: generate kysely schema in dev (#8114)
- chore(security): bump vulnerable packages (#8135)

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

- fix: show invoice coupons in parabol (#7711)
- chore: fix case-sensitive (#7749)
- fix: yarn dev remove graphiql from dll (#7750)
- fix(recurrence): Don't restart meetings on archived teams (#7747)
- fix: 'Updated time/Created time' is not instantaneous on task cards (#7254)
- fix: Fix server error when joining a team by invitation link (#7775)

### Added

- chore(teams-limit): send locked & warning email (#7637)
- feat(recurrence): Stable link for meeting series (#7707)
- feat(teams-limit): add 7 days reminder notification and snackbar (#7677)
- feat(recurrence): Recurrence-specific meeting card (#7716)
- feat(recurrence): Added advanced recurrence settings (#7585)
- feat(checkout-flow): left sidebar (#7733)
- feat: add seasonal retros (#7760)
- feat(standups): added options menu tooltip (#7768)

### Changed

- chore: Invert meetingHistoryLimit feature flag (#7725)
- chore: prevent new rethinkdb migrations in the database/migrations
- chore(teams-limit): avoid showing nagging snackbar if the limit is fixed
- chore: Switch to review stats package (#7753)
- chore(metrics): Do not call identify() on feature flag changes (#7752)
- feat: create bundles without node_modules (#7402)
- chore: remove user feature flag (#7765)
- chore: removed beta badge from standups (#7767)
- chore(teams-limit): Remove scheduled jobs
- chore(ai-summary): track no stats in Slack summary (#7759)
- chore(dx): add updateCache function to dataLoader (#7758)

## 6.91.1 2023-Feb-14

### Fixed

- Sometimes meetings could not be closed (#7769)

## 6.91.0 2023-Feb-08

### Fixed

- Bundle tutorial thumbnail (#7742)
- fix(ai-summary): summary references "the text" (#7739)
- chore(deps): bump webpack, undici (#7737)
- chore(deps): bump ua-parser-js from 0.7.31 to 0.7.33 (#7683)
- chore(deps): bump deps to fix vulns (#7730)
- chore(deps): bump http-cache-semantics from 4.1.0 to 4.1.1 (#7708)
- fix: Profile name length should have the upper limit (#7425)

### Added

- chore: Migrate MeetingTemplate to PG (Phase 1 of 3) (#7679)
- chore(checkout-flow): add checkout feature flag (#7709)

### Changed

- chore: update team invite email (#7710)
- chore(ai-summary): update meeting summary url (#7705)

## 6.90.0 2023-February-1

### Fixed

- Use stripe invoice.paid event instead of invoice.payment_succeeded (#7690)
- Renamed 'next activity' to 'current activity' in ended meeting badge (#7691)
- Line breaks in comments now work on Android (#7438)
- Added missing prompts in starfish retro template (#7660)
- Fixed prompt highlight color does not cover the full-height of the column (#7416)
- Delete empty groups (#7673)
- chore(metrics): Add isPatient0 property to sign_up events emitted by GA4 (#7680)
- fix: Meetings with invalid facilitator stage can now be opened and closed (#7675)

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

- fix: update non-anonymous Reflect description (#7651)
- fix(ai-summary): remove AI comment from comment count (#7648)
- fix(ai-summary): update Parabol AI picture (#7657)

### Changed

- chore(metrics): emit sign_up events from GA4 client side (#7635)
- perf: moved global style creation outside of the render cycle (#7598)
- chore: sendToSentry if unable to create topic summary (#7665)

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

- CircleCI: split backup from deployment (#7389)

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

- feat(metrics): Add metrics about disableAnonymity in retro meetings (#7171)

### Fixed

- fix: Fix cannot read email of undefined in ErrorBoundary (#7198)
- fix: 'Estimate phase is already complete' error message (#7194)

### Changed

- style(lint): run yarn format on server side (#7186)
- ci: update to Lerna V5 and integrate with Nx (#7184)
- ci: setting write permissions to the PR for external contributor (#7195)
- chore: add Standup smoke test into the testing basics (#7189)
- chore: Weekly review stats in Slack (#7205)

## 6.74.0 2022-September-15

### Fixed

- fix: Disallow comments only consisting of whitespace (#7137)
- fix: New Add Meeting button is pushing the Add Team button out of reach (#7157)
- fix(demo): prevent demo meeting auto-start after page refresh (#7131)
- fix: card quick return to original position without hangs (#7138)
- fix: Misleading error message when inviting existing team mate (#7159)
- fix: Long title create UI issue on mobile (#7168)
- fix: only check clientGraphQLServer for isDemoRoute (#7176)
- fix(poker): fix an bug where task estimate is not written to DB when it's a Parabol task (#7170)

### Changed

- chore: Automatically add reviewers (#7172)

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

- fix: Update stripe.subscription.create prorate parameter (#7119)

## 6.72.0 2022-August-25

### Added

- feat: Update location of "add meeting" to left sidebar (#7012)
- feat(standups): Recurrence - stopRecurrence mutation (#7023)
- feat(standups): Recurrence - processRecurrence mutation (#7041)
- feat: create azure issue (#7053)
- feat(retro): prompt user to go to next phase (#6942)
- feat(tiptap): Emoji Support (#7102)

### Fixed

- fix: show the team lead first in the preview of team selector (#7091)
- fix(metrics): Move identify inactive up to within changePause() (#7083)
- fix: title of the reflection columns should not be italic (#7044)
- fix: Contrast of selected highlight of the current phase is low (#6940)
- fix: hyperlink default focus (#7078)
- fix: demo comments are always anonymous (#7065)
- fix: center new meeting dialog slides on mobile (#7079)
- fix: support documentation easier to find in-app (#7080)

### Changed

- chore: update vscode import settings (#7077)

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

- fix: Email summaries not sending for non-standup meetings.

## 6.70.0 2022-August-10

### Added

- feat(graphiql): persist schema for tabs (#6813)
- feat(metrics): Add isActive and featureFlags as new User Properties for Segment identify calls (#6997)
- feat(standups): startRecurrence mutation (#6957)
- feat(metrics): identify user's tier upon login (#7003)
- feat(metrics): Use HubSpot Private apps access token for HubSpot calls ( #7010)

### Fixed

- fix(resetPassword): Reset request count daily (#6955)
- fix: add billing info (#7000)
- fix: fix truncated sprint poker description in new meeting dialog (#7027)
- fix(metrics): remove duplicate viewerId in various Segment events (#7009)
- fix: bug that set org count to 0 (#7008)
- fix(standups): Update 'lastMeetingType' after a team prompt meeting starts (#7029)

## 6.69.0 2022-August-03

### Added

- feat(standups): Added beta badge to standups on new meeting view (#6961)
- feat(standups): Customized start standup notification (#6879)
- feat(standups): Summary Page (#6885)

### Fixed

- fix: Text in reflection cards is not selectable during vote period (#6924)
- fix: allow to go to the discuss phase without voting (#6966)
- fix: css mobile version use template button (#6824)
- fix(metrics): update activeUserCount & activeTeamCount for companies in HubSpot more often (#6983)

### Changed

- feat: remove manual pausing (#6962)
- feat: removed standups feature flag (#6953)
- feat(standups): Rename Async standup -> standup (#6991)
- feat(metrics): Refactor meeting related events (#6981)
- chore: upgrade stripe (#6895)

## 6.68.0 2022-July-27

### Added

- feat: New meeting dialog is now a modal (#6866)
- feat: New meeting type carousel (#6950)
- feat: mattermost info icon (#6911)
- feat(standups): Beta badge within meeting (#6928)
- feat(metrics): Add more Segment events to Standups (#6908)
- feat(Azure DevOps): Add SaaS url to sprint poker estimation (#6892)

### Fixed

- fix: impersonate user bug (#6901)
- fix: Added dismiss button to snackbar messages (#6847)
- fix: add query parameter to identify the page source (#6967)
- chore: Fix browser translation (#6927)

### Changed

- feat(chore): edit PR template to add Metrics Representative (#6770)
- chore(deps): bump terser from 4.8.0 to 4.8.1 (#6903)

## 6.67.0 2022-July-20

### Added

- feat(Azure DevOps): Adding additional project types (#6593)
- feat(Azure DevOps): Add global provider (#6808)

### Fixed

- fix: access more than 10 Jira projects in task footer (#6881)

### Changed

- feat: Improve clarity of Integrations page (#6804)

## 6.66.0 2022-July-13

### Changed

- chore(poker): use generic components for GitHub and GitLab (#6782)
- feat(standups): Decrease top/bottom list margins in standup response editor (#6823)
- feat(standups): Changed standups default title to contain a date, not seq number (#6857)
- refactor: new GitHub & Jira issue queries (#6819)
- chore: update invite modal illustration (#6859)

### Fixed

- chore(deps): bump parse-url from 6.0.0 to 6.0.2 (#6853)
- fix(standups): Do not show active standup as completed on meeting dashboard (#6816)
- fix(demo): fix timer of demo meeting (#6865)
- chore(deps): bump moment from 2.29.3 to 2.29.4 (#6860)
- fix(security): package bumps for dependabot fixes (#6874)
- fix(dd-trace): enabled comes from env var (#6876)
- feat(standups): Display standups as active instead of started (#6878)

### Added

- feat(standups): Basic editor bubble menu (#6812)
- feat(standups): Allow facilitator to update the standup meeting title (#6821)

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

- feat: add integrations task for first-time users, use jsdom to attach…
- feat: add team charter template (#6745)
- feat(Onboarding): Added demo link to empty meeting dash (#6704)
- feat(insights): toggle insights (#6672)
- feat(Onboarding): Added video tutorial to empty meetings dash (#6705)
- feat(metrics): merge 'Upgrade to Pro' and 'Enterprise invoice draft'
- feat(standups): Make response in discussion drawer scrollable (#6753)
- feat(insights): Add /usage route (#6687)

### Fixed

- fix(poker): Fix wrong controls when estimating Parabol tasks (#6716)
- fix: center add/start meeting button content (#6732)
- fix: handle duplicates in changeEmailDomain (#6725)
- fix: updates caniuse-lite version in yarn lock file (#6736)
- fix(standups): reduced list padding in standups response (#6754)
- fix(standups): removed user select none property from standup respons

### Changed

- chore: update release_test.md (#6717)
- refactor: update createFragmentContainer to usePaginationFragment (#6431)
- chore(dx): delete remaining generated pg queries (#6752)
- refactor: Stop writes to RethinkDB Team table (#6239)
- chore: fix delete team migration (#6763)
- chore: Refresh HubSpot chat widget on page changes (#6759)

## 6.62.2 2022-June-12

### Added

- feat: Add start meeting button to top bar (#6707)
- feat: change email domain (#6708)
- feat: remove auth identity (#6713)

### Fixed

- fix(jira): Fix add missing jira field new algorithm (#6722)

## 6.62.1 2022-June-10

### Fixed

- Fixed some retrospective prompts for existing meetings

## 6.62.0 2022-June-9

### Added

- feat(restrictDomains): Add table and mutations (#6476)
- feat(standups): Update relative createdAt automatically (#6658)
- feat(domainStats): Support querying domain stat fields (#6664)
- feat(integration-tests): add more testing to the 2-minute demo (#6183)
- feat(restrictDomains): Add restriction to acceptTeamInvitation (#6487)

### Fixed

- fix: github repos filter menu shows limited selection (#6627)
- fix(sprint-poker): Prevent kicking facilitator off the meeting while modifying the scope (#6667)
- fix(jira): Show meaningful field update error for team-managed projects (#6656)
- fix bad merge on Organization.ts (#6682)
- fix(Retro Templates): Added missing prompts (#6671)
- fix(jira): Handle a case with a huge number of Jira projects and avoid timeout error when trying to fix Jira field automatically (#6676)
- fix(standups): Discussion thread drawer is cut off on mobile (#6695)

### Changed

- chore(deps): bump protobufjs from 6.11.2 to 6.11.3 (#6669)
- chore(deps): bump sharp from 0.30.3 to 0.30.5 (#6665)
- chore(dx): remove generated pg files from git (#6519)

## 6.61.0 2022-June-1

### Added

- feat(jira-server): Add pagination of results in sprint poker (#6607)
- feat(standups): Card ordering w/ animated transitions (#6618)
- feat(standups): Improved standups options button size (#6629)
- feat(jira-server): Save and allow to reuse recent search queries in the scope phase of poker meeting for JiraServer (#6551)
- chore: added PR template (#6565)
- feat(standups): Basic editable prompt (#6640)

### Fixed

- fix(standups): Include TeamPromptMeetingMember on MeetingMember type (#6352)
- fix(Sprint Poker): An exception could occur when modifying the scope in fast succession (#6599)

## 6.60.0 2022-May-25

### Added

- feat(Jira Server): Use the newer Jira Software logo (#6578)
- feat(standups): Response Reactjis (#6407)
- feat(standups): Summary Card (#6529)
- feat(standups): Sending meeting completed event when standup ends (#6587)
- feat(Azure DevOps): Correctly format Sprint Poker comments as HTML (#6597)
- feat: added avatar group in standups (#6614)
- feat(metrics): migrate and consolidate integration related metrics (#6617)
- feat(gitlab): refresh gitlab tokens (#6594)

### Changed

- chore: added PR template (#6565)
- chore(DX): Fix Postgres DB path in dev.yml (#6486)
- docs: Fix code policy link in PR template (#6600)
- refactor: handle default value for isOnboardTeam (#6598)
- chore: Convert components using HOCs to function components (#6591)
- chore: Migrate withAtmosphere -> useAtmosphere (#6595)
- chore: remove gitlab flag (#6619)

### Fixed

- fix: Due date month could sometimes not be set to the current month (#6581)
- fix: pr template location (#6586)
- fix: display search on archived tasks page (#6548)
- fix(metrics): fix the bug where user deletion event won't update HubSpot (#6542)
- fix: added write permission to pull request labeler workflow (#6603)
- fix: stop-color warning in SVG (#6612)
- fix(jira): Fix server error when pushing task to jira (#6613)
- fix: Enforce mapping completeness for 'meetingTypeToIcon' (#6611)

## 6.59.0 2022-May-18

### Added

- chore: added PR labeler workflow (#6525)
- feat(standups): Activities from other team members get real-time updates (#6504)
- feat(standups): Integrate response cards with discussion drawer (#6469)
- feat(standups): Place viewer's card at the start of the list (#6559)
- feat(notifications): Refactor Slack/Mattermost into NotificationHelper (#6262)
- feat: Notifications support for MS Teams (#6494)
- feat(Jira Server): Voting to different fields in Sprint Poker is now supported (#6437)

### Changed

- docs: Added general rules to code review policy (#6507)
- docs: Added code review experiment proposal (#6508)
- refactor: Set updateAt field via a Postgres trigger (#6493)
- chore: remove MAX_GITLAB_POKER_STORIES (#6547)
- chore: remove GitLab feature flag (#6554)
- chore: readd gitlab feature flag (#6566)

### Fixed

- fix(devOps): reduce max pg connections to 30 (#6521)
- fix: ignore updateAt field in checkTableEq for Teams (#6490)
- fix: nested GitLab query batching (#6541)
- fix: increase initial page size for archived tasks (#6555)

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

- feat(standups): upsertTeamPromptResponse (#6333)
- feat(ado): Initial Azure DevOps integration (#6260)
- feat(jira-server): Allow searching for issues in Sprint Poker (#6406)
- feat(sprint-poker): Can vote on GitLab issue (#6398)
- feat(sprint-poker): Push task to GitLab (#6427)

### Changed

- chore: Create manualTestingGuide.md (#6426)
- chore: removed unused video related components (#6497)

### Fixed

- fix(rethinkdb): attempt to fix the table rename (#6480)

## 6.56.0 2022-April-27

### Added

- feat(sprint-poker): Track GitLab events (#6367)
- feat(standups): Responses grid with static prompt (#6353)
- feat(standups): Response Cards (#6392)
- feat(standups): Discussion Drawer (#6370)
- feat(standups): Standup UI - last updated time (#6557)
- feat(CI): use prod build for integration tests (#6379)
- feat(lint): Lint client (#6335)
- feat(DX): Fast dev mode (#6337)
- feat: Update illustration of empty discussion threads (#6423)

### Changed

- docs: Update CONTRIBUTING (#6432)
- chore(deps): bump nconf from 0.11.3 to 0.11.4 (#6438)
- refactor: update renderQuery to Suspense + Relay Hooks #5297 (#6251)

### Fixed

- fix: viewerMeetingMember can be undefined (#6441)
- fix: ignore comparison order for equality (#6411)

## 6.55.0 2022-April-20

### Added

- feat(jira-server): sprint poker vote to comment (#6341)
- feat(sprint-poker): Add GitLab issue (#6267)
- feat(sprint-poker): Search GitLab issues (#6290)
- feat(sprint-poker): New Poker Scope UI (#6344)
- feat(standups): Options menu - end meeting (#6342)
- feat: Display a message when there are no more items to paginate (#6338)
- chore: Track integrations in createTask (#6332)
- chore(dx): Don't truncate TypeScript types (#6387)

### Changed

- build: update sharp library (#6383)

## 6.54.0 2022-April-13

### Fixed

- fix(standups): Include TeamPromptMeetingMember in MeetingMember type resolution

### Added

- feat(gitlab): bump nest-graphql-endpoint (#6363)
- feat(scale): give a pubsub channel to each socket server (#6317)
- feat(standups): Top Bar Back Button (#6318)
- feat(standups): Top Bar Component Stub (#6307)

### Changed

- refactor(requireSU): Remove requireSU (#6330)

## 6.53.0 2022-April-06

### Fixed

- fix(lint): faster, deterministic linting (#6313)

### Added

- feat(standups): Added end team prompt mutation (#6250)
- feat(sdl): Add SDL to public schema (#6263)
- feat(standups): Integrate TipTap (#6255)
- feat(jira-server): add issue to poker scope (#6214)
- feat(impersonate): keep impersonate token until last tab closes (#6300)
- feat(integrations): save favorite integration to local storage (#6331)

### Changed

- gitignore github/gitlabTypes
- refactor(lint): Lint server (#6329)

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

- feat(standups): Added empty team prompt meeting component (#6170)
- More typesafety for GraphQL code (#6167
- chore: enforce conventional commit PR titles (#6258)
- Add flow diagram for services (#6235)
- GitLab Issues Functionality (#6160)

### Changed

- remove icebreaker question (#6142)
- Remove backfilling invoices logic from migration (#6237)
- ci: use official postgres image & sync with digital ocean version (#6182)
- chore: remove postcommit git command (#6253)
- feat: allow admins to call set org user role mutation (#6148)
- feat: disable rate limiter in test (#6146)
- chore(deps): bump node-forge from 1.2.1 to 1.3.0 (#6256)
- chore(deps-dev): bump minimist from 1.2.5 to 1.2.6 (#6264)
- chore(sdl): codemod it all (#6228)
- chore: Remove LogRocket (#6266)

### Fixed

- Fix type mismatch GraphQL (#6151)
- chore(noImplicitAny): fix more errors (#6161)
- fix(sdl): Default resolveType on mutation payloads (#6270)

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
- Security: Bump follow-redirects (#6044)
- Security: Bup vm2 (#6057)
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
- chore: improve GH issue templates (#5962)
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
- SECURITY: bump react-refresh-webpack-plugin #5896
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
- Spotlight: support searchQuery business logic for similarReflections (#5469)
- Spotlight: animate remote reflection when it enters or leaves Spotlight (#5600)

### Fixed

- Fix remotely ungrouped results position in Spotlight (#5708)
- Recently used emojis are managed using local storage (#5656)
- Returning refreshed token from fresh atlassian auth loader (#5729)

## 6.38.0 2021-Nov-24

### Added

- Spotlight: remote animation edge cases (#5621)
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

- build(deps): bump tmpl from 1.0.4 to 1.0.5 (#5618)
- build(deps): bump vm2 from 3.9.3 to 3.9.5 (#5619)
- bump graphiql (#5646)
- add final newline on save vscode (#5647)
- Rename and document dataLoader (#5649)

## 6.36.0 2021-Nov-10

### Added

- Spotlight: groups UI (#5390)
- GitHub: Persist favorite queries (#5435)
- Spotlight: drag source to result (#5412)
- Spotlight: drag result to source (#5414)
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
- Redis: Persist discussion commentors #5022
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

- TypeError: Cannot destructure property 'atlassian' of 'r' as it is undefined. #4736
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

- Organizations: teams can be tied together into organizations
- User trials & billing: hey look! A business model!
  - New & grandfathered users start a 30 day trial
  - Trial & access expiry
  - Payment information & stripe integration
  - Invoicing
- Notifications: a new channel to communicate with our users
- Portals: we're using [react-portal-hoc](https://github.com/mattkrick/react-portal-hoc)
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

- Fixed: #322, #323, #334, #335, #336

## v0.7.0 - 2016-Oct-04

### Added

- Now using [aphrodite](https://github.com/khan/aphrodite) for styling
- Me dashboard now has buttons to add new outcomes for Actions and Projects
- Me dashboard now has a filter option to see Projects by a specific team

### Removed

- Removed [react-look](https://github.com/rofrischmann/react-look)

### Fixed

- Fixed: #124, #190, #221, #227, #252, #276, #282, #290, #295, #302, #305,
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
