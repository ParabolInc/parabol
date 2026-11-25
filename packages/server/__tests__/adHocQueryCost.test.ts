import getRedis from '../utils/getRedis'
import {HOST, PROTOCOL, sendPublic, signUp} from './common'

afterAll(async () => {
  await getRedis().quit()
})

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const createToken = async (cookie: string) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'ad hoc cost',
      scopes: ['USERS_READ'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const sendAdHoc = async (bearerToken: string, query: string) => {
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', authorization: `Bearer ${bearerToken}`},
    body: JSON.stringify({query})
  })
  return response.json()
}

const getChargedCost = async (userId: string) => {
  const buckets = await getRedis().hvals(`adhocGQL:${userId}`)
  return buckets.reduce((total, cost) => total + Number(cost), 0)
}

test('an ad hoc query still runs after more than 100 other ad hoc queries', async () => {
  const {cookie} = await signUp()
  const token = await createToken(cookie)
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

test('two spellings of the same query are each charged, and so are their repeats', async () => {
  const {userId, cookie} = await signUp()
  const token = await createToken(cookie)
  const nonce = Date.now().toString(36)
  const oneLine = `query AdHocSpelling${nonce} { viewer { id } }`
  const indented = `query AdHocSpelling${nonce} {\n  viewer {\n    id\n  }\n}`

  const charges: number[] = []
  for (const query of [oneLine, indented, oneLine, indented]) {
    const res = await sendAdHoc(token, query)
    expect(res.errors).toBeUndefined()
    charges.push(await getChargedCost(userId))
  }
  const cost = charges[0] ?? 0
  expect(cost).toBeGreaterThan(0)
  expect(charges).toEqual([cost, cost * 2, cost * 3, cost * 4])
})
