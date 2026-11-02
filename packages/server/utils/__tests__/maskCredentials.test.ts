import {maskCredentials} from '../maskCredentials'

test('masks credential-like keys at any depth and keeps everything else whole', () => {
  const content = 'x'.repeat(10_000)
  expect(
    maskCredentials({
      email: 'jane@example.com',
      password: 'hunter2',
      input: {invitationToken: 'abc', content},
      integrations: [{apiKey: 'k', code: '123', name: 'Jira'}]
    })
  ).toEqual({
    email: 'jane@example.com',
    password: '******',
    input: {invitationToken: '******', content},
    integrations: [{apiKey: '******', code: '******', name: 'Jira'}]
  })
})

test('keeps ids that name a credential, but not tokens that name an id', () => {
  expect(
    maskCredentials({tokenId: 'pat_abc', secretIds: ['s1'], idToken: 'eyJ', id_token: 'eyJ'})
  ).toEqual({tokenId: 'pat_abc', secretIds: ['s1'], idToken: '******', id_token: '******'})
})

test('replaces binary data with its size', () => {
  const inlineAvatar = `data:image/png;base64,${'A'.repeat(2000)}`
  expect(
    maskCredentials({
      file: Buffer.from('abc'),
      blob: new Blob(['abcd']),
      avatar: inlineAvatar,
      icon: 'data:image/png;base64,AAAA'
    })
  ).toEqual({
    file: '[binary 3 bytes]',
    blob: '[binary 4 bytes]',
    avatar: `[data url ${inlineAvatar.length} chars]`,
    icon: 'data:image/png;base64,AAAA'
  })
})

test('marks cycles without failing and keeps repeated references', () => {
  const shared = {id: 1}
  const node: Record<string, unknown> = {first: shared, second: shared}
  node.self = node
  expect(maskCredentials(node)).toEqual({first: {id: 1}, second: {id: 1}, self: '[circular]'})
})
