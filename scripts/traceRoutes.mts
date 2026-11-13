/*
  Traces how the main routes load on this checkout's running dev stack
  `pnpm dev:trace` signs in a seeded user, then loads each route cold and through in-app clicks. For each one it records
  every GraphQL query, which queries waited on another, how long the page stayed blank and what the app reported to
  /client-metrics. Results go to dev/perf/<time>/summary.json
  Every GraphQL request, over HTTP and the websocket, gets a round trip of --rtt ms (default 100). Code chunks get none,
  because in production the PWA serves them from its precache
  --email <email>       the user to trace as (default perf@example.com), seeded with Copper on first use
  --frames              also save a filmstrip of each route
  --compare <path>      print the change from an earlier summary.json
*/
import {execFileSync} from 'child_process'
import fs from 'fs'
import {createRequire} from 'module'
import path from 'path'
import {type Browser, type BrowserContext, chromium, type Page} from 'playwright-core'
import {setTimeout as sleep} from 'timers/promises'
import connectToPostgres from './devStack/connectToPostgres.mts'
import readStack from './devStack/readStack.mts'
import getProjectRoot from './webpack/utils/getProjectRoot.js'

interface TracedOperation {
  via: 'http' | 'ws'
  docId?: string
  start: number
  end?: number
}

interface RouteTrace {
  operations: TracedOperation[]
  mutationTimes: number[]
  contentAt: number | null
  mainEmptyMs: number
}

declare global {
  interface Window {
    __routeTrace?: RouteTrace
  }
}

interface Target {
  label: string
  path: string
  clickTo?: string
}

interface ReportedNavigation {
  route: string
  kind: 'load' | 'navigate'
  durationMs: number
  queriesInSequence: number
  queryCount: number
  suspendedQueries: number
}

interface RouteResult {
  label: string
  path: string
  clickTo?: string
  queriesInSequence: number
  waitingBetweenQueriesMs: number
  queries: {name: string; via: string; start: number; end: number}[]
  settledMs: number
  blankMs: number
  reported?: ReportedNavigation
}

const require = createRequire(import.meta.url)
const PROJECT_ROOT = getProjectRoot()
const GENERATED_DIR = path.join(PROJECT_ROOT, 'packages/client/__generated__')

const readFlag = (name: string) => {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}
const RTT_MS = Number(readFlag('rtt') ?? 100)
const EMAIL = readFlag('email') ?? 'perf@example.com'
const COMPARE_PATH = readFlag('compare')
const SAVE_FRAMES = process.argv.includes('--frames')
const QUIET_MS = 1000
const MAX_WAIT_MS = 20_000
const RENDER_GAP_MS = 300

const operationsByDocId = new Map<string, {name: string; kind: string}>()
const docIdsByName = new Map<string, string>()
for (const file of fs.readdirSync(GENERATED_DIR)) {
  if (!file.endsWith('.graphql.ts')) continue
  const source = fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8')
  const params = source.match(
    /"params": \{\s*"id": "([^"]+)",[\s\S]*?"name": "(\w+)",\s*"operationKind": "(\w+)"/
  )
  if (!params) continue
  const [, docId, name, kind] = params
  operationsByDocId.set(docId!, {name: name!, kind: kind!})
  docIdsByName.set(name!, docId!)
}
const kindOf = (docId?: string) => (docId ? operationsByDocId.get(docId)?.kind : undefined)

const instrumentPage = () => {
  const trace: RouteTrace = {operations: [], mutationTimes: [], contentAt: null, mainEmptyMs: 0}
  window.__routeTrace = trace
  const now = () => performance.now()
  const readDocId = (body: string) => {
    try {
      return JSON.parse(body).docId as string | undefined
    } catch {
      return undefined
    }
  }
  const originalFetch = window.fetch
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const body = init?.body
    if (!url.endsWith('/graphql') || typeof body !== 'string') return originalFetch(input, init)
    const operation: TracedOperation = {via: 'http', docId: readDocId(body), start: now()}
    trace.operations.push(operation)
    const response = originalFetch(input, init)
    response
      .then((res) => res.clone().text())
      .catch(() => {})
      .finally(() => {
        operation.end = now()
      })
    return response
  }
  const NativeWebSocket = window.WebSocket
  window.WebSocket = class extends NativeWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols)
      const pendingById = new Map<string, TracedOperation>()
      const send = this.send.bind(this)
      this.send = (data) => {
        if (typeof data === 'string' && data.includes('"subscribe"')) {
          const message = JSON.parse(data)
          const operation: TracedOperation = {
            via: 'ws',
            docId: message.payload?.docId,
            start: now()
          }
          trace.operations.push(operation)
          pendingById.set(message.id, operation)
        }
        send(data)
      }
      this.addEventListener('message', (event) => {
        if (typeof event.data !== 'string') return
        const message = JSON.parse(event.data)
        const operation = pendingById.get(message.id)
        if (!operation || (message.type !== 'complete' && message.type !== 'error')) return
        operation.end = now()
        pendingById.delete(message.id)
      })
    }
  }
  new MutationObserver(() => {
    const lastTime = trace.mutationTimes.at(-1) ?? -Infinity
    if (now() - lastTime > 16 && trace.mutationTimes.length < 5000) trace.mutationTimes.push(now())
  }).observe(document, {subtree: true, childList: true, characterData: true})
  let mainEmptySince: number | null = null
  setInterval(() => {
    if (trace.contentAt === null && document.getElementById('root')?.textContent?.trim()) {
      trace.contentAt = now()
    }
    const main = document.querySelector('main')
    const isMainEmpty = !!main && !main.textContent?.trim()
    if (isMainEmpty && mainEmptySince === null) mainEmptySince = now()
    if (!isMainEmpty && mainEmptySince !== null) {
      trace.mainEmptyMs += now() - mainEmptySince
      mainEmptySince = null
    }
  }, 16)
}

const waitForQuiet = async (page: Page) => {
  const startedAt = Date.now()
  let quietSince = Date.now()
  let lastSignature = ''
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    const snapshot = await page.evaluate(() => {
      const trace = window.__routeTrace
      if (!trace) return null
      return {
        count: trace.operations.length,
        pending: trace.operations.filter((op) => op.end === undefined).map((op) => op.docId),
        lastMutation: trace.mutationTimes.at(-1)
      }
    })
    const pendingRequests = snapshot?.pending.filter((docId) => kindOf(docId) !== 'subscription')
    const signature = JSON.stringify([snapshot?.count, snapshot?.lastMutation, pendingRequests])
    if (signature !== lastSignature || pendingRequests?.length) {
      lastSignature = signature
      quietSince = Date.now()
    }
    if (Date.now() - quietSince >= QUIET_MS) return
    await sleep(100)
  }
}

const sequenceOf = (queries: Required<TracedOperation>[]) => {
  const chain: Required<TracedOperation>[] = []
  let current = queries.reduce<Required<TracedOperation> | undefined>(
    (latest, query) => (!latest || query.end > latest.end ? query : latest),
    undefined
  )
  while (current) {
    chain.unshift(current)
    const before: Required<TracedOperation> = current
    current = queries
      .filter((query) => query !== before && query.end <= before.start + 5)
      .reduce<Required<TracedOperation> | undefined>(
        (latest, query) => (!latest || query.end > latest.end ? query : latest),
        undefined
      )
  }
  return chain
}

const settledAfter = (mutationTimes: number[], since: number) => {
  let settled = since
  for (const time of mutationTimes) {
    if (time < since) continue
    if (time - settled > RENDER_GAP_MS) break
    settled = time
  }
  return settled
}

const createContext = async (
  browser: Browser,
  storageState: string,
  reportedNavigations: ReportedNavigation[]
) => {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    storageState,
    viewport: {width: 1440, height: 900}
  })
  await context.route(/\/graphql$/, async (route) => {
    await sleep(RTT_MS)
    await route.continue()
  })
  await context.routeWebSocket(/^wss:\/\/[^/]+\/?$/, (clientSocket) => {
    const serverSocket = clientSocket.connectToServer()
    clientSocket.onMessage((message) => {
      setTimeout(() => serverSocket.send(message), RTT_MS / 2)
    })
    serverSocket.onMessage((message) => {
      setTimeout(() => clientSocket.send(message), RTT_MS / 2)
    })
  })
  await context.route(/\/client-metrics$/, async (route) => {
    const body = route.request().postData()
    if (body) reportedNavigations.push(...JSON.parse(body).navigations)
    await route.fulfill({status: 204})
  })
  await context.addInitScript(instrumentPage)
  return context
}

const saveFrames = async (context: BrowserContext, page: Page, framesDir: string) => {
  const cdp = await context.newCDPSession(page)
  const timeOrigin = await page.evaluate(() => performance.timeOrigin)
  fs.mkdirSync(framesDir, {recursive: true})
  cdp.on('Page.screencastFrame', ({data, metadata, sessionId}) => {
    const frameAt = Math.round((metadata.timestamp ?? 0) * 1000 - timeOrigin)
    fs.writeFileSync(path.join(framesDir, `${frameAt}.jpg`), Buffer.from(data, 'base64'))
    cdp.send('Page.screencastFrameAck', {sessionId}).catch(() => {})
  })
  await cdp.send('Page.startScreencast', {format: 'jpeg', quality: 50, maxWidth: 720})
}

const traceRoute = async (
  browser: Browser,
  storageState: string,
  baseURL: string,
  target: Target,
  outDir: string
): Promise<RouteResult> => {
  const reportedNavigations: ReportedNavigation[] = []
  const context = await createContext(browser, storageState, reportedNavigations)
  const page = await context.newPage()
  const framesDir = path.join(outDir, target.label)
  let since = 0
  if (target.clickTo) {
    await page.goto(baseURL + target.path, {waitUntil: 'commit'})
    await waitForQuiet(page)
    if (SAVE_FRAMES) await saveFrames(context, page, framesDir)
    since = await page.evaluate(() => {
      window.__routeTrace!.mainEmptyMs = 0
      return performance.now()
    })
    await page.click(`a[href="${target.clickTo}"]`)
  } else {
    await page.goto(baseURL + target.path, {waitUntil: 'commit'})
    if (SAVE_FRAMES) await saveFrames(context, page, framesDir)
  }
  await waitForQuiet(page)
  const trace = (await page.evaluate(() => window.__routeTrace))!
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await sleep(300)
  await context.close()

  const queries = trace.operations.filter(
    (op): op is Required<TracedOperation> =>
      op.end !== undefined && op.start >= since - 5 && kindOf(op.docId) === 'query'
  )
  const sequence = sequenceOf(queries)
  const lastQueryEnd = Math.max(since, ...queries.map((query) => query.end))
  const waitingBetweenQueriesMs = sequence.reduce(
    (total, query, index) => (index === 0 ? 0 : total + query.start - sequence[index - 1]!.end),
    0
  )
  const relative = (time: number) => Math.round(time - since)
  const reportedKind = target.clickTo ? 'navigate' : 'load'
  return {
    label: target.label,
    path: target.path,
    clickTo: target.clickTo,
    queriesInSequence: sequence.length,
    waitingBetweenQueriesMs: Math.round(waitingBetweenQueriesMs),
    queries: queries.map((query) => ({
      name: operationsByDocId.get(query.docId)?.name ?? query.docId,
      via: query.via,
      start: relative(query.start),
      end: relative(query.end)
    })),
    settledMs: relative(settledAfter(trace.mutationTimes, lastQueryEnd)),
    blankMs: Math.round(target.clickTo ? trace.mainEmptyMs : (trace.contentAt ?? 0)),
    reported: reportedNavigations.findLast((navigation) => navigation.kind === reportedKind)
  }
}

const findFixtures = async (email: string) => {
  const client = await connectToPostgres()
  try {
    const user = (
      await client.query<{id: string}>('SELECT id FROM "User" WHERE email = $1', [email])
    ).rows[0]
    if (!user) return null
    const {rows: teams} = await client.query<{id: string; orgId: string}>(
      `SELECT t.id, t."orgId" FROM "TeamMember" tm
        JOIN "Team" t ON t.id = tm."teamId"
        JOIN "Organization" o ON o.id = t."orgId"
       WHERE tm."userId" = $1 AND tm."isNotRemoved" AND o.name = 'Copper'
       ORDER BY (SELECT count(*) FROM "Task" WHERE "teamId" = t.id) DESC`,
      [user.id]
    )
    const [team, otherTeam] = teams
    if (!team || !otherTeam) return null
    const meetingIn = async (teamIds: string[], isEnded: boolean) =>
      (
        await client.query<{id: string}>(
          `SELECT id FROM "NewMeeting" WHERE "teamId" = ANY($1) AND "meetingType" = 'retrospective'
             AND ("endedAt" IS NOT NULL) = $2 ORDER BY "createdAt" DESC LIMIT 1`,
          [teamIds, isEnded]
        )
      ).rows[0]?.id
    return {
      team: team.id,
      otherTeam: otherTeam.id,
      org: team.orgId,
      endedRetro: await meetingIn(
        teams.map(({id}) => id),
        true
      ),
      activeRetro: await meetingIn([team.id], false)
    }
  } finally {
    await client.end()
  }
}

const runScript = (script: string, ...args: string[]) =>
  execFileSync(process.execPath, [path.join(PROJECT_ROOT, 'scripts', script), ...args], {
    encoding: 'utf8'
  })

const startRetrospective = async (
  browser: Browser,
  storageState: string,
  url: string,
  teamId: string
) => {
  const context = await browser.newContext({ignoreHTTPSErrors: true, storageState})
  const page = await context.newPage()
  await page.goto(`${url}/meetings`, {waitUntil: 'domcontentloaded'})
  await page.evaluate(
    async ({docId, teamId}) => {
      await fetch('/graphql', {
        method: 'POST',
        headers: {'content-type': 'application/json', accept: 'application/json'},
        body: JSON.stringify({docId, variables: {teamId}})
      })
    },
    {docId: docIdsByName.get('StartRetrospectiveMutation'), teamId}
  )
  await context.close()
}

const formatMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`)

const printResults = (results: RouteResult[], previous?: RouteResult[]) => {
  const rows = results.map((result) => {
    const before = previous?.find(({label}) => label === result.label)
    const change = before
      ? ` (${result.settledMs - before.settledMs >= 0 ? '+' : ''}${formatMs(result.settledMs - before.settledMs)}, ${before.queriesInSequence}→${result.queriesInSequence} in sequence)`
      : ''
    const reported = result.reported
      ? `${formatMs(result.reported.durationMs)}, ${result.reported.queriesInSequence} in sequence, ${result.reported.suspendedQueries} suspended`
      : 'nothing'
    return {
      route: result.label,
      'queries in sequence': result.queriesInSequence,
      'waiting between them': formatMs(result.waitingBetweenQueriesMs),
      blank: formatMs(result.blankMs),
      settled: formatMs(result.settledMs) + change,
      'app reported': reported
    }
  })
  console.table(rows)
}

const traceRoutes = async () => {
  const stack = readStack()
  if (!stack?.ready) {
    console.error(
      'The dev stack is not ready. Start it with `pnpm dev`, then `pnpm dev:status --wait`'
    )
    process.exit(1)
  }
  if (stack.database) process.env.POSTGRES_DB = stack.database
  require('./webpack/utils/dotenv.js')

  let fixtures = await findFixtures(EMAIL)
  if (!fixtures) {
    console.log(`Seeding Copper for ${EMAIL}`)
    runScript('devSeed.mts', EMAIL)
    fixtures = await findFixtures(EMAIL)
  }
  if (!fixtures?.endedRetro)
    throw new Error(`Could not find Copper teams and meetings for ${EMAIL}`)
  const {storageState} = JSON.parse(runScript('devLogin.mts', EMAIL)) as {storageState: string}

  const browser = await chromium.launch({headless: true})
  if (!fixtures.activeRetro) {
    await startRetrospective(browser, storageState, stack.url, fixtures.team)
    fixtures = await findFixtures(EMAIL)
  }
  const {team, otherTeam, org, endedRetro, activeRetro} = fixtures!
  const targets: Target[] = [
    {label: 'meetings', path: '/meetings'},
    {label: 'team', path: `/team/${team}`},
    {label: 'team settings', path: `/team/${team}/settings`},
    {label: 'my timeline', path: '/me'},
    {label: 'my tasks', path: '/me/tasks'},
    {label: 'org billing', path: `/me/organizations/${org}/billing`},
    {label: 'org members', path: `/me/organizations/${org}/members`},
    {label: 'summary', path: `/new-summary/${endedRetro}`},
    {label: 'live retro', path: `/meet/${activeRetro}`},
    {label: 'reports', path: `/reports/${org}`},
    {label: 'activity library', path: '/activity-library'},
    {label: 'click meetings → team', path: '/meetings', clickTo: `/team/${team}`},
    {label: 'click team → team', path: `/team/${team}`, clickTo: `/team/${otherTeam}`}
  ]
  const outDir = path.join(
    PROJECT_ROOT,
    'dev',
    'perf',
    new Date().toISOString().replace(/[:.]/g, '-')
  )
  fs.mkdirSync(outDir, {recursive: true})
  await traceRoute(browser, storageState, stack.url, targets[0]!, outDir)
  const results: RouteResult[] = []
  for (const target of targets) {
    results.push(await traceRoute(browser, storageState, stack.url, target, outDir))
  }
  await browser.close()

  const summaryPath = path.join(outDir, 'summary.json')
  fs.writeFileSync(summaryPath, JSON.stringify({rttMs: RTT_MS, results}, null, 2))
  const previous = COMPARE_PATH
    ? (JSON.parse(fs.readFileSync(COMPARE_PATH, 'utf8')).results as RouteResult[])
    : undefined
  printResults(results, previous)
  console.log(`GraphQL round trip ${RTT_MS}ms · ${summaryPath}`)
}

traceRoutes().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
