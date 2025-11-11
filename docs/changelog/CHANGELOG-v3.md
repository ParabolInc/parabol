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
