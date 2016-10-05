# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

This CHANGELOG follows conventions [outlined here](http://keepachangelog.com/).

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
