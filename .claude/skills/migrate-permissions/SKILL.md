---
name: migrate-permissions
description: Guide for moving inline auth checks out of GraphQL resolvers and into permissions.ts using graphql-shield rules. Use when adding, reviewing, or migrating authorization logic for mutations or queries.
---

## Permissions

Authorization lives in two places: `graphql/public/permissions.ts` (preferred) and inline in resolver functions (legacy). The goal is to move all auth into `permissions.ts`.

- **Centralize GraphQL permissions in permissions.ts using graphql-shield rules.** All authorization checks for GraphQL mutations and queries must be declared in \`packages/server/graphql/public/permissions.ts\` using composable graphql-shield rules (isTeamMember, isMeetingMember, isMeetingFacilitator, isUser, isViewerBillingLeader, etc.) rather than inline in resolver functions. Rules accept a type-safe dot path to the argument (e.g. 'args.teamId') and an optional dataLoader name to resolve indirect IDs (e.g. 'tasks' to look up teamId from a taskId). Compose rules with \`or()\`, \`and()\`, \`not()\` from graphql-shield. The wildcard '\*': isAuthenticated provides a default. Inline auth checks in resolvers are legacy and should be removed when found; complex auth that cannot fit a rule may stay inline but must be documented in PLAN.md.
  ```
  // Good
    // In permissions.ts
    // Direct ID check
    createTask: isTeamMember<'Mutation.createTask'>('args.newTask.teamId'),
    
    // Indirect ID resolution via dataLoader
    removeReflection: isUser<'Mutation.removeReflection'>('args.reflectionId', 'retroReflections', 'creatorId'),
    deleteTask: isTeamMember<'Mutation.deleteTask'>('args.taskId', 'tasks'),
    
    // Composed rules
    removeTeamMember: or(
      isUser<'Mutation.removeTeamMember'>('args.userId'),
      isViewerTeamLead<'Mutation.removeTeamMember'>('args.teamId'),
      isViewerBillingLeader<'Mutation.removeTeamMember'>('args.teamId', 'teams')
    ),

  // Bad
    // Inline auth check in resolver (legacy pattern to remove)
    const archiveTeam = async (_source, {teamId}, {authToken, dataLoader}) => {
      const viewerId = getUserId(authToken)
      const teamMember = await dataLoader.get('teamMembers').load(TeamMemberId.join(teamId, viewerId))
      if (!teamMember?.isLead && !isSuperUser(authToken)) {
        return standardError(new Error('Not team lead'), {userId: viewerId})
      }
      // ... resolver logic
    }
    
    // Custom helper function for indirect ID resolution (avoid)
    import getTeamIdFromArgTemplateId from './rules/getTeamIdFromArgTemplateId'
    addPokerTemplateDimension: isViewerOnTeam(getTeamIdFromArgTemplateId),
  ```

- **Export LoaderType from foreignKeyLoaderMaker for type-safe dataLoader lookups in rules.** The \`LoaderType\` utility type is exported from \`foreignKeyLoaderMaker.ts\` and used by shield rules to constrain which dataloaders can be used based on whether they have the required key (e.g. \`teamId\`). The \`LoadersWithTeamId\` pattern uses conditional types to filter loaders that have a \`teamId\` property, ensuring type safety in permission rule declarations.
  ```
  // Good
    type LoadersWithTeamId = {
      [K in AllPrimaryLoaders]: 'teamId' extends keyof LoaderType<K> ? K : never
    }[AllPrimaryLoaders]
    
    export const isTeamMember = <T>(
      dotPath: ResolverDotPath<T>,
      dataLoaderName?: LoadersWithTeamId
    ) =>

  // Bad
    // Accepting any string as dataLoader name with no type constraint
    export const isTeamMember = <T>(
      dotPath: ResolverDotPath<T>,
      dataLoaderName?: string
    ) =>
  ```

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
