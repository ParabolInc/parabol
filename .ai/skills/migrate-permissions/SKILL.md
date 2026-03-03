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
| `hasProviderAccess` | viewer can access an OAuth provider |
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

### When a new rule is needed (ask first)

- Auth that depends on an array of IDs (e.g., "team lead for any of these teamIds")
- Auth that branches on an enum arg (e.g., `scope === 'global' | 'org' | 'team'`)
