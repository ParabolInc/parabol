# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

## v0.17.1 - 29-Mar-2017
### Fixed
- #859 infinite redirect loop when deleting the last phaseItem

## v0.17.0 - 27-Mar-2017
### Added
- Start of many copy edits (watch for more changes in future versions),
  including #716 meeting lobby updates

### Fixed
- #643 summary email subject line
- #839 max chars for projects
- #857 mystery notification

## v0.16.12 - 22-Mar-2017
### Added
- #344 meeting agenda list now reflects location of Facilitator and participants
- #837 added `Facilitator` badge and styling added to meeting Facilitator

### Fixed
- Better fix for #850 r.createdAt.getTime is not a function

## v0.16.11 - 22-Mar-2017
### Fixed
- Hotfix #850 r.createdAt.getTime is not a function

## v0.16.10 - 22-Mar-2017
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

## v0.16.9 - 20-Mar-2017
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

## v0.16.8 - 14-Mar-2017
### Fixed
- #811 Rejoin facilitator button cursor is pointer
- fix orgName update
- Dependency bumps & linting

## v0.16.7 - 13-Mar-2017
### Fixed
- #808 hey I want to pay!

## v0.16.5 - 11-Mar-2017
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

## v0.16.0 - 25-Feb-2017
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

## v0.15.3 - 11-Feb-2017
### Added
- OutcomeCard components (Projects, Action) now re-render their last-updated
  time on a smart timer
### Fixed
- Generate 'Meeting Completed' on server-side, client was not reliably
  sending this event

## v0.15.2 - 01-Feb-2017
### Fixed
- Incremented `package.json` version to match tag – oops!

## v0.15.1 - 31-Jan-2017
### Added
- `(<TAB> saves)` string to OutcomeCard components when editing
- `npm run test:xunit` command for CircleCI 2.0

## v0.15.0 - 30-Jan-2017
### Added
- When version is upgraded, we now emit a toast asking the user to upgrade
  their client version
- Markdown support added to Action and Project cards

## v0.14.2 - 29-Jan-2017
### Fixes
- #646 the first-time message meeting completion message was not displaying
- #659 auth0 profile picture meta-information now updated when user changes
  profile image

## v0.14.1 - 16-Jan-2017
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

## v0.14.0 - 09-Jan-2017
### Added
- Implements #595; upload of user avatar images to S3
  - Works by securely signing S3 PutObject URL
    see [documentation](./docs/s3.md)
- `npm run build:deploy` and `npm run build:min` commands

## v0.13.6 - 20-Dec-2016
### Added
- User impersonation, login as a user with knowing their credentials on route
  `/admin/impersonate/:userid`
- Expanded requireAuthAndRole with optional args
- Added segment.io event on 'New Team' creation

## v0.13.5 - 12-Dec-2016
### Fixed
- #556 archived cards no longer let you change the owner
- #557 blur agenda item input after submit
- #559 participants stopped following the leader after meeting "Last Call"

## v0.13.4 - 08-Dec-2016
### Fixed
- #564 Fix email validation

## v0.13.3 - 05-Dec-2016
### Added
- Validations system (see: `src/universal/validations/legitify.js`)
  - Added client and server validations for all mutations
- Allow team leaders to skip step 3 of the welcome wizard (see #354)
- S3 deploys into versioned directories within bucket (see #493)

### Fixed
- #547 welcome wizard step 3 cleanup
- #549 welcome wizard step 3: removing email calls submit

## v0.13.2 - 27-Nov-2016
### Added
- 'Player joined' message when teammate accepts invitation

### Fixed
- #543 unable to end action meeting

## v0.13.1 - 25-Nov-2016
### Added
- Can now filter by team member on team dashboard Views
- Updated FontAwesome to v4.7.0

### Fixed
- #514 Relabeling Actions and Projects during agenda processing
  - Copy now reads "New private action" and "New team project"
- #536 Cashay warning while proceeding through check-in round

## v0.13.0 - 22-Nov-2016
We tagged v0.13.0 on our 1,300th commit. What a coinkidink!
### Added
- Drag-and-drop everywhere: My Dashboard (actions, projects),
  Team Dashboards (meeting agenda queue, projects), meeting project updates,
  and meeting agenda items

### Fixed
- #508 Agenda items collapse around 1265px
- #517 Server exception encountered when generating meeting summary

## v0.12.1 - 15-Nov-2016
### Fixed
- #518 Removed team member does not redirect away while on team dashboard

## v0.12.0 - 15-Nov-2016
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

## v0.11.0 - 05-Nov-2016
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

## v0.10.0 - 02-Nov-2016
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


## v0.9.6 - 29-Oct-2016
### Added
- Automatic election of new facilitator when old facilitator disconnects
- Refactor of socket management; added container decorator to maintain
  socket connection

### Fixed
- #438 fixed TypeError: Cannot read property 'id' of undefined
- #447 unable to signout and login properly
- Fixed race condition landing on meeting summary route at end of meeting
- Fixed short urls

## v0.9.5 - 25-Oct-2016
### Fixed
- #433 server crashing on localhost
- #440 sentry.io bug on `id` field
- #445 summary rendering “0” when there aren’t members without new outcomes

## v0.9.4 - 24-Oct-2016
### Fixed
- #428 makeAppLink
- #429 race to meeting summary and lobby
- #430 generate only 1 email
- #431 killMeeting

## v0.9.3 - 24-Oct-2016
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

## v0.8.1 - 19-Oct-2016
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

## v0.8.0 - 18-Oct-2016
### Added
- End of meeting summary

## v0.7.5 - 15-Oct-2016
### Added
- Temporarily wired meeting last call button to endMeeting mutation to enable
  more user testing
- Re-added piping to reload server code when running `npm run dev`

### Removed
- Double dependency in `package.json` on `react-hot-loader`

### Fixed
- Re-added actions subscription channel, was still being used by user dashboard

## v0.7.4 - 12-Oct-2016
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

## v0.7.1 - 05-Oct-2016
### Fixed
- Fixed: #322, #323, #334, #335, #336

## v0.7.0 - 04-Oct-2016
### Added
- Now using [aphrodite](https://github.com/khan/aphrodite) for styling
- Me dashboard now has buttons to add new outcomes for Actions and Projects
- Me dashboard now has a filter option to see Projects by a specific team

### Removed
- Removed [react-look](https://github.com/rofrischmann/react-look)

### Fixed
- Fixed: #124, #190, #221, #227, #252, #276, #282, #290, #295, #302, #305,
  #307, #313

## v0.6.3 - 28-Sep-2016
### Fixed
- Agenda processing order fix for issue #294

## v0.6.2 - 27-Sep-2016
### Added
- Processing of agenda items during meeting into new projects and actions

### Fixed
- Add/remove rethinkdb entity from cache problem, see: https://github.com/mattkrick/cashay/issues/125
- Editors multiplayer field regression

## v0.6.1 - 23-Sep-2016
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

## v0.5.3 - 30-Aug-2016
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

## v0.4.1 - 16-Aug-2016
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


## v0.4.0 - 13-Aug-2016
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


## v0.3.0 - 04-July-2016
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
