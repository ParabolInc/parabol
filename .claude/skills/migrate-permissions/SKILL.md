---
name: migrate-permissions
description: Guide for authorization with graphql-shield rules in permissions.ts — the available rules, moving inline auth checks out of resolvers, and writing rules that can't throw (null authToken, parallel and()/or(), denial logging, the public rate limit). Use when adding, reviewing, or migrating authorization logic for mutations or queries.
---

## Permissions

Authorization lives in two places: `graphql/public/permissions.ts` (preferred) and inline in resolver functions (legacy). The goal is to move all auth into `permissions.ts`.

### How it works

`permissions.ts` exports a `permissionMap` that maps GraphQL types/fields to shield rules. `composeResolvers.ts` wraps each resolver with its rule as a higher-order function — avoiding the overhead of `graphql-middleware`.

- `'*'` wildcard sets a default rule for all fields on a type (e.g., all Mutations default to `isAuthenticated`)
- Specific field entries override the wildcard
- Rules can be composed with `and()`, `or()`, `not()` from `graphql-shield`

### Rules directory: `graphql/public/rules/`

| Rule | What it checks |
|------|---------------|
| `isAuthenticated` | viewer has a valid auth token |
| `isSuperUser` | viewer has `su` role |
| `isTeamMember` | `authToken.tms` includes the teamId (fast, no DB) |
| `isViewerTeamLead` | viewer has `isLead` on the team member record (DB) |
| `isViewerOnTeam` | viewer has an active (non-removed) team member record (DB) |
| `isTeamMemberOfMeeting` | viewer's `authToken.tms` includes the meeting's teamId (fast) |
| `isMeetingMember` | viewer has an actual `meetingMembers` record (DB, stricter) |
| `isViewerBillingLeader` | viewer has `BILLING_LEADER` or `ORG_ADMIN` org role |
| `hasOrgRole` | viewer has a specific org role (`ORG_ADMIN`, etc.) |
| `isViewerOnOrg` | viewer is a member of the org |
| `isOrgTier` | org is on a specific tier (`enterprise`, etc.) |
| `hasPageAccess` | viewer has `viewer` or `owner` access to a page |
| `isNull` | an arg is null (used for conditional or() rules) |
| `isEnvVarTrue` | an env var is set to true |
| `rateLimit` | rate limits by perMinute/perHour |

**Key distinction:** `isTeamMemberOfMeeting` (used for `createReflection`) only checks team membership and is more permissive. `isMeetingMember` checks for an actual meeting member record and is stricter. Use `isMeetingMember` when you need to confirm the viewer has joined the meeting.

### Dot-path convention

Rules that take a `dotPath` accept strings like:
- `'args.teamId'` — top-level arg
- `'args.input.meetingId'` — nested arg
- `'args.newAgendaItem.teamId'` — nested arg
- `'source.id'` — field on the parent resolver's source object
- `'source.orgId'` — field on the parent resolver's source object

### Moving auth from resolver to permissions.ts

When extracting inline auth:
1. Identify the auth check (usually guarded by a comment like `// AUTH`)
2. Find the matching rule or compose existing rules with `and()`/`or()`
3. Add the entry to `permissionMap` in `permissions.ts` (keep fields alphabetical, `'*'` first)
4. Remove the inline check from the resolver, along with any imports that are no longer used
5. If no existing rule fits and the logic is reusable, ask before creating a new rule — most cases can reuse existing rules

### Writing rules that can't throw

- **`authToken` is null for a signed-out HTTP request**, though `GQLContext.authToken` is typed non-null, so TypeScript never flags `authToken.tms`. Every rule must tolerate it: use `getUserId(authToken)` or `authToken?.`.
- **`and()` and `or()` run their rules in parallel** (Promise.all). `and(isAuthenticated, isTeamMember(...))` still runs the second rule for a signed-out caller, and `or(isNull('args.x'), ruleThatLoads('args.x'))` still loads with `x` undefined. A rule must handle a missing arg itself (return a NOT_FOUND error) rather than rely on a sibling to guard it. Don't use graphql-shield's `race()`: its cjs build throws `util_1.isUndefined is not a function`.
- `composeResolvers.ts` runs shield with `debug: true`, so a rule that throws rejects the whole field as an `INTERNAL_SERVER_ERROR`, which counts against the availability SLO.
- **Return coded GraphQLErrors.** A rule that returns a string becomes a plain `Error` with no code.
- **A denial logs a warning per request** (`utils/useErrorLogging.ts`). For data merely scoped to the viewer on a type they can already read, shape the result in the resolver (return null or `[]`), as `Page.parentPage`, `Page.ancestors` and `PageAccess.pendingRequests` do. Keep rules for mutations and for fields the client only requests when allowed.
- `Query.public` and `PublicRoot.page` share `rateLimit({perMinute: 20, perHour: 100})`, counted once per request, so a second `public { page }` query per page view halves how many pages a user can open. Put extra page data in `PageEntryQuery` instead of a new root.
- `hasPageAccess` takes an optional third argument (`'pageThreads' | 'pageComments'`) to find the page from a thread or comment id.

### When a new rule is needed (ask first)

- Auth that depends on an array of IDs (e.g., "team lead for any of these teamIds")
- Auth that branches on an enum arg (e.g., `scope === 'global' | 'org' | 'team'`)
