# PR 10 — Verify Email SSR Rendering: Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify that all 7 email creators produce correct HTML output with React 18's `ReactDOMServer.renderToStaticMarkup`, and write unit tests to prevent regressions.

**Architecture:** React 18 does not change the `renderToStaticMarkup` API (the new SSR features are streaming-based: `renderToPipeableStream`, `renderToReadableStream`). The email pipeline uses the synchronous `renderToStaticMarkup` exclusively. This PR adds unit tests that call each email creator function and verify the output structure, confirming React 18 compatibility. No code changes to the email creators themselves are expected — the PR is verification-only plus tests.

**Tech Stack:** React 18, ReactDOMServer, Jest (SWC transformer), @react-email components

---

## Context

### Email Pipeline Architecture

All email rendering lives in `packages/server/email/`. There are 7 email creators:

| Creator | File | Needs GraphQL? |
|---|---|---|
| `emailVerificationEmailCreator` | `packages/server/email/emailVerificationEmailCreator.tsx` | No |
| `resetPasswordEmailCreator` | `packages/server/email/resetPasswordEmailCreator.tsx` | No |
| `pageSharedEmailCreator` | `packages/server/email/pageSharedEmailCreator.tsx` | No |
| `pageAccessRequestEmailCreator` | `packages/server/email/pageAccessRequestEmailCreator.tsx` | No |
| `teamLimitsEmailCreator` | `packages/server/email/teamLimitsEmailCreator.tsx` | No |
| `notificationSummaryCreator` | `packages/server/email/notificationSummaryCreator.tsx` | Yes (Relay + ServerEnvironment) |
| `sendSummaryEmailV2` | `packages/server/email/sendSummaryEmailV2.tsx` | Yes (GraphQL context + dataLoader) |

The 5 simple creators call `ReactDOMServer.renderToStaticMarkup(<Component />)` directly and return `{subject, body, html}`.

The 2 complex creators (`notificationSummaryCreator`, `sendSummaryEmailV2`) need full GraphQL/Relay context and are covered by existing integration tests. We will test them indirectly by verifying `renderToStaticMarkup` works correctly in isolation.

### Test Infrastructure

- Jest config: `packages/server/jest.config.js`
- Test regex: `/__tests__/.*.test\\.ts?$` (matches `.test.ts` only, NOT `.test.tsx`)
- Transform: `@swc/jest` with `react.runtime: 'automatic'` — handles `.tsx` imports from `.ts` test files
- Module aliases: `parabol-client/(.*)` → `<rootDir>/../client/$1`
- Global setup: loads dotenv, truncates DB tables (requires running PostgreSQL)
- Existing tests: integration tests via `sendIntranet()` / `sendPublic()` hitting a running server

### Key Dependencies to Mock

- `packages/server/appOrigin.ts` — reads `PROTO`, `HOST`, `PORT` env vars at module level
- `packages/server/utils/analytics/analytics.ts` — called by `teamLimitsEmailCreator` (side effect)

---

## Task 1: Write the failing test file for the 5 simple email creators

**Files:**
- Create: `packages/server/__tests__/emailSSR.test.ts`

### Step 1: Create the test file with all test cases

The test file mocks `appOrigin` and `analytics`, then calls each of the 5 simple email creators and verifies their output structure and content.

```ts
import '../../../../scripts/webpack/utils/dotenv'

// Mock appOrigin before any email creator imports
jest.mock('../appOrigin', () => 'https://action.parabol.co')

// Mock analytics to avoid side effects in teamLimitsEmailCreator
jest.mock('../utils/analytics/analytics', () => ({
  analytics: {
    notificationEmailSent: jest.fn()
  }
}))

describe('Email SSR rendering with React 18', () => {
  test('emailVerificationEmailCreator returns valid HTML', async () => {
    const {
      default: emailVerificationEmailCreator
    } = await import('../email/emailVerificationEmailCreator')

    const result = emailVerificationEmailCreator({
      verifiedEmailToken: 'test-token-123',
      invitationToken: null
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('html')
    expect(result.subject).toBe('Verify your email address')
    expect(result.html).toContain('<!DOCTYPE')
    expect(result.html).toContain('Verify My Email')
    expect(result.html).toContain('verify-email/test-token-123')
  })

  test('emailVerificationEmailCreator appends invitation token when present', async () => {
    const {
      default: emailVerificationEmailCreator
    } = await import('../email/emailVerificationEmailCreator')

    const result = emailVerificationEmailCreator({
      verifiedEmailToken: 'test-token',
      invitationToken: 'invite-token'
    })

    expect(result.html).toContain('verify-email/test-token/invite-token')
  })

  test('resetPasswordEmailCreator returns valid HTML', async () => {
    const {
      default: resetPasswordEmailCreator
    } = await import('../email/resetPasswordEmailCreator')

    const result = resetPasswordEmailCreator({
      resetPasswordToken: 'reset-token-456'
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('html')
    expect(result.subject).toBe('Request to Reset Your Password')
    expect(result.html).toContain('<!DOCTYPE')
    expect(result.html).toContain('reset-password/reset-token-456')
  })

  test('pageSharedEmailCreator returns valid HTML', async () => {
    const {
      default: pageSharedEmailCreator
    } = await import('../email/pageSharedEmailCreator')

    const result = pageSharedEmailCreator({
      ownerName: 'Alice',
      ownerEmail: 'alice@example.com',
      pageName: 'Sprint Retro Notes',
      pageLink: 'https://action.parabol.co/pages/abc123',
      role: 'editor'
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('html')
    expect(result.subject).toContain('Alice')
    expect(result.subject).toContain('shared a Page')
    expect(result.html).toContain('<!DOCTYPE')
    expect(result.html).toContain('Sprint Retro Notes')
  })

  test('pageAccessRequestEmailCreator returns valid HTML', async () => {
    const {
      default: pageAccessRequestEmailCreator
    } = await import('../email/pageAccessRequestEmailCreator')

    const result = pageAccessRequestEmailCreator({
      requesterName: 'Bob',
      requesterEmail: 'bob@example.com',
      pageName: 'Team Roadmap',
      pageLink: 'https://action.parabol.co/pages/def456',
      role: 'viewer',
      reason: 'Need to review the roadmap'
    })

    expect(result).toHaveProperty('subject')
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('html')
    expect(result.subject).toContain('Bob')
    expect(result.subject).toContain('requested access')
    expect(result.html).toContain('<!DOCTYPE')
    expect(result.html).toContain('Team Roadmap')
  })

  test('teamLimitsEmailCreator returns valid HTML for each email type', async () => {
    const {
      default: teamLimitsEmailCreator
    } = await import('../email/teamLimitsEmailCreator')

    const baseProps = {
      userId: 'user123',
      email: 'user@example.com',
      preferredName: 'Charlie',
      orgId: 'org456',
      orgName: 'Acme Corp'
    } as const

    const emailTypes = ['thirtyDayWarning', 'sevenDayWarning', 'locked'] as const

    for (const emailType of emailTypes) {
      const result = teamLimitsEmailCreator({...baseProps, emailType})

      expect(result).toHaveProperty('subject')
      expect(result).toHaveProperty('body')
      expect(result).toHaveProperty('html')
      expect(result.html).toContain('<!DOCTYPE')
      expect(result.html).toContain('Charlie')
    }
  })

  test('teamLimitsEmailCreator subjects match email types', async () => {
    const {
      default: teamLimitsEmailCreator
    } = await import('../email/teamLimitsEmailCreator')

    const baseProps = {
      userId: 'user123',
      email: 'user@example.com',
      preferredName: 'Charlie',
      orgId: 'org456',
      orgName: 'Acme Corp'
    } as const

    const locked = teamLimitsEmailCreator({...baseProps, emailType: 'locked'})
    expect(locked.subject).toBe('Parabol Account Deactivated')

    const sevenDay = teamLimitsEmailCreator({...baseProps, emailType: 'sevenDayWarning'})
    expect(sevenDay.subject).toBe('Parabol Account - Action Required')

    const thirtyDay = teamLimitsEmailCreator({...baseProps, emailType: 'thirtyDayWarning'})
    expect(thirtyDay.subject).toBe('Parabol Account - Team Limit Reached')
  })
})
```

### Step 2: Run the tests to verify they pass

Run: `cd packages/server && npx jest __tests__/emailSSR.test.ts --no-coverage`

Expected: All 7 tests PASS. Since the email creators already work with React 18 (the version bump happened in PR 7), these tests should pass immediately — they serve as regression tests confirming SSR compatibility.

**If tests fail:** Investigate the failure. Possible causes:
- Module resolution issues with `parabol-client/*` imports — check `moduleNameMapper` in jest config
- Missing env vars — the dotenv import at top of test should handle this
- `analytics` mock insufficient — expand the mock shape

---

## Task 2: Verify `renderToStaticMarkup` works correctly for the Relay-based email path

**Files:**
- Modify: `packages/server/__tests__/emailSSR.test.ts`

### Step 1: Add a direct `renderToStaticMarkup` smoke test

Add this test to the existing describe block in `emailSSR.test.ts` to verify the React 18 SSR API works in isolation (covering the code path used by `renderSSRElement.tsx` for `notificationSummaryCreator`):

```ts
  test('ReactDOMServer.renderToStaticMarkup works with React 18', async () => {
    const ReactDOMServer = await import('react-dom/server')
    const React = await import('react')

    const element = React.createElement('div', {className: 'test'}, 'Hello from React 18 SSR')
    const html = ReactDOMServer.renderToStaticMarkup(element)

    expect(html).toBe('<div class="test">Hello from React 18 SSR</div>')
  })
```

### Step 2: Run the full test file again

Run: `cd packages/server && npx jest __tests__/emailSSR.test.ts --no-coverage`

Expected: All 8 tests PASS.

---

## Task 3: Run the full server test suite to confirm no regressions

### Step 1: Run the server typecheck

Run: `pnpm --filter parabol-server typecheck`

Expected: PASS (no new errors; the pre-existing Kysely errors from PR 7 are unrelated)

### Step 2: Run the full server test suite

Run: `cd packages/server && npx jest --no-coverage`

Expected: All existing tests PASS plus the 8 new email SSR tests.

**Note:** The full server test suite requires a running PostgreSQL database and application server. If the environment is not available, the new `emailSSR.test.ts` tests can be run in isolation after verifying that the `globalSetup` can connect to the database.

---

## Task 4: Mark PR 10 as DONE in the migration documentation

**Files:**
- Modify: `docs/react-v18-migration.md`

### Step 1: Update the PR 10 section header

Change line 329 from:
```
### PR 10 — Verify email SSR rendering
```
to:
```
### PR 10 — Verify email SSR rendering — DONE
```

### Step 2: Add actual results to the PR 10 section

Replace the PR 10 section content (lines 329-345) with:

```markdown
### PR 10 — Verify email SSR rendering — DONE

**~60 lines changed | Risk: LOW**

`ReactDOMServer.renderToStaticMarkup` is fully compatible with React 18 — no API changes, no import path changes needed. This PR adds unit tests verifying all 5 simple email creators produce correct HTML output, plus a direct `renderToStaticMarkup` smoke test confirming React 18 SSR works correctly.

**Changes (actual):**

1. Added `packages/server/__tests__/emailSSR.test.ts` with 8 tests covering:
   - `emailVerificationEmailCreator` — verifies HTML output, token URL construction, invitation token appending
   - `resetPasswordEmailCreator` — verifies HTML output, reset URL construction
   - `pageSharedEmailCreator` — verifies HTML output, subject line, page name rendering
   - `pageAccessRequestEmailCreator` — verifies HTML output, subject line, page name rendering
   - `teamLimitsEmailCreator` — verifies HTML output for all 3 email types (thirtyDayWarning, sevenDayWarning, locked), correct subject lines
   - Direct `renderToStaticMarkup` smoke test — confirms React 18 SSR API works
2. No changes needed to any email creator files — all imports and APIs are React 18 compatible as-is

**Not unit-tested (covered by integration tests):**
- `notificationSummaryCreator` — requires Relay `ServerEnvironment` with live GraphQL context
- `sendSummaryEmailV2` — requires full `InternalContext` with dataLoader

**Testing results:**
- `pnpm --filter parabol-server typecheck` — PASS
- `npx jest __tests__/emailSSR.test.ts` — PASS (8/8)
```

### Step 3: Update the status in the summary table

Change line 686 from:
```
| 10 | Version Bump | Verify email SSR | ~20 | LOW | |
```
to:
```
| 10 | Version Bump | Verify email SSR | ~60 | LOW | **DONE** |
```

### Step 4: Verify the markdown renders correctly

Run: `head -n 700 docs/react-v18-migration.md | tail -n 30`

Expected: The PR 10 section shows "DONE" and the summary table row shows `**DONE**`.

---

## Notes

### Why no code changes to email creators

All 7 email creators use `import ReactDOMServer from 'react-dom/server'` which is the standard import path that works identically in React 17 and React 18. The `renderToStaticMarkup` function signature and behavior are unchanged. React 18's SSR changes are additive (new streaming APIs) and do not affect the existing synchronous API.

### Why dynamic imports in tests

The test file uses `await import(...)` (dynamic imports) rather than top-level `import` statements. This is because `jest.mock()` must be called before the modules are imported, and with top-level imports, the module execution order can cause the mock to not take effect. Dynamic imports inside `test()` blocks guarantee the mocks are registered first.

### Test isolation from integration tests

The new `emailSSR.test.ts` file mocks all external dependencies (`appOrigin`, `analytics`) so it does not require a running server or database. However, it shares the jest config's `globalSetup` which does require PostgreSQL. If running in CI, ensure the database is available, or run this test file in isolation with `--no-globalSetup` (though this is not standard Jest behavior — the existing CI pipeline should handle this).
