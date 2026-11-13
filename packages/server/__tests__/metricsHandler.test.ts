import type {HttpResponse} from 'uWebSockets.js'
import {createSchema, createYoga} from 'graphql-yoga'
import {FIRST_FILL_PRIORITY} from '../../embedder/getEmbedderJobPriority'
import {graphqlPrometheusPlugin, logins, metricsHandler} from '../metricsHandler'
import {Logger} from '../utils/Logger'

const mockCountJobsByState = jest.fn()
const mockCountFillJobs = jest.fn().mockResolvedValue([])
// The live job count filters on priority < FIRST_FILL_PRIORITY, and the fill count on >=
const mockFilterJobs = jest.fn((_column: string, operator: string) => ({
  groupBy: () => ({execute: operator === '<' ? mockCountJobsByState : mockCountFillJobs})
}))
jest.mock('../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    selectFrom: () => ({select: () => ({where: mockFilterJobs})})
  })
}))

const scrape = async () => {
  const response = {status: '', body: ''}
  const res = {
    onAborted: () => res,
    cork: (callback: () => void) => {
      callback()
      return res
    },
    writeStatus: (status: string) => {
      response.status = status
      return res
    },
    writeHeader: () => res,
    end: (body = '') => {
      response.body = body
      return res
    }
  }
  await metricsHandler(res as unknown as HttpResponse)
  return response
}

// The fill count is kept for 5 minutes, so a scrape that needs a fresh one moves the clock past it
let clock = 0
const scrapeLater = async () => {
  clock = Math.max(clock, Date.now()) + 5 * 60_000
  const now = jest.spyOn(Date, 'now').mockReturnValue(clock)
  try {
    return await scrape()
  } finally {
    now.mockRestore()
  }
}

const HARRIER = 'Parabol/harrier-oss-v1-270m-ONNX-INT8'
const fill = (model: string, workflow: string, state: string) =>
  `parabol_embedder_fill_jobs{model="${model}",workflow="${workflow}",state="${state}"}`

test('reports every embedder job state, including empty ones', async () => {
  mockCountJobsByState.mockResolvedValue([{state: 'queued', jobs: '3'}])
  const {status, body} = await scrape()
  expect(status).toBe('200 OK')
  expect(body).toContain('parabol_embedder_jobs{state="queued"} 3')
  expect(body).toContain('parabol_embedder_jobs{state="running"} 0')
  expect(body).toContain('parabol_embedder_jobs{state="failed"} 0')
})

test("leaves a new model's fill out of the embedder job counts", async () => {
  mockCountJobsByState.mockResolvedValue([])
  await scrape()
  expect(mockFilterJobs).toHaveBeenCalledWith('priority', '<', FIRST_FILL_PRIORITY)
})

test('reports the fill jobs of each model in the queue, by workflow and state', async () => {
  mockCountJobsByState.mockResolvedValue([])
  mockCountFillJobs.mockResolvedValue([
    {modelId: HARRIER, jobType: 'embedPage:start', state: 'queued', jobs: '5'},
    {modelId: HARRIER, jobType: 'embed:start', state: 'failed', jobs: '2'},
    {modelId: null, jobType: 'embed:start', state: 'queued', jobs: '9'}
  ])
  const {body} = await scrapeLater()
  expect(mockFilterJobs).toHaveBeenCalledWith('priority', '>=', FIRST_FILL_PRIORITY)
  expect(body).toContain(`${fill(HARRIER, 'embedPage', 'queued')} 5`)
  expect(body).toContain(`${fill(HARRIER, 'embed', 'failed')} 2`)
  expect(body).not.toContain(fill(HARRIER, 'embed', 'queued'))
  expect(body).not.toContain('parabol_embedder_fill_jobs{model="null"')
})

test('counts the fill at most every 5 minutes, and drops a model once its fill is done', async () => {
  mockCountJobsByState.mockResolvedValue([])
  mockCountFillJobs.mockResolvedValue([
    {modelId: HARRIER, jobType: 'embedPage:start', state: 'queued', jobs: '5'}
  ])
  await scrapeLater()
  mockCountFillJobs.mockClear()
  mockCountFillJobs.mockResolvedValue([])
  const {body} = await scrape()
  expect(mockCountFillJobs).not.toHaveBeenCalled()
  expect(body).toContain(`${fill(HARRIER, 'embedPage', 'queued')} 5`)
  const {body: later} = await scrapeLater()
  expect(mockCountFillJobs).toHaveBeenCalledTimes(1)
  expect(later).not.toContain('parabol_embedder_fill_jobs{')
})

test('serves the other metrics when the embedder queue cannot be counted', async () => {
  const loggedError = jest.spyOn(Logger, 'error').mockImplementation(() => {})
  mockCountJobsByState.mockRejectedValue(new Error('connection refused'))
  logins.inc({method: 'google'})
  const {status, body} = await scrape()
  expect(status).toBe('200 OK')
  expect(body).toContain('parabol_logins_total{method="google"} 1')
  expect(loggedError).toHaveBeenCalledWith(
    'Could not count embedder jobs for metrics',
    expect.any(Error)
  )
  loggedError.mockRestore()
})

test('counts GraphQL operations by name and times them by operation type only', async () => {
  mockCountJobsByState.mockResolvedValue([])
  const yoga = createYoga({
    schema: createSchema({typeDefs: 'type Query { hello: String }', resolvers: {}}),
    plugins: [graphqlPrometheusPlugin]
  })
  await yoga.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({query: 'query Hello { hello }'})
  })
  const {body} = await scrape()
  expect(body).toMatch(/graphql_envelop_request\{[^}]*operationName="Hello"[^}]*\} 1/)
  expect(body).toContain('graphql_envelop_request_duration_count{operationType="query"} 1')
  expect(body).not.toMatch(/graphql_envelop_request_duration_count\{[^}]*operationName/)
  expect(body).not.toContain('graphql_envelop_phase_')
})
