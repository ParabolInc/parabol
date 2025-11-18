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
