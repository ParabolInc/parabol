import getErrorFingerprint, {
  getTopAppFrameFunction,
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
