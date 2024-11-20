---
name: Release test
about: Issue created when releasing a new version
title: Release test v
labels: ''
assignees: ''
---

- The basic checklist is required
- Adding tests from merged PRs is optional

## The basics

Run through this list at least once at [staging](https://action.parabol.fun):

- [ ] Smoke tested the [Demo](https://action.parabol.fun/retrospective-demo), unauthenticated
- [ ] Created an account
- [ ] Verified invite via mass link works (Team > Invite Button > Invite Link, visit URL in an incognito window)
- [ ] Verified invite via email works. It will show as [logs in Datadog](https://app.datadoghq.com/logs?query=kube_namespace%3Aparabol%20env%3Astaging%20&cols=host%2Cservice&index=%2A&messageDisplay=inline&refresh_mode=sliding&storage=hot&stream_sort=desc&viz=stream&from_ts=1699266779323&to_ts=1699267679323&live=true).
- [ ] Added Slack, verified meeting notifications (use `#t_product_actiontime`)
- [ ] Added Mattermost, verified meeting notifications (check the test webhook in [Parabol Mattermost](https://mattermost.parabol.fun/parabol/integrations))
- [ ] Added GitHub, verified issue created (use `ParabolInc/publictestrepo`)
- [ ] Added Jira, verified issue created (use `parabol-2`)
- [ ] Added GitLab, verified issue created
- [ ] Added JiraServer, verified issue created
- [ ] Smoke tested the Retro meeting with 2 players
- [ ] Smoke tested the Sprint Poker meeting with 2 players
- [ ] Smoke tested the Team Check-in meeting with 2 players
- [ ] Smoke tested the Standup meeting with 2 players
- [ ] Smoke tested cards on the dashboard
- [ ] Created a 2nd team
- [ ] Created a 2nd organization
- [ ] Upgraded to Team (Credit card number: `4242 4242 4242 4242`, expiration date: any month in the future, CVC: `123`)
- [ ] Upgraded to Team with a 3D Secure card (Credit card number: `4000 0000 0000 3220`, expiration date: any month in the future, CVC: `123`)
- [ ] Tried and failed to upgrade with a card with insufficient funds (Credit card number: `4000 0000 0000 9995`, expiration date: any month in the future, CVC: `123`). Error feedback is shown in the UI.
- [ ] Smoke tested the app on a mobile device (e.g. navigate between views, smoke test a Retro meeting, etc.)
- [ ] Test previously existed meetings to make sure that existing data is not corrupted
- [ ] Create a task in the discussion thread of a meeting
- [ ] Create a comment in the discussion thread of a meeting

## What’s changed

At your discretion, complete the tests for any merged PRs:

- List each PR with a header and link to ([title], #[issue id])
- Copy and paste tests, or note what was tested, in this issue
- Run the equivalent test on staging that you would run in a local environment as closely as possible (e.g. updating the database to simulate cases, etc.)
