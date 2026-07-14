# Tasks as a Pages Database — Design Spec

- **Date:** 2026-07-14
- **Status:** Approved section-by-section in brainstorming review; pending final spec sign-off
- **Product owner:** Jordan Husney
- **Integration branch:** `feat/tasks-as-database` (each sprint lands via PR from its own branch)
- **Design source:** claude.ai/design project *"Parabol tasking system redesign"* (`13303d74-a2b5-4cb6-b5ae-b30019576f87`), 12 wireframe screens mirrored locally at `docs/superpowers/design/tasks-as-database/`

## 1. Overview

Re-implement Parabol's tasking system as a special-cased **Database** experience built on the Pages feature:

- `/me/tasks` becomes a database view over tasks: **table and kanban layouts**, saved-view tabs, filters, sorting, column visibility — with today's Team / Team Member / Archived filters preserved.
- The four primary task states (**Future / Stuck / Active / Done**) are preserved and locked. Teams configure **secondary statuses** under each primary; these render as kanban sub-columns and as a secondary pill in tables.
- **Database views embed in any page** as live blocks via slash commands, with the same tabs/filters/layouts.
- A **`/task` slash command** creates fully-editable inline task cards on pages; an assignment control handles user + team on non-team pages.
- The existing WIP yjs Database feature is **extended in place**: one unified view layer serves both the special-cased Tasks source and free-form yjs database pages (both sources ship in v1).

Non-goals: meeting task surfaces (Updates phase etc.) are never touched; no custom fields; no new subscription channel; no migration of yjs database data.

## 2. Decision log (from product-owner interview, 2026-07-14)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Database identity | **One global tasks database.** Every view is a filtered lens over the Task table. No new container entity, no `databaseId` FK. Screen 09's picker offers "Tasks" (special-cased) plus database pages. |
| 2 | Secondary status scope | **Per team.** A task's available secondaries come from its team. Cross-team boards merge sub-columns by label. |
| 3 | Saved views | **One Postgres `DatabaseView` table.** Personal rows (`userId`) power `/me/tasks` tabs; page-scoped rows (`pageId` + `blockId`) power embedded-block tabs — shared with everyone who can see the page, editable by page editors. |
| 4 | Scope | **Full 11-screen set.** Team dash converts near the end; meeting surfaces stay legacy indefinitely (zero-touch). |
| 5 | Task open target | **Side drawer** (`?task=<id>`). Table rows and kanban cards are read-only; one TipTap editor instance per surface. Exception: `inlineTask` cards on pages edit in place (screens 08/10). |
| 6 | `+` column affordance | **Show/hide of the fixed field set** (per-view `columnVisibility`). No custom fields. |
| 7 | Ordering *(revised)* | **Global manual rank via the existing float `sortOrder`** — same column, same midpoint + `dndNoise()` math as today, `id` tie-breaker added. Explicit view sorts override manual rank (drag then only changes column membership). **No float→string migration; no breaking API change** (`UpdateTaskInput.sortOrder` stays `Float`). New tables also use `double precision` sortOrder. |
| 8 | Embed permissions | **Strict intersection.** Rows always filtered server-side by viewer team membership + private-task rules, regardless of page access. Non-members see a placeholder. Task edits require team membership regardless of page role. |
| 9 | Integrated tasks | **Full participation.** Jira/GitHub/GitLab/Azure/Linear tasks appear as normal rows, can take a secondaryStatus and be dragged between sub-columns. `secondaryStatus` is Parabol-local and **never pushed** to external services. Content stays read-only. **No Estimate column in the v1 table at all** (reading `Task.estimates` triggers live external API calls per row) — deferred, see §10. |
| 10 | Archived | **Tag mechanism untouched** (content-tag + `tags` column dual-write). The view's Archived checkbox = "include archived in this view", mapped onto existing SQL tag predicates. `TeamArchive` route survives. |
| 11 | Legacy yjs Databases | **Extend in place.** Revive the `Databases` org feature flag (bump `expiresAt`); the existing feature and its data keep working; the redesigned view layer becomes its UI. |
| 12 | View sources | **Both sources in v1.** The view layer serves the Tasks source (Relay/Postgres) and the page source (yjs rows) through one source-adapter interface. |
| 13 | Sub-columns | **Uniform rule, all 4 primaries.** Any primary may define secondaries (screen 07 popover). A band splits only if secondaries exist under it; tasks without one land in a muted catch-all sub-column named after the primary. Done ships with none seeded → renders collapsed by default. |
| 14 | Workflow | **PR per sprint** into `feat/tasks-as-database`; review bar = typecheck + lint + unit tests. |

**Architecture:** Approach A — **source-adapter view layer** (chosen over parallel stacks and storage normalization).

## 3. Data model & server API

### 3.1 `TaskSecondaryStatus` (new table)

| column | type | notes |
|---|---|---|
| `id` | serial PK | |
| `teamId` | varchar FK → `Team` ON DELETE CASCADE | per-team vocabulary (decision 2) |
| `status` | `TaskStatusEnum` NOT NULL | parent primary; a secondary belongs to exactly one primary band |
| `label` | varchar(100) NOT NULL | display text. **No color column** — secondary pills are neutral with a dot inheriting the parent primary's color (screen 01) |
| `sortOrder` | double precision NOT NULL | midpoint reordering in the Statuses popover |
| `createdAt` / `updatedAt` | timestamptz, DB defaults | |

- Unique index on `(teamId, status, lower(label))`.
- Cap **25 secondaries per team**, enforced in the add mutation (repo precedent: caps live in mutations).

### 3.2 `Task.secondaryStatusId` (new column)

- Nullable int FK → `TaskSecondaryStatus` **ON DELETE SET NULL**.
  - Safe-delete (screen 07 "tasks revert to primary") is implemented by the schema.
  - Renames are free — the label lives only in the config row.
  - Integrations/reports only ever see the primary: external sync code never reads this column.
- **Server invariants** (enforced in `createTask` / `updateTask`):
  - The referenced row's `teamId` and `status` must match the task's.
  - When primary `status` changes, `secondaryStatusId` **auto-clears** unless the mutation supplies a valid new one.
  - `changeTaskTeam` clears it (vocabulary does not follow across teams).
- New indexes: composite `(teamId, status)`; partial index on `secondaryStatusId WHERE secondaryStatusId IS NOT NULL`.

### 3.3 `DatabaseView` (new table — all saved views, both sources)

| column | type | notes |
|---|---|---|
| `id` | serial PK | |
| `name` | varchar(255) NOT NULL | duplicates allowed |
| `userId` | varchar FK → `User` CASCADE, nullable | personal scope (`/me/tasks` tabs) |
| `teamId` | varchar FK → `Team` CASCADE, nullable | with `userId`: scopes personal tabs to a team dashboard (`/team/:teamId/tasks`, Sprint 8) |
| `pageId` | int FK → `Page` CASCADE, nullable | page scope (embedded blocks and database pages) |
| `blockId` | varchar(36), nullable | uuid minted at block insertion; lets two blocks on one page have independent tab sets |
| `source` | enum `'tasks' \| 'page'` | |
| `sourcePageId` | int FK → `Page` CASCADE, nullable | required iff `source = 'page'` |
| `layout` | enum `'table' \| 'kanban'` | layout is part of the saved view (screen 01 tab icons) |
| `filters` | jsonb | typed TS shape, validated in the mutation. Tasks: `{teamIds?, userIds?, includeArchived?, statusFilters?, secondaryStatusLabels?, includeUnassigned?}`. Page: `[{columnId, op, value}]` |
| `sortBy` | jsonb | `[{field \| columnId, direction}]` |
| `groupBy` | varchar, nullable | kanban grouping. Tasks source: fixed `status+secondary`. Page source: a column id |
| `columnVisibility` | jsonb | hidden column keys (decision 6) |
| `sortOrder` | double precision NOT NULL | tab order |
| `createdBy` | varchar FK → `User` SET NULL | attribution on shared views |
| `createdAt` / `updatedAt` | timestamptz, DB defaults | `updatedAt` doubles as the compare-and-set token for "update for everyone" |

- Scopes, enforced by `CHECK` — **personal** `(userId NOT NULL, teamId NULL, pageId NULL, blockId NULL)`: `/me/tasks` tabs; **team-dash personal** `(userId NOT NULL, teamId NOT NULL, pageId NULL, blockId NULL)`: the viewer's tabs on `/team/:teamId/tasks` (Sprint 8); **page block** `(userId NULL, pageId NOT NULL, blockId NOT NULL)`: an embedded block's shared tabs; **page direct** `(userId NULL, pageId NOT NULL, blockId NULL)`: a database page's own tabs (Sprint 6). `sourcePageId NOT NULL iff source = 'page'` is **mutation-validated** (alongside the `filters` shape), not in the CHECK.
- Cap **25 saved views per scope**, mutation-enforced. The built-in default tab is not a row and does not count.
- **Every surface always renders a built-in, code-defined, undeletable default tab first**; saved views are additional — so a block or surface with zero rows still renders sensibly. For `/me/tasks` the built-in tab is **"All Tasks" = legacy parity**: kanban layout, the viewer's tasks across all their teams (`userIds=[viewer]`), unarchived, manual rank (table reachable via the layout toggle as an ephemeral override once Sprint 3 lands). Tasks-source embeds use the same definition; page-source surfaces get a plain unfiltered table. Legacy URL params (`?teamIds=&userIds=&archived=true`) parse into ephemeral overrides on the built-in tab → Edited badge → screen 06 save flow. All existing email deep links keep working.
- Page-source view definitions live here too (not in the yDoc); the in-doc `View` stub in `tiptap/extensions/database/data.ts` is superseded.
- Block deletion orphans its rows: accepted (small, invisible); no GC in v1.

### 3.4 Ordering (decision 7, revised)

- `Task.sortOrder` (float) is untouched: no migration, no API change, meeting-shared code genuinely zero-touch.
- New surfaces reuse today's exact math: midpoint between neighbors + `dndNoise()`, `SORT_STEP` spacing, columns sorted `sortOrder DESC` with **`id` as deterministic tie-breaker** (new code paths only).
- When a view has an explicit sort, in-column position is derived; dragging only changes `status`/`secondaryStatusId`.
- Known accepted trade-off: the `dndNoise.ts` deprecation comment stays unresolved. A future lexicographic migration remains one column-type change; nothing here depends on float-ness.

### 3.5 GraphQL surface

All mutations scaffolded with `pnpm newMutation`, return `*Success`, throw `GraphQLError` on failure, carry `@scope` directives, and follow publish-after-all-writes with `dataLoader.share()`.

**Secondary statuses** (TEAM channel — new nullable `*Success` fields added to the `TeamSubscriptionPayload` **type**, which uses the `fieldName` + field-per-payload pattern, not a union):
- `Team.secondaryStatuses: [TaskSecondaryStatus!]!` (FK dataloader by `teamId`)
- `addTaskSecondaryStatus(teamId, status, label, sortOrder)`
- `renameTaskSecondaryStatus(id, label)`
- `moveTaskSecondaryStatus(id, sortOrder)`
- `removeTaskSecondaryStatus(id)` — safe-delete; FK `SET NULL` reverts tasks

**Task mutations:**
- `createTask` / `updateTask` gain `secondaryStatusId` with the §3.2 validation + auto-clear rules
- **Bug fix:** `updateTask` currently ignores explicit `userId: null` (`updateTask.ts` uses `inputUserId || undefined`) — fixed to distinguish null (unassign) from undefined (untouched), making screen 11's orphan-on-cross-team-move expressible

**Views** (NOTIFICATION channel):
- `viewer.databaseViews(...)` / `Page.databaseViews(blockId)` queries
- `upsertDatabaseView(input)` — create/update, including `sortOrder` (tab reorder) and rename
- `removeDatabaseView(id)`
- Page-scoped fan-out follows the `publishPageNotification` pattern (all `PageAccess` holders)

**View row query:** the `userTasks` loader path / `User.tasks` args are extended with `sortBy` and secondary-status filters, executing **filter + sort + pagination server-side** (replacing fetch-1000-filter-client), backed by the §3.2 indexes. Exact resolver shape (extend vs sibling field) is a Sprint 3 implementation decision.

## 4. View layer architecture (Approach A: source adapters)

```ts
interface DatabaseSource {
  columns: DatabaseColumn[]        // {key, kind, label, sortable, hideable}
  capabilities: SourceCapabilities // {canAddColumn, canConfigureStatuses,
                                   //  canCreateRow, canDragRows, groupableKeys}
  useRows(view: ViewConfig): RowsResult   // rows + kanban groups + pagination
  commands: SourceCommands         // createRow, moveRow, updateCell, openRow
}
```

**`TasksSource`** — rows from the server-filtered/sorted GraphQL query as Relay fragments (subscriptions keep them live). Fixed columns: Task, Status, Assignee, Team, Due, Integration. `{canAddColumn: false, canConfigureStatuses: true, canDragRows: true, groupableKeys: ['status']}`. `moveRow` = one `updateTask` `{status, secondaryStatusId, sortOrder}`. `openRow` = drawer. Kanban groups computed here: primary bands → sub-columns **merged across teams by `(status, lower(label))`**; catch-all per decision 13. Merge determinism: a merged sub-column's position within its band = the minimum contributing per-team `sortOrder` (ties broken alphabetically by `lower(label)`); its display casing comes from the contributing team with that minimum.

**`PageSource`** — rows/columns from the existing yjs hooks (`useYArray`/`columnMeta`); filter/sort/groupBy computed client-side over CRDT state; `updateCell` is a yDoc transaction; grouping targets `status`/`tags` columns; `canAddColumn: true` (the `+` header adds a column here; for tasks it opens the show/hide menu).

**Component tree** — all new files under `packages/client/modules/database/`; Tailwind/paletteV3 only, `ui/` Radix primitives, `use*Mutation` hooks, 1 component/file (<100 LOC target):

```
DatabaseViewShell          ← tabs + controls + active layout; used by routes AND NodeViews
├── ViewTabs               ← saved-view tabs w/ layout icons, +Add view, Edited badge
├── ViewControlsBar        ← Team/Member/Archived trio (tasks source), Filter, Sort,
│                            column-visibility (+), Table|Kanban segmented toggle
├── DatabaseTable          ← @tanstack/react-table + react-virtual;
│                            scroll container passed as a prop (fixes #main hardcode)
│   └── cell renderers by column.kind (StatusCellPills, AssigneeCell, DueCell, …)
├── DatabaseKanban         ← @hello-pangea/dnd; primary bands → sub-column Droppables;
│                            droppableId = `${status}::${labelKey|__none}`
│   └── TaskCardCompact    ← read-only: 3f split-bar cluster, avatar, due, integration
├── TaskDrawer             ← THE single TipTap editor instance; status cluster, secondary
│                            picker, assignee, due, integrate, tags, archive; ?task= param
├── StatusesPopover        ← screen 07: locked primaries, add/rename/reorder/safe-delete
├── SaveViewDialog         ← screen 06: name, save-as-new vs update-for-everyone, diff
└── NewTaskRow / ColumnAddTask
```

### Design-set conflict rulings

| Conflict (screens) | Ruling |
|---|---|
| Status rendering: pills (01/05) vs chosen 3f cluster (03) | Both, by surface: **tables use the pill pair** (primary tinted pill + neutral secondary pill with primary-colored dot); **kanban cards use the 3f cluster** (glyph + split bar + micro-caps). Same locked colors: done=grape, active=jade, stuck=tomato, future=aqua (existing `taskStatusColors` palette mappings). |
| View sharing scope (01 "database" vs 06 "page" vs personal-looking tabs) | Decision 3: personal rows for `/me/tasks`; page-scoped rows for embeds. Screen copy updated meaning: "everyone who can see this page." |
| Layout toggle vs "update for everyone overwrites only filters and sorting" (06) | Layout, filters, sort, groupBy, and columnVisibility are **all** view fields; changing any marks the view Edited; save/update covers all of them. |
| Catch-all sub-column treatments differ (02/03/07) | Decision 13's uniform rule. |
| `+` add-column vs "only net-new field is secondaryStatus" (index vs 01/05) | Decision 6: show/hide for tasks source; real add-column only for page source. |
| Screen 09 "create new database" inline | Cut for tasks (one global DB). The picker offers Tasks + existing database pages; creating a new database page stays with the existing `Database` slash command. |

### Interaction rules

- **Cross-team drop rule:** a merged sub-column accepts a drop only if the dragged task's team defines that label; otherwise reject + snackbar. No auto-created vocabulary.
- **Drawer** is URL-driven (`?task=<id>`): deep-linkable, identical at `/me/tasks` and inside embeds. Esc/backdrop closes. Delete-on-empty and Mod-Enter behaviors carried over from today's card editor.
- **Edited state is client-local per user on every surface** — collaborators never see your unsaved overrides. Read-only page viewers may make ephemeral changes (layout toggle, filter tweaks) but save/update/tab management is disabled (authz per §6.1).
- **`NewTaskRow`/`ColumnAddTask` defaults:** single-valued active filters become the new task's team/assignee; multi-valued or absent filters fall back to viewer's first team / viewer as assignee (legacy behavior).
- **Route wiring:** `UserDashMain`'s `tasks` route branches on the revived flag — new `TasksDatabaseRoot` vs untouched legacy tree (instant rollback). New Relay connections registered in `handleUpsertTasks` so both old and new surfaces stay live-consistent during coexistence.

## 5. Surfaces

### 5.1 Embedded database view block (screens 05/09)

- New atom node **`databaseViewBlock`** (shared `*Base.ts` + client extension + `serverTipTapExtensions.ts` registration; `PageLinkBlock` is the template). The existing `database` node is untouched.
- **Attrs:** `{blockId: uuid, source: 'tasks' | 'page', sourcePageCode: number | null}`. No rows, no filters in the doc — all view config is Postgres. `sourcePageCode` is the public ciphered page code, resolved server-side to `Page.id` via `CipherId` exactly as page links do. A uniqueness pass in the extension **re-mints `blockId` on paste/duplicate** (pageLinkBlock's paste-dedup precedent); a duplicated block starts fresh on the built-in default tab — views are not cloned.
- **NodeView** renders `DatabaseViewShell` with live Relay data — direct precedent: `InsightsBlockPromptRoot` already runs `useQueryLoaderNow` + `usePreloadedQuery` inside a NodeView; this block follows that pattern with subscription-updated fragments layered on.
- **Insert flow:** slash commands **"Tabular view · database"** / **"Kanban view · database"** → inline picker portal (Tasks first, then the user's database pages) → node inserted rendering the built-in default tab with the picked layout as an ephemeral override → Edited badge → save creates the first page-scoped view.
- **Permissions at render:**
  - Tasks source: requested team filters intersect `viewer.tms` (client hint, server enforcement); empty intersection → block frame + "Join *<team>* to see these tasks."
  - Page source: opening the source page's provider goes through hocuspocus `onAuthenticate`; no access → "No access to this database" placeholder.
  - Read-only page roles (viewer/commenter): saving/updating/reordering the block's views is disabled — `upsertDatabaseView` requires page-editor role (§6.1); these are Postgres writes, not doc writes. Ephemeral local changes remain allowed; task edits still work via GraphQL where team membership permits.

### 5.2 `/task` inline card (screens 08/10)

- New atom node **`inlineTask`**, attrs `{taskId, titleSnapshot}` (snapshot only for markdown/plaintext export paths, per `TaskBlockBase` precedent).
- **Mutation-first creation:** `/task` resolves the team from page ancestry (`parentPageId` chain → `teamId`), fires `createTask` (empty content, `active`, assignee = creator), inserts the node with the real id, focuses the card. **Delete-on-empty applies only to a just-created card within its initial editing session** (today's card-editor semantics) — emptying a pre-existing or reference card never deletes the task. Teamless page (private or shared) → node inserts in a *pending* state showing the team picker; `createTask` fires on selection.
- **Edits in place** (deliberate deviation from drawer-everywhere; screens 08/10 specify a fully-editable card, and a lone card in document flow is where a per-card editor is cheap).
- Card anatomy maps 1:1 to existing mutations (screen 10): content→`updateTask`, status cluster→`updateTask`, due→`updateTaskDueDate`, integrate→`createTaskIntegration`, assignee→`updateTask`, team→`changeTaskTeam`, ⋯ menu→archive/private/delete, plus the new secondary picker.
- **Block ≠ task:** removing the block never deletes the task; task deleted elsewhere → tombstone card with remove affordance. **"Inline existing task"** search command inserts a reference; duplicates allowed, both live. Inline tasks join no page-level collection (pure reference; no hidden membership field).

### 5.3 Assignment on pages (screen 11)

- Team-nested pages: user picker only (team implied). Non-team pages: **cascading control** — user primary grouped by the viewer's teams (non-shared invitees disabled with explanation), team as suffix.
- Cross-team assignment: `changeTaskTeam` → `updateTask(userId)` sequentially; partial failure → task rests Unassigned on the new team + explanatory snackbar. The move clears `secondaryStatusId` (§3.2) and may orphan the assignee via the fixed null-`userId` path.

### 5.4 Slash menu

New **"Tasks" group**: *Create new task* (pre-selected when opened via `/task`), *Inline existing task*, *Tabular view · database*, *Kanban view · database*. Legacy *Database* command (linked sub-page) untouched. All new commands flag-gated.

### 5.5 Team dashboard (late sprint)

`/team/:teamId/tasks` mounts the same shell + `TasksSource` locked to the team; view tabs are personal, scoped `(userId, teamId)` per §3.3 — distinct from `/me/tasks` tabs. The route's team is a **mandatory server-side filter applied on top of (and hiding) any saved `teamIds` filter**; the local-only member filter becomes a filter chip. `TeamArchive` route survives. The design set doesn't cover team dash — it deliberately follows `/me/tasks` patterns.

## 6. Permissions, realtime & failure handling

### 6.1 Authorization (all in `permissions.ts`; no new authz concepts)

| Operation | Rule |
|---|---|
| `addTaskSecondaryStatus` | `isTeamMember(args.teamId)` |
| `rename/move/removeTaskSecondaryStatus` | `isTeamMember` via `id → row → teamId` |
| `upsertDatabaseView` (personal) | self only |
| `upsertDatabaseView` (page scope) | `hasPageAccess(args.pageId, 'editor')` |
| `remove` / reorder views | same, via `id → row → scope` |
| View reads | personal: owner; page-scoped: `hasPageAccess` viewer |
| Task rows everywhere | the one extended `userTasks` path — team membership + private-tag exclusion in SQL |

`@scope(name: TASKS_WRITE)` on new mutations, `TASKS_READ` on reads, standard `rateLimit` rules. Strict intersection requires no new rules — every read path is viewer-scoped.

### 6.2 Realtime (three existing channels; no sixth channel)

| Change | Channel | Effect |
|---|---|---|
| Task rows | `task.{userId}` per team member (unchanged) | Live rows on every surface for team members; non-members see placeholders |
| Secondary-status config | `team.{teamId}` (new `*Success` fields on the `TeamSubscriptionPayload` type) | Sub-columns appear/rename/collapse live |
| `DatabaseView` changes | `notification.{userId}` — self (personal) or all `PageAccess` holders (page scope) | Tab strips sync across devices/collaborators |

Discipline: `dataLoader.share()` → all writes → then publishes (the dev-mode assertion that produced the stray `publishedDataloader*.json` dumps — deleted in Sprint 1). Archive events keep the dual-channel quirk (`batchArchiveTasks` → TEAM); new surfaces listen on both, as legacy does.

### 6.3 Failure & edge handling

- Validation errors (dup label, caps, secondary↔status/team mismatch): `GraphQLError` → hook-default snackbar. No silent failures.
- Stale drag (secondary safe-deleted mid-drag): server rejects; card springs back + snackbar; TEAM event usually already collapsed the column.
- "Update for everyone" race: compare-and-set on `updatedAt`; mismatch → conflict snackbar + refreshed diff. No silent clobber.
- Tombstones: deleted source database page → "This database was deleted" block; hard-deleted task → tombstone card; view filters naming a deleted secondary label → warning-tint chip matching nothing. A saved `teamIds` filter the viewer can't resolve (left/deleted team) gets the same warning-tint-chip treatment and matches nothing — rows are server-filtered regardless; the chip is removable like any filter.
- Cross-team assignment partial failure: coherent resting state (Unassigned on new team) + snackbar.

## 7. Sprint plan

Eight sprints; each is a branch off `feat/tasks-as-database` PR'd back into it. Flag-gated from Sprint 2 on; each sprint leaves the product shippable and is a rollback seam (layers are additive: secondaries survive without views; views survive without embeds).

| # | Branch | Delivers | Screens | Size |
|---|---|---|---|---|
| 1 | `s1-server-foundations` | `TaskSecondaryStatus` + `Task.secondaryStatusId` + indexes; config CRUD on TEAM channel; `createTask`/`updateTask` secondary support + invariants; `changeTaskTeam` clear; null-`userId` unassign fix; shield rules + scopes; stray `publishedDataloader*.json` cleanup. Server-only, zero UI. | 07, 10 (API) | M |
| 2 | `s2-kanban` | Flag revival (expiry bump). `DatabaseSource` + `TasksSource`; `DatabaseKanban` (bands, merged sub-columns, catch-all, drag + reject rule); `TaskCardCompact` (3f); `TaskDrawer`; `StatusesPopover`; `ColumnAddTask`; flag-gated `TasksDatabaseRoot` at `/me/tasks` (kanban); `handleUpsertTasks` registration. | 02, 03, 04, 07 | L |
| 3 | `s3-table` | Server-side filter/sort/pagination + indexes; `DatabaseTable` (tanstack + virtual, scroll-el prop) + pill renderers; columnVisibility `+` menu; Filter/Sort chips; Table⇄Kanban toggle; `NewTaskRow` with filter-aware defaults; legacy filter menus → `ui/Menu`. | 01 | M–L |
| 4 | `s4-saved-views` | `DatabaseView` table + CRUD API (NOTIFICATION); `ViewTabs` + built-in All Tasks; Edited/Reset/`SaveViewDialog` (CAS); URL params → ephemeral overrides. | 01, 06 | M |
| 5 | `s5-embed-block` | `databaseViewBlock` node; slash commands + picker portal; NodeView shell with `TasksSource`; page-scoped views `(pageId, blockId)`; strict-intersection placeholder; doc-role vs task-authz split. | 05, 09 | M |
| 6 | `s6-page-source` | `PageSource` adapter (client-side filter/sort/groupBy over yjs); embeds over database pages; database pages upgraded to the shell with **page-direct view scope** (`pageId` set, `blockId NULL`, §3.3); existing `database/` extension refactored into the shared layer; CSV/XLSX import preserved. | 05, 09 | M–L |
| 7 | `s7-inline-task` | `inlineTask` node; mutation-first creation + ancestry team resolution + pending picker; tombstones; "Inline existing task"; cascading assignment control + cross-team flow; slash-menu Tasks group. | 08, 10, 11 | M |
| 8 | `s8-teamdash-hardening` | Team dash on the shell (`(userId, teamId)` view scope); perf audit (indexes, embed virtualization, publish batching); analytics events (view created/saved/updated-for-everyone, secondary added/renamed/removed, cross-team drag, embed inserted, inline task created); staged rollout (internal → beta orgs → GA); §6.3 edge-case sweep; user-facing rollout notes. | — | M |

Dependencies: 1→2→3→4 sequential; 5 needs 4; 6 needs 5; 7 needs 1 plus Sprint 2's flag revival and may swap ahead of 5/6 (the two view-insert commands join the Tasks slash group when Sprint 5 lands); 8 last. Oversized sprints split at natural seams (e.g., 2 → kanban vs drawer+popover) rather than growing the PR.

## 8. Verification (per sprint, decision 14)

- `npx tsgo -p packages/server/tsconfig.json --noEmit` + client typecheck — clean
- `pnpm exec biome check` on touched files — clean
- Unit tests on the repo's existing test setup for all new logic:
  - Server: validation trio (team/status/label), auto-clear on status change, safe-delete revert, caps/uniqueness, view-scope authz, CAS conflict, filter/sort query shapes
  - Client: sub-column merge + catch-all rules, drag math + reject rule, filter serialization, ancestry team resolution (pure functions extracted deliberately)
- Each PR: description keyed to its screens, references to this spec's decisions, test-run evidence, screenshots for UI sprints (courtesy, not gate)

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Two-data-plane bridge (yDoc vs Postgres) — unprecedented in codebase | Node attrs hold only `{blockId, source, sourcePageCode}`; rows always via Relay (tasks) or yjs hooks (page); nothing mirrored |
| `handleUpsertTasks` hardcodes connection keys + parses `window.location` | New connections registered there in Sprint 2, before any route change; legacy keys untouched |
| Meetings share `TaskColumns`/`OutcomeCard` | Parallel implementation; zero edits to legacy kanban components; floats decision removed the last planned touch |
| Task leak via shared/public pages | Strict intersection: server-side team + private filtering on every read path; placeholder UX specified |
| Float precision exhaustion on ordering | Status-quo risk, unchanged; `dndNoise` + `id` tie-breaker; future lexicographic migration remains open and cheap |
| Per-user TASK fan-out cost on bulk ops | v1 adds no bulk mutations beyond existing; drag = one publish, same as today |
| Fetch-1000 scalability | Server-side filter/sort/pagination in Sprint 3 with new indexes |
| Expired `Databases` flag / claimed `database` node name | Flag revived by migration; new node names (`databaseViewBlock`, `inlineTask`) avoid collisions; old data untouched |
| Shared-view edit races | CAS on `updatedAt` + conflict snackbar |
| JSONB filter payloads schemaless | Shared TS validator at the mutation boundary; typed shape documented in §3.3 |

## 10. Explicitly deferred (out of scope for this effort)

- Lexicographic (string) ordering migration for `Task.sortOrder`
- An Estimate column in task tables (`Task.estimates` field reads trigger live external API calls per row)
- Page-access-grants-read for non-team-members (would need a new authz path + channel)
- Custom fields on tasks
- Meeting surfaces (Updates phase kanban etc.) — stay on legacy `TaskColumns` indefinitely
- Migration/retirement of legacy yjs database data (extend-in-place keeps it working)
- Per-view manual card ordering
- A dedicated `/task/:id` route (drawer covers open-target)
- View sharing beyond page scope (e.g., team-shared `/me/tasks` tabs via `SharingScopeEnum`) — schema accommodates later

## 11. Key codebase references

| Area | Files |
|---|---|
| Task DDL & types | `packages/server/postgres/migrations/2025-01-08…_init.ts` (Task @ :2149), `postgres/types/pg.d.ts`, `postgres/select.ts` (`selectTasks` @ :275) |
| Task GraphQL | `graphql/public/typeDefs/Task.graphql`, `types/User.ts` (User.tasks @ :200), `mutations/updateTask.ts` (null-userId bug @ :55), `dataloader/customLoaderMakers.ts` (`userTasks` @ :175) |
| Subscriptions | `utils/publish.ts`, `subscriptions/taskSubscription.ts`, `typeDefs/TaskSubscriptionPayload.graphql` |
| Permissions | `graphql/public/permissions.ts`, `rules/hasPageAccess.ts`, `applyScopeDirective.ts` |
| Pages/yjs | `server/hocusPocus.ts`, `utils/tiptap/handleAddedPageLinks.ts`, `client/shared/tiptap/serverTipTapExtensions.ts`, `postgres/migrations/2025-05-12…_RBAC.ts` |
| Existing database block | `client/tiptap/extensions/database/` (`data.ts`, `DatabaseView.tsx`, `TableBody.tsx` #main hardcode, `StatusCell.tsx`), `2025-11-18…_addDatabasePages.ts`, `2026-03-09…_migrateDatabaseRowsToYKeyValue.ts` |
| Task UI today | `client/components/TaskColumns/TaskColumns.tsx`, `modules/userDashboard/…/UserTasksHeader.tsx`, `mutations/handlers/handleUpsertTasks.ts`, `utils/useQueryParameterParser.ts` |
| Saved-query precedents | `mutations/persistIntegrationSearchQuery.ts`, `PageUserSortOrder` (updatePage.ts), `meetingSettingsByType` loader |
| Client conventions | `client/ui/*` (Menu/Dialog/Tooltip/Button/Chip), `mutations/useShareTopicMutation.ts`, `styles/theme/global.css` (paletteV3), `.claude/skills/*` |
| Slash commands | `client/tiptap/extensions/slashCommand/slashCommands.ts` |
| Design wireframes | `docs/superpowers/design/tasks-as-database/*.dc.html` (00–11) |
