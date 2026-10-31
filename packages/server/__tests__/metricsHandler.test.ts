import type {HttpResponse} from 'uWebSockets.js'
import {createSchema, createYoga} from 'graphql-yoga'
import {graphqlPrometheusPlugin, logins, metricsHandler} from '../metricsHandler'
import {Logger} from '../utils/Logger'

const mockCountJobsByState = jest.fn()
jest.mock('../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    selectFrom: () => ({select: () => ({groupBy: () => ({execute: mockCountJobsByState})})})
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

test('reports every embedder job state, including empty ones', async () => {
  mockCountJobsByState.mockResolvedValue([{state: 'queued', jobs: '3'}])
  const {status, body} = await scrape()
  expect(status).toBe('200 OK')
  expect(body).toContain('parabol_embedder_jobs{state="queued"} 3')
  expect(body).toContain('parabol_embedder_jobs{state="running"} 0')
  expect(body).toContain('parabol_embedder_jobs{state="failed"} 0')
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
