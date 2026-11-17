import parseSessionId from '../parseSessionId'

test('accepts a tab session id', () => {
  expect(parseSessionId('2f1c7a8e-5b3d-4c9a-8e6f-1a2b3c4d5e6f')).toBe(
    '2f1c7a8e-5b3d-4c9a-8e6f-1a2b3c4d5e6f'
  )
})

test('drops anything that could smuggle text into the logs', () => {
  const invalidSessionIds = [undefined, null, 7, '', 'tab 1', 'a\nb', 'x'.repeat(65)]
  invalidSessionIds.forEach((sessionId) => {
    expect(parseSessionId(sessionId)).toBeUndefined()
  })
})
