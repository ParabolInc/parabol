import getErrorFingerprint, {
  getTopAppFrameFunction,
  isLetterOnlyId,
  normalizeErrorMessage
} from '../getErrorFingerprint'

const makeError = (message: string, frames: string[]) => {
  const error = new Error(message)
  error.stack = [`Error: ${message}`, ...frames].join('\n')
  return error
}

const resolverFrame = '    at getTeam (/app/packages/server/graphql/queries/getTeam.ts:10:3)'

test('replaces ids, numbers, emails, urls and quoted strings', () => {
  expect(
    normalizeErrorMessage(
      'Team 7Xk2abQz9 not found for jane@example.com at https://x.co/a?b=1 after 3 tries: "Too slow"'
    )
  ).toBe('Team <id> not found for <email> at <url> after <n> tries: <str>')
  expect(normalizeErrorMessage('Meeting 123e4567-e89b-12d3-a456-426614174000 ended')).toBe(
    'Meeting <uuid> ended'
  )
})

test('errors that differ only in ids share a fingerprint', () => {
  const first = makeError('Team 7Xk2abQz9 not found', [resolverFrame])
  const second = makeError('Team Q1w2e3r4t5 not found', [resolverFrame])
  expect(getErrorFingerprint('web', first)).toBe(getErrorFingerprint('web', second))
  expect(getErrorFingerprint('web', first)).toMatch(/^[0-9a-f]{16}$/)
})

test('the top app frame and the service separate otherwise identical errors', () => {
  const fromGetTeam = makeError('boom', [resolverFrame])
  const fromGetOrg = makeError('boom', [
    '    at getOrg (/app/packages/server/graphql/queries/getOrg.ts:4:1)'
  ])
  expect(getErrorFingerprint('web', fromGetTeam)).not.toBe(getErrorFingerprint('web', fromGetOrg))
  expect(getErrorFingerprint('web', fromGetTeam)).not.toBe(
    getErrorFingerprint('embedder', fromGetTeam)
  )
})

test('the top app frame skips the logger, dependencies and node internals', () => {
  const stack = [
    'Error: boom',
    '    at trace (/app/packages/server/utils/Logger.ts:1:1)',
    '    at Object.query (/app/node_modules/pg/lib/client.js:1:1)',
    '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)',
    '    at async updateMeeting (/app/packages/server/graphql/mutations/updateMeeting.ts:42:7)'
  ].join('\n')
  expect(getTopAppFrameFunction(stack)).toBe('updateMeeting')
})

test('replaces generated ids that have no digit and keeps identifiers', () => {
  expect(normalizeErrorMessage('No base meeting object found in Relay UZoObZMXvy')).toBe(
    'No base meeting object found in Relay <id>'
  )
  expect(
    normalizeErrorMessage(
      'Notification Subscription Payload received without field: DragEstimatingTaskSuccess'
    )
  ).toBe('Notification Subscription Payload received without field: DragEstimatingTaskSuccess')
  expect(normalizeErrorMessage('getElementById failed on innerHTML of existingIDs')).toBe(
    'getElementById failed on innerHTML of existingIDs'
  )
})

test.each([
  ['UZoObZMXvy', true],
  ['RJGnNXvvShY', true],
  ['FPoKiGQzbSQ', true],
  ['DragEstimatingTaskSuccess', false],
  ['getElementById', false],
  ['toAssigneeId', false],
  ['GraphQLHttpError', false],
  ['XMLHttpRequest', false],
  ['PostgreSQL', false],
  ['existingIDs', false],
  ['retrospective', false],
  ['UNAUTHORIZED', false]
])('isLetterOnlyId(%s) is %s', (token, expected) => {
  expect(isLetterOnlyId(token)).toBe(expected)
})

// symbolicated top frames production logged for one console error, from Chrome, Safari and two Firefox releases
test('a console error has one fingerprint in every browser and release', () => {
  const message =
    'Notification Subscription Payload received without field: SetNotificationSettingSuccess'
  const fingerprints = [
    '    at packages/client/utils/registerClientErrorHandlers.ts:29:19',
    '    at packages/client/utils/registerClientErrorHandlers.ts:29:24',
    '    at 71000/console.error/< (packages/client/utils/registerClientErrorHandlers.ts:29:24)',
    '    at 92667/console.error/< (packages/client/utils/registerClientErrorHandlers.ts:29:24)'
  ].map((frame) => {
    const error = makeError(message, [frame])
    error.name = 'ConsoleError'
    return getErrorFingerprint('parabol-client', error)
  })
  expect(new Set(fingerprints).size).toBe(1)
})

test("a rejection that isn't an Error keeps its fingerprint when the minifier renames the reporter", () => {
  const in15150 = makeError('{}', [
    '    at m (packages/client/utils/reportClientError.ts:56:15)',
    '    at reportClientError (packages/client/utils/registerClientErrorHandlers.ts:12:6)'
  ])
  const in15160 = makeError('{}', [
    '    at v (packages/client/utils/reportClientError.ts:57:15)',
    '    at reportClientError (packages/client/utils/registerClientErrorHandlers.ts:44:6)'
  ])
  expect(getErrorFingerprint('parabol-client', in15150)).toBe(
    getErrorFingerprint('parabol-client', in15160)
  )
})

test("a browser's top app frame skips webpack's runtime and scripts an extension injected", () => {
  const chunkStack = [
    'ChunkLoadError: Loading chunk 9391 failed.',
    '    at c.f.j (webpack/runtime/jsonp chunk loading:27:1)',
    '    at loadChunk (packages/client/utils/retryChunkLoadErrorOnce.ts:25:11)'
  ].join('\n')
  const extensionStack = [
    'Error: Rejected',
    '    at ServiceWorkerContainer.<anonymous> (<anonymous>:662:449)',
    '    at wrapped (chrome-extension://abcdefghijklmnop/content.js:1:2)',
    '    at register (packages/client/client.tsx:16:29)'
  ].join('\n')
  expect(getTopAppFrameFunction(chunkStack, 'parabol-client')).toBe('loadChunk')
  expect(getTopAppFrameFunction(extensionStack, 'parabol-client')).toBe('register')
})

test("a server stack's top app frame is the one it was before browsers skipped more", () => {
  const stack = ['Error: boom', '    at Array.map (<anonymous>)', resolverFrame].join('\n')
  expect(getTopAppFrameFunction(stack, 'web')).toBe('Array.map')
})

test('a meeting id with no digit no longer splits an error into one fingerprint per meeting', () => {
  const frame =
    '    at navigateMeeting (/app/packages/client/mutations/NavigateMeetingMutation.ts:1:1)'
  const first = makeError('No base meeting object found in Relay UZoObZMXvy', [frame])
  const second = makeError('No base meeting object found in Relay 3xQ9kLmN0p', [frame])
  expect(getErrorFingerprint('parabol-client', first)).toBe(
    getErrorFingerprint('parabol-client', second)
  )
})
