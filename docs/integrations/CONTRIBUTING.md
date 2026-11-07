# Contributing an integration

An integration connects Parabol to a service such as Jira, GitHub or Linear. A task can link to an issue there, Sprint Poker can estimate its issues and push the estimate back, and the retro and standup drawers can list them.

This guide is for adding a new task integration. Read it once before you start, then keep [Linear](../../packages/server/integrations/linear) open as your example.

## How an integration is put together

Every integration has three parts, each in a folder named for the service (`asana`, `clickup`):

| Part | Where | What it does |
| --- | --- | --- |
| Server definition | `packages/server/integrations/<service>/<Service>ServerIntegration.ts` | Auth, plus the capabilities the server offers: create, read, search, list repos, push estimates |
| Client definition | `packages/client/integrations/<service>/<Service>ClientIntegration.ts` | Name, logo, the connect popup, and the panels the app shows |
| Shared files | `packages/client/integrations/<service>/shared/` | What both sides import: `<service>IntegrationMeta.ts` (service, title, description) and the id codecs |

Each definition is registered once, in [`packages/server/integrations/platform/registry.ts`](../../packages/server/integrations/platform/registry.ts) and [`packages/client/integrations/platform/registry.ts`](../../packages/client/integrations/platform/registry.ts). Most of the app asks the registries what a service can do; this guide points out each place that still names services. The client registry is in popularity order, so a new task service goes after the existing ones.

A few rules keep the layers apart. Lint enforces the first one.

- Inside `packages/client/integrations/`, the server may import only the `*/shared/` folders. Files in `shared/` may import only other `shared/` folders and `types/constEnums`: no React, no Relay, nothing else from the client and nothing from the server.
- `packages/server/postgres/` never imports from `integrations/`. When a column needs an integration's JSON shape, declare it in `packages/server/postgres/types`, as `RepoAccessMeta` is.
- GraphQL resolvers stay in `packages/server/graphql/public/types` and `mutations`. The schema loads those folders flat, so a resolver moved into a subfolder silently stops working. Keep the resolver thin and put the work in `integrations/<service>/`.
- Name every file for what it exports. Never use `index.ts`.

## Quick start

```sh
pnpm integration:new asana --title Asana \
  --api-url https://app.asana.com/api/1.0 \
  --authorize-url https://app.asana.com/-/oauth_authorize \
  --token-url https://app.asana.com/-/oauth_token
pnpm kysely migrate:latest && pnpm pg:generate
pnpm relay:build && pnpm typecheck
pnpm test:server integrations/platform/__tests__/conformance.test.ts
pnpm test:client integrations/platform/__tests__/conformance.test.ts
```

The service name is a camelCase key that names the folders, the env vars and the OAuth redirect. A one-word brand gets a lowercase key, as `github` and `gitlab` do. The type names come from `--title` when it spells the key, so `clickup --title ClickUp` gives `ClickUpServerIntegration.ts`, `CLICKUP_CLIENT_ID` and `/auth/clickup`. Otherwise they use the key with its first letter capitalized. The key becomes a database enum value, so choose it with care.

The three URLs are for a service everyone reaches at the same address. Pass all three, each an `https` URL:
- `--authorize-url`, where the person approves access. It is written into `<Service>ClientManager`.
- `--token-url`, where the server trades the code for a token. It is written into `<Service>OAuth2Manager`.
- `--api-url`, the base of the service's API. It becomes the global provider's `serverBaseUrl` in `primeIntegrations.ts`. The stubs make no API calls yet.

For a service each customer runs on their own server, as GitLab can be, pass `--self-hosted` instead of the URLs. Its OAuth paths then resolve against the provider's `serverBaseUrl`. The global provider reads it from `<SERVICE>_SERVER_URL`; team and org providers set their own. Pass `--description` to set the line shown on the integrations page, and `--dry-run` to see what would change without writing anything.

The script writes:

- the server folder: a definition with a stub for every task capability, an OAuth2 manager, and a task manager
- the client folder: a definition, a connect popup, an icon, the shared meta and an issue id codec with its test
- a placeholder logo in `packages/client/styles/theme/images/graphics/`
- `<Service>IntegrationService.graphql`, and a migration that adds the service to the `IntegrationProviderServiceEnum` database enum. Postgres cannot drop an enum value, so the migration's `down` does nothing

It also adds the service to these lists: both GraphQL service enums, the codegen mappers, the stored task shape, the saved-search types, the provider types, both registries, the OAuth2 managers, the GraphQL typename maps, the meeting summary export, the report labels, the global provider setup and `.env.example`. It checks every one of those files first and writes nothing if one has changed shape.

After those commands, typecheck and the server conformance suite pass. The client suite fails until the service has a scoping tab and a work drawer tab (see [Client capabilities](#client-capabilities)).

### After the scaffold

- Replace the stubs. Five return a "not implemented" error: `fetch<Service>Repos`, `pushEstimateTo<Service>`, `describe<Service>DimensionField`, and `createTask` and `addCreatedBySomeoneElseComment` in `<Service>ServerManager`. Four others quietly return nothing: `resolve<Service>TaskIntegration`, `resolve<Service>DimensionFieldKey`, `list<Service>DimensionFields`, and `build<Service>SearchQuery`, which only checks the search and trims it.
- Match the OAuth requests to what the service documents.
  - `<Service>OAuth2Manager` posts a form body with `client_id`, `client_secret` and `grant_type`, plus `code` and `redirect_uri` when authorizing or `refresh_token` when refreshing. Some services want JSON, HTTP Basic credentials, or fewer fields.
  - `<Service>ClientManager` sends `client_id`, `redirect_uri`, `state`, `scope` and `response_type`. Set `SCOPES`, and drop any parameter the service rejects.
  - The endpoints are `TOKEN_URL` and `AUTHORIZE_URL`, set from your flags. With `--self-hosted` they are the placeholder paths `TOKEN_PATH` (`/oauth/token`) and `AUTH_PATH` (`/oauth/authorize`), which resolve against the provider's `serverBaseUrl`. Point them at the service's real paths.
- In the service's OAuth app, register `<app origin>/auth/<service in lowercase>` as the redirect URL.
- Set `<SERVICE>_CLIENT_ID` and `<SERVICE>_CLIENT_SECRET` in `.env`, plus `<SERVICE>_SERVER_URL` with `--self-hosted`. Then restart `pnpm dev` so the global provider picks them up.

## Server capabilities

A capability is an object on the server definition's `capabilities`. The interfaces in [`ServerIntegrationDefinition.ts`](../../packages/server/integrations/platform/ServerIntegrationDefinition.ts) say exactly what each function takes and returns.

| Capability | What it powers | What you write | Example |
| --- | --- | --- | --- |
| `issueCreate` | Pushing a Parabol task to the service | `initManager`, which returns a `TaskIntegrationManager` that creates the issue and comments on it | `linear/LinearServerManager.ts` |
| `issueRead` | Showing a linked task's issue | `getIssue`, which returns the source of your issue GraphQL type, and `parseIntegrationHash` | `azureDevOps/resolveAzureDevOpsTaskIntegration.ts` |
| `issueSearch` | Saved searches in the Sprint Poker scope tab | `buildQuery`, which checks the search the client sends before it is stored, and rejects meta keys it does not know | `linear/buildLinearSearchQuery.ts` |
| `repoList` | The projects a task can be pushed to | `fetchRepos`, `integrationRepoId` and `name` | `linear/fetchLinearTeamsAndProjects.ts` |
| `repoAccess` | Letting someone pick which projects a team reaches through their connection | `fetchAvailableRepos`, returning the same repo type as `repoList`, plus `repoAccess` and `availableRepos` on `<Service>IntegrationService.graphql`, an `isUserViewer('source.userId')` rule for each in `permissions.ts`, and a settings panel. Every other capability must respect the choice | `azureDevOps/` |
| `estimatePush` | Sprint Poker writing the final estimate to the issue | the push targets, `pushEstimate`, and the three dimension-field functions | `linear/pushEstimateToLinear.ts` |
| `issueList` | Issues in the retro and standup drawers, and AI standup drafts | `listIssues`. Also add the service to `ServiceEnum.graphql`, to `packages/client/components/TeamPrompt/WorkDrawer/inspirationSources.ts`, and to the drawer-source list in the server `registry.test.ts` | `linear/listLinearIssues.ts` |

Every service in `TaskServiceEnum` must implement `issueCreate`, `issueRead`, `issueSearch`, `repoList` and `estimatePush`. The conformance suite checks this.

The scaffold declares `<Service>Repo` in `fetch<Service>Repos.ts` and names it in `repoList: RepoListCapability<<Service>Repo>`. Change its fields to what the service returns, and `RemoteRepoIntegration` picks them up. The list is cached. A read that finds it more than a minute old returns the cached list and fetches a new one in the background. When listing takes many requests against a tight rate limit, set `refreshAfterMs` on `repoList` to refetch less often. Its GraphQL type is `RepoContainer`. To use your own, add a type that implements `RepoIntegration`, name it in [`RepoIntegration.ts`](../../packages/server/graphql/public/types/RepoIntegration.ts), and change `repos` in `<Service>IntegrationService.graphql` to match, as Azure DevOps does.

Functions that call the service return an `Error` when it fails and never throw: `fetchRepos`, `fetchAvailableRepos`, `pushEstimate`, `describeDimensionField`, `createTask` and `addCreatedBySomeoneElseComment`. `buildQuery` returns an `Error` for a search it will not store. A `fetchRepos` that returns an `Error` is never cached. The read paths log the failure and return `null` (`getIssue`, `resolveDimensionFieldKey`), `{options: []}` (`listDimensionFields`) or `[]` (`listIssues`).

## Client capabilities

| Capability | What it powers | How to build it | Example |
| --- | --- | --- | --- |
| `scoping` | The Sprint Poker scope tab. Required for task services | `makeScopingResults` with a Relay query for your search field, plus a search-meta codec | `linear/LinearScopingResultsAdapter.tsx`, `linear/linearSearchMeta.ts` |
| `workDrawer` | The retro work drawer tab. Required for every service | `makeWorkDrawerPanel` for a panel that needs the meeting, `makeQueryRoot` for one that needs only the team | `linear/LinearClientIntegration.ts` |
| `settings` | Extra controls under the service's row on the integrations page | a `Panel` component | `azureDevOps/AzureDevOpsProjectAccessPanel.tsx` |

Both tabs need GraphQL fields to read from. As Linear does, add:

- a `<service>` field on [`TeamMemberIntegrations.graphql`](../../packages/server/graphql/public/typeDefs/TeamMemberIntegrations.graphql) that returns a `<Service>Integration` type holding your search and list fields
- a `types/<Service>Integration.ts` resolver that exports `<Service>IntegrationSource`, and a codegen mapper for it
- a `<service>: (source) => source` entry in `types/TeamMemberIntegrations.ts`

Only the team member themselves can reach `TeamMember.integrations` (see `permissions.ts`). Give each search and list field its own `isUserViewer('source.userId')` rule there too, as `AzureDevOpsIntegration.workItems` has, and read the team and user ids from the source, never from arguments.

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
- **Optional lists.** `packages/client/modules/userDashboard/components/OrgIntegrations/RemoveIntegrationProviderDialog.tsx` names a service it does not list by its key with a capital first letter (`azureDevOps` becomes "AzureDevOps"), and the retro demo in `packages/client/modules/demo/initDB.ts` seeds only the services it lists.

## Auth

- **OAuth2** is what the script sets up. On the server, `<Service>OAuth2Manager` exchanges and refreshes tokens; it is registered in [`createOAuth2Manager.ts`](../../packages/server/integrations/platform/createOAuth2Manager.ts). Return the person's id on the service from `authorize` when the API has one. A service that grants no scopes returns `scopes: ''`. When its tokens never expire, have `refresh` return an `Error`, as `GitHubOAuth2Manager` does. On the client, `<Service>ClientManager` opens the popup. The `/auth/:provider` callback route is shared, so it needs no change.
- **Revoked access.** A token that never expires is never refreshed, so no failed refresh tells Parabol that someone revoked it. When the service rejects a token as revoked, call `deactivateTeamMemberIntegrationAuthFamily(auth)` from `packages/server/postgres/queries/`. The service then shows as disconnected, so the person can connect again instead of watching every call fail.
- **Other strategies** need their own code in [`addTeamMemberIntegrationAuth.ts`](../../packages/server/graphql/public/mutations/addTeamMemberIntegrationAuth.ts): Jira Server uses OAuth1, and Azure DevOps uses PKCE and resolves its own auth. Personal access tokens are not supported yet: `addTeamMemberIntegrationAuth` does not store them, so a PAT service needs its own branch there.
- **Where credentials come from.** The instance-wide provider comes from `.env` through [`primeIntegrations.ts`](../../scripts/toolboxSrc/primeIntegrations.ts). Teams and orgs can add their own with the `addIntegrationProvider` mutation. A service shows as available when one of these exists.
- **Extra auth data.** If the auth row stores more than tokens, add its shape to `IntegrationAuthMetaByService` in `packages/server/postgres/types/index.d.ts`.
- **Trust.** Never trust what the client says about scopes or team ids; work them out on the server. Permission checks belong in `permissions.ts`, not in resolvers.

## Testing

The conformance suites run against every registered integration, so a new one is covered as soon as it is registered.

- The server suite ([`conformance.test.ts`](../../packages/server/integrations/platform/__tests__/conformance.test.ts)) checks that the definition:
  - matches its registry key and its shared meta
  - implements every task capability
  - has an OAuth2 manager in `createOAuth2Manager.ts`, or resolves its own auth
  - returns `null` from `parseIntegrationHash` for junk input
  - handles an empty search, and rejects search meta it does not know
  - grants `repoAccess` to the same repo type it lists, which `pnpm typecheck` checks
  - can push an estimate as a comment
  - is a `ServiceEnum` source if it lists issues
  - keeps the GraphQL service enums, the stored task services and the registry in sync, which `pnpm typecheck` checks
- The client suite ([`conformance.test.ts`](../../packages/client/integrations/platform/__tests__/conformance.test.ts)) checks that the definition:
  - matches its shared meta
  - ships a scoping tab exactly when it is a task service
  - ships a work drawer tab
  - has a logo no other service uses

Put tests for your own code in `integrations/<service>/__tests__/` on each side, and mock the service instead of calling it. Before a run, `pnpm test:server` resets a couple of tables and turns off one trigger in the database named in `.env`, so point it at a development database. Unit tests that mock the service can skip that setup. Skipping it also skips loading `.env`, so load it yourself from the repo root:

```sh
set -a && . ./.env && set +a
pnpm --filter parabol-server exec jest --globalSetup='' --globalTeardown='' server/integrations/<service>
```

## Example integrations

- **Linear**: the smallest complete task integration, using OAuth2.
- **Azure DevOps**: a REST API with every capability, including `repoAccess`.
- **GitHub**: pushes estimates as labels.
- **Google Calendar (`gcal`)**: not a task integration. It only lists events for the drawers.

One naming trap: [`integrations/jira/JiraServerIntegration.ts`](../../packages/server/integrations/jira/JiraServerIntegration.ts) is the server definition for Jira Cloud. Jira Server / Data Center is [`integrations/jiraServer/JiraServerServerIntegration.ts`](../../packages/server/integrations/jiraServer/JiraServerServerIntegration.ts).

## Before you open a pull request

Run `pnpm typecheck`, both conformance suites and `pnpm exec biome check`. Then connect the service in the app and push a task to it. Include a screenshot of the integrations page and of the pushed task in the pull request.
