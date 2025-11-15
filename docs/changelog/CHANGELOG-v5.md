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
