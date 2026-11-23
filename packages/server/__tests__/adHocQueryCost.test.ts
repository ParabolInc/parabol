import {HOST, PROTOCOL, sendPublic, signUp} from './common'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const sendAdHoc = async (bearerToken: string, query: string) => {
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', authorization: `Bearer ${bearerToken}`},
    body: JSON.stringify({query})
  })
  return response.json()
}

test('an ad hoc query still runs after more than 100 other ad hoc queries', async () => {
  const {cookie} = await signUp()
  const tokenRes = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'ad hoc cost',
      scopes: ['USERS_READ'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(tokenRes.errors).toBeUndefined()
  const token = tokenRes.data.createPersonalAccessToken.token as string
  const nonce = Date.now().toString(36)
  const query = (i: number) => `query AdHocCost${nonce}x${i} { viewer { id } }`

  const first = await sendAdHoc(token, query(0))
  expect(first.errors).toBeUndefined()
  for (let i = 1; i <= 101; i++) {
    const res = await sendAdHoc(token, query(i))
    expect(res.errors).toBeUndefined()
  }
  const repeat = await sendAdHoc(token, query(0))
  expect(repeat.errors).toBeUndefined()
  expect(repeat.data.viewer.id).toEqual(expect.any(String))
})
