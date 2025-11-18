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
