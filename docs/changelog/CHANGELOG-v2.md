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
