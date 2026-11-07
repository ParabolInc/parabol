# Contributing an integration

An integration connects Parabol to a service such as Jira, GitHub or Linear. A task can link to an issue there, Sprint Poker can estimate its issues and push the estimate back, and the retro and standup drawers can list them.

This guide is for adding a new task integration. Read it once before you start, then keep [Linear](../../packages/server/integrations/linear) open as your example.

## How an integration is put together

Every integration has three parts, each in a folder named for the service (`asana`, `clickUp`):

| Part | Where | What it does |
| --- | --- | --- |
| Server definition | `packages/server/integrations/<service>/<Service>ServerIntegration.ts` | Auth, plus the capabilities the server offers: create, read, search, list repos, push estimates |
| Client definition | `packages/client/integrations/<service>/<Service>ClientIntegration.ts` | Name, logo, the connect popup, and the panels the app shows |
| Shared files | `packages/client/integrations/<service>/shared/` | What both sides import: `<service>IntegrationMeta.ts` (service, title, description) and the id codecs |

Each definition is registered once, in [`packages/server/integrations/platform/registry.ts`](../../packages/server/integrations/platform/registry.ts) and [`packages/client/integrations/platform/registry.ts`](../../packages/client/integrations/platform/registry.ts). The rest of the app asks the registries what a service can do instead of checking its name. The client registry is in popularity order, so a new service goes last.

A few rules keep the layers apart. Lint enforces the first two.

- The server can import client files only from `packages/client/integrations/*/shared/`. Files in `shared/` cannot import React, Relay or anything from the server.
- `packages/server/postgres/` never imports from `integrations/`. The JSON shapes stored in columns live in `packages/server/postgres/types`.
- GraphQL resolvers stay in `packages/server/graphql/public/types` and `mutations`. The schema loads those folders flat, so a resolver moved into a subfolder silently stops working. Keep the resolver thin and put the work in `integrations/<service>/`.
- Name every file for what it exports. Never use `index.ts`.

## Quick start

```sh
pnpm integration:new asana --title Asana
pnpm kysely migrate:latest && pnpm pg:generate
pnpm relay:build && pnpm typecheck
pnpm test:server integrations/platform/__tests__/conformance.test.ts
pnpm test:client integrations/platform/__tests__/conformance.test.ts
```

The service name is a camelCase key. It names the files and the env vars, so `clickUp` gives `ClickUpServerIntegration.ts` and `CLICK_UP_CLIENT_ID`. Pass `--description` to set the line shown on the integrations page, and `--dry-run` to see what would change without writing anything.

The script writes:

- the server folder: a definition with a stub for every task capability, an OAuth2 manager, and a task manager
- the client folder: a definition, a connect popup, an icon, the shared meta and an issue id codec with its test
- a placeholder logo in `packages/client/styles/theme/images/graphics/`
- `<Service>IntegrationService.graphql`, and a migration that adds the service to the `IntegrationProviderServiceEnum` database enum. Postgres cannot drop an enum value, so the migration's `down` does nothing

It also adds the service to every list that names services: both GraphQL service enums, the codegen mappers, the stored task shape, the provider types, both registries, the OAuth2 managers, the GraphQL typename maps, the meeting summary export, the global provider setup and `.env.example`. It checks every one of those files first and writes nothing if one has changed shape.

After those commands, typecheck and the server conformance suite pass. The client suite fails until the service has a scoping panel and a work drawer tab (see [Client capabilities](#client-capabilities)). Next, replace each stub that returns "not implemented" with calls to the service, and set `<SERVICE>_CLIENT_ID`, `<SERVICE>_CLIENT_SECRET` and `<SERVICE>_SERVER_URL` in `.env`.

## Server capabilities

A capability is an object on the server definition's `capabilities`. The interfaces in [`ServerIntegrationDefinition.ts`](../../packages/server/integrations/platform/ServerIntegrationDefinition.ts) say exactly what each function takes and returns.

| Capability | What it powers | What you write | Example |
| --- | --- | --- | --- |
| `issueCreate` | Pushing a Parabol task to the service | `initManager`, which returns a `TaskIntegrationManager` that creates the issue and comments on it | `linear/LinearServerManager.ts` |
| `issueRead` | Showing a linked task's issue | `getIssue`, which returns the source of your issue GraphQL type, and `parseIntegrationHash` | `azureDevOps/resolveAzureDevOpsTaskIntegration.ts` |
| `issueSearch` | Saved searches in the Sprint Poker scope tab | `buildQuery`, which checks the search the client sends before it is stored | `linear/buildLinearSearchQuery.ts` |
| `repoList` | The projects a task can be pushed to | `fetchRepos`, `integrationRepoId` and `name` | `linear/fetchLinearTeamsAndProjects.ts` |
| `repoAccess` | Letting someone pick which projects a team reaches through their connection | `fetchAvailableRepos`, and every other capability must respect the choice | `azureDevOps/` |
| `estimatePush` | Sprint Poker writing the final estimate to the issue | the push targets, `pushEstimate`, and the three dimension-field functions | `linear/pushEstimateToLinear.ts` |
| `issueList` | Issues in the retro and standup drawers, and AI standup drafts | `listIssues`. Also add the service to `ServiceEnum.graphql` and `packages/client/components/TeamPrompt/WorkDrawer/inspirationSources.ts` | `linear/listLinearIssues.ts` |

Every service in `TaskServiceEnum` must implement `issueCreate`, `issueRead`, `issueSearch`, `repoList` and `estimatePush`. The conformance suite checks this.

The repo type you return from `fetchRepos` is the class's type parameter, e.g. `extends ServerIntegrationDefinition<AsanaProject>`. Declare it next to the function that produces it. It joins `RemoteRepoIntegration` on its own. Its GraphQL type is the generic `RepoContainer` unless you map another one in [`RepoIntegration.ts`](../../packages/server/graphql/public/types/RepoIntegration.ts).

When the service fails, return an `Error`; don't throw. A `fetchRepos` that returns an `Error` is never cached. Return `null` (or `[]` for lists) when there is nothing to show, such as when the viewer has not connected.

## Client capabilities

| Capability | What it powers | How to build it | Example |
| --- | --- | --- | --- |
| `scoping` | The Sprint Poker scope tab. Required for task services | `makeScopingResults` with a Relay query for your search field, plus a search-meta codec | `linear/LinearScopingResultsAdapter.tsx`, `linear/linearSearchMeta.ts` |
| `workDrawer` | The retro work drawer tab. Required for every service | `makeWorkDrawerPanel` for a panel that needs the meeting, `makeQueryRoot` for one that needs only the team | `linear/LinearClientIntegration.ts` |
| `settings` | Extra controls under the service's row on the integrations page | a `Panel` component | `azureDevOps/AzureDevOpsProjectAccessPanel.tsx` |

Both panels need GraphQL fields to read from. Add a `<service>` field to [`TeamMemberIntegrations.graphql`](../../packages/server/graphql/public/typeDefs/TeamMemberIntegrations.graphql) that returns a `<Service>Integration` type holding your search and list fields. Only the team member themselves can read `TeamMember.integrations` (see `permissions.ts`), and the fields under it inherit that rule.

## The linked task

- **What the task row stores.** `TaskIntegration<Service>` in [`TaskIntegration.d.ts`](../../packages/client/shared/types/TaskIntegration.d.ts) is the `integration` column for your service. The script stores a `repoId` and an `issueId`. Change them to whatever your service needs to find the issue again.
- **The integration hash.** This is the key a client sends back to say which issue it means. Build and split it with `shared/<Service>IssueId.ts`. `parseIntegrationHash` must return `null` for anything it did not produce, because the conformance suite feeds it junk.
- **The issue type.** Add `<Service>Issue implements TaskIntegration` in `packages/server/graphql/public/typeDefs/`, plus a resolver file in `packages/server/graphql/public/types/` with `__isTypeOf` and a codegen mapper. `getIssue` returns its source. `AzureDevOpsWorkItem` and `JiraServerIssue` are written by hand. GitHub, GitLab and Linear issues are stitched in from those services' own GraphQL APIs.
- **Places that still check the issue type.** These show nothing for a new service until you add a case to each:
  - `packages/client/components/IntegratedTaskContent.tsx`
  - `packages/client/components/TaskIntegrationLink.tsx`
  - `packages/client/components/PokerEstimateHeaderCard.tsx`
  - `packages/client/hooks/useMakeStageSummaries.ts`
  - `packages/client/modules/email/components/SummaryEmail/ExportToCSV.tsx`
  - `packages/client/mutations/CreateTaskMutation.ts`
  - `packages/client/mutations/CreateTaskIntegrationMutation.ts`

## Auth

- **OAuth2** is what the script sets up. On the server, `<Service>OAuth2Manager` exchanges and refreshes tokens; it is registered in [`createOAuth2Manager.ts`](../../packages/server/integrations/platform/createOAuth2Manager.ts). Return the person's id on the service from `authorize` when the API has one. On the client, `<Service>ClientManager` opens the popup. The `/auth/<service>` callback route is shared, so it needs no change.
- **Other strategies** need their own code in [`addTeamMemberIntegrationAuth.ts`](../../packages/server/graphql/public/mutations/addTeamMemberIntegrationAuth.ts): Jira Server uses OAuth1, and Azure DevOps uses PKCE and resolves its own auth. Personal access tokens have no exchange step yet.
- **Where credentials come from.** The instance-wide provider comes from `.env` through [`primeIntegrations.ts`](../../scripts/toolboxSrc/primeIntegrations.ts). Teams and orgs can add their own with the `addIntegrationProvider` mutation. A service shows as available when one of these exists.
- **Extra auth data.** If the auth row stores more than tokens, add its shape to `IntegrationAuthMetaByService` in `packages/server/postgres/types/index.d.ts`.
- **Trust.** Never trust what the client says about scopes or team ids; work them out on the server. Permission checks belong in `permissions.ts`, not in resolvers.

## Testing

The conformance suites run against every registered integration, so a new one is covered as soon as it is registered.

- The server suite ([`conformance.test.ts`](../../packages/server/integrations/platform/__tests__/conformance.test.ts)) checks that the definition:
  - matches its registry key and its shared meta
  - uses enum values the schema knows
  - implements every task capability
  - can refresh an OAuth2 token
  - returns `null` from `parseIntegrationHash` for junk input
  - handles an empty search
  - pushes estimates to known targets, comments included
  - is a `ServiceEnum` source if it lists issues
  - keeps the GraphQL task services and the stored ones in sync, which `pnpm typecheck` checks
- The client suite ([`conformance.test.ts`](../../packages/client/integrations/platform/__tests__/conformance.test.ts)) checks that the definition:
  - matches its shared meta
  - ships a scoping panel exactly when it is a task service
  - ships a work drawer tab
  - has a logo no other service uses

Put tests for your own code in `integrations/<service>/__tests__/` on each side, and mock the service instead of calling it. Before a run, `pnpm test:server` resets a couple of tables and turns off one trigger in the database named in `.env`, so point it at a development database.

## Example integrations

- **Linear**: the smallest complete task integration, using OAuth2.
- **Azure DevOps**: a REST API with every capability, including `repoAccess`.
- **GitHub**: pushes estimates as labels.
- **Google Calendar (`gcal`)**: not a task integration. It only lists events for the drawers.

One naming trap: [`integrations/jira/JiraServerIntegration.ts`](../../packages/server/integrations/jira/JiraServerIntegration.ts) is the server definition for Jira Cloud. Jira Server / Data Center is [`integrations/jiraServer/JiraServerServerIntegration.ts`](../../packages/server/integrations/jiraServer/JiraServerServerIntegration.ts).

## Before you open a pull request

Run `pnpm typecheck`, both conformance suites and `pnpm exec biome check`. Then connect the service in the app and push a task to it. Include a screenshot of the integrations page and of the pushed task in the pull request.
