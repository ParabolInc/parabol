import parseClientErrorBatch, {MAX_CLIENT_ERROR_REPORTS} from '../parseClientErrorBatch'

const report = {
  level: 'error',
  name: 'TypeError',
  message: 'boom',
  stack: 'TypeError: boom\n    at render (https://example.com/build/app_1.js:1:2)',
  eventId: '2f1c7a8e-5b3d-4c9a-8e6f-1a2b3c4d5e6f',
  traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  sessionId: 'tab-1',
  release: '15.11.0',
  route: '/meet/abc',
  userAgent: 'Mozilla/5.0',
  count: 2,
  breadcrumbs: [{time: '2026-10-30T00:00:00.000Z', type: 'navigation', message: '/meet/abc'}]
}

test('accepts a well-formed batch', () => {
  expect(parseClientErrorBatch({reports: [report]})).toEqual([report])
})

test('rejects bodies that are not a batch, and batches that are empty or too large', () => {
  const tooManyReports = Array.from({length: MAX_CLIENT_ERROR_REPORTS + 1}, () => report)
  const invalidBodies = [
    null,
    'reports',
    {},
    {reports: 'x'},
    {reports: []},
    {reports: tooManyReports}
  ]
  invalidBodies.forEach((body) => {
    expect(parseClientErrorBatch(body)).toBeNull()
  })
})

test('clips long text, drops malformed ids and keeps the last 30 breadcrumbs', () => {
  const breadcrumbs = Array.from({length: 40}, (_, i) => ({
    time: '2026-10-30T00:00:00.000Z',
    type: 'operation',
    message: `query Query${i}`,
    traceId: i % 2 ? 'not-a-trace-id' : '4bf92f3577b34da6a3ce929d0e0e4736'
  }))
  const [parsedReport] = parseClientErrorBatch({
    reports: [
      {
        ...report,
        level: 'fatal',
        message: 'x'.repeat(2000),
        eventId: 'event-1',
        traceId: 'TRACE',
        sessionId: 'tab 1',
        release: 'v1 <script>',
        count: 1e9,
        breadcrumbs: [...breadcrumbs, {type: 'click', message: 'Save', time: 'now'}]
      }
    ]
  })!
  expect(parsedReport).toMatchObject({level: 'error', count: 1000})
  expect(parsedReport!.message).toHaveLength(1000)
  expect(parsedReport!.eventId).toBeUndefined()
  expect(parsedReport!.traceId).toBeUndefined()
  expect(parsedReport!.sessionId).toBeUndefined()
  expect(parsedReport!.release).toBeUndefined()
  expect(parsedReport!.breadcrumbs).toHaveLength(29)
  expect(parsedReport!.breadcrumbs[0]!.message).toBe('query Query11')
  expect(parsedReport!.breadcrumbs[0]).not.toHaveProperty('traceId')
})

test('skips a report with no message', () => {
  expect(parseClientErrorBatch({reports: [{...report, message: ''}, report]})).toEqual([report])
})
