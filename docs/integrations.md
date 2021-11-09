# Integrations

## Jira and GitHub

Some guidelines how we handle the user's integration of GitHub or Jira, especially in which cases the user's authentication might be used by someone else than the user.

A user's integration might only be reused by someone else if the user previously connected the task with their credentials in some form.
If a user has an integration set up, their authentication is used to perform actions with tasks.
In some cases if the user has no integration set up, we will fall back to the assignee's authentication.

This is how it should be in the future and does not necessarily reflect current state:

- [ ] **reading** a task uses **any team member's auth**
      in the preferred order of:
  - `task.integration?.accessUserId`
  - fallback to viewer
  - fallback to the team lead (reason being is a team lead is less likely to leave a team. maybe this is too optimistic?)
  - fallback to any other member
- [x] **pushing a task** requires **viewer auth or assignee's auth**, but in both cases a comment will be added if viewer !== assignee
- [x] adding tasks in **scoping** requires **viewer's auth**
- [ ] adding task **estimates** uses **viewer's auth or assignee's auth** (Most likely just added in scoping by the assignee, but even when added to the board before it's little risk as estimating is a team activity)
- [ ] **adding fields** to project requires **viewer's auth**
- [ ] when **moving a task between teams** we check who's auth is used for this task
  - if the viewer has an integration for the target team, use that
  - else if `accessUserId === userId` (**viewer's auth** since switching teams is only allowed for viewer's own tasks), then we ask them to add the integration to the new team in UI and move it over automatically in server
  - else if `accessUserId !== userId`, then we check if the user pushing the task initially has an integration set up for the target team and move the task if present, otherwise we report an error
