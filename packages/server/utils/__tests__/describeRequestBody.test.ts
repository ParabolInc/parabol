import describeRequestBody from '../describeRequestBody'

test('a JSON body is parsed and masked', () => {
  const body = Buffer.from(JSON.stringify({userName: 'jane', password: 'hunter2'}))
  expect(describeRequestBody(body, 'application/scim+json; charset=utf-8')).toEqual({
    body: {userName: 'jane', password: '******'}
  })
})

test('a beacon sends JSON as text/plain, and it is parsed all the same', () => {
  expect(describeRequestBody(Buffer.from('{"reports":[]}'), 'text/plain;charset=UTF-8')).toEqual({
    body: {reports: []}
  })
})

test('a form is parsed and masked', () => {
  const body = Buffer.from('grant_type=authorization_code&client_secret=s3cr3t&code=abc')
  expect(describeRequestBody(body, 'application/x-www-form-urlencoded')).toEqual({
    body: {grant_type: 'authorization_code', client_secret: '******', code: 'abc'}
  })
})

test('text that is not JSON is kept as masked text', () => {
  expect(describeRequestBody(Buffer.from('{"token":"abc", oops'), 'application/json')).toEqual({
    body: '{"token":******, oops'
  })
})

test('a binary body is described by its size', () => {
  expect(describeRequestBody(Buffer.alloc(2048), 'image/png')).toEqual({
    body: '[2048 bytes of image/png]'
  })
})

test('a large body is cut to size and keeps its full length', () => {
  const body = Buffer.from(JSON.stringify({content: 'x'.repeat(20_000)}))
  const description = describeRequestBody(body, 'application/json')
  expect(description?.body).toHaveLength(16_000)
  expect(description?.bodyLength).toBe(body.length)
})

test('an empty body is left out', () => {
  expect(describeRequestBody(Buffer.alloc(0), 'application/json')).toBeUndefined()
})
