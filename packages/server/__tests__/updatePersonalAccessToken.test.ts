import {sendPublic, signUp} from './common'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessTokenMutation(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
      personalAccessToken {
        id
      }
    }
  }
`

const UPDATE_PERSONAL_ACCESS_TOKEN = `
  mutation UpdatePersonalAccessTokenMutation($tokenId: ID!, $name: String, $revoke: Boolean) {
    updatePersonalAccessToken(tokenId: $tokenId, name: $name, revoke: $revoke) {
      personalAccessToken {
        id
        name
        revokedAt
      }
    }
  }
`

const VIEWER_ID = `
  query ViewerIdQuery {
    viewer {
      id
    }
  }
`

const PERSONAL_ACCESS_TOKENS = `
  query PersonalAccessTokensQuery {
    viewer {
      personalAccessTokens {
        lastUsedAt
      }
    }
  }
`

const sendCreateToken = (
  auth: {cookie: string} | {bearerToken: string},
  scopes = ['USERS_WRITE']
) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  return sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {name: 'test token', scopes, expiresAt},
    ...auth
  })
}

const createToken = async (cookie: string, scopes = ['USERS_WRITE']) => {
  const created = await sendCreateToken({cookie}, scopes)
  expect(created).toMatchObject({
    data: {createPersonalAccessToken: {personalAccessToken: {id: expect.any(String)}}}
  })
  const {token, personalAccessToken} = created.data.createPersonalAccessToken
  return {id: personalAccessToken.id as string, token: token as string}
}

test('rejects an update that supplies no fields', async () => {
  const {cookie} = await signUp()
  const {id: tokenId} = await createToken(cookie)

  const updated = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId},
    cookie
  })

  expect(updated).toMatchObject({
    data: null,
    errors: [{message: 'No fields to update'}]
  })
})

test('updates the name', async () => {
  const {cookie} = await signUp()
  const {id: tokenId} = await createToken(cookie)

  const updated = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId, name: 'renamed token'},
    cookie
  })

  expect(updated).toMatchObject({
    data: {
      updatePersonalAccessToken: {
        personalAccessToken: {id: tokenId, name: 'renamed token', revokedAt: null}
      }
    }
  })
})

test('revokes the token', async () => {
  const {cookie} = await signUp()
  const {id: tokenId} = await createToken(cookie)

  const revoked = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId, revoke: true},
    cookie
  })

  expect(revoked).toMatchObject({
    data: {
      updatePersonalAccessToken: {
        personalAccessToken: {id: tokenId, revokedAt: expect.any(String)}
      }
    }
  })
})

test('records lastUsedAt when the token authenticates a request', async () => {
  const {cookie, userId} = await signUp()
  const {token} = await createToken(cookie, ['USERS_READ'])

  const viaToken = await sendPublic({query: VIEWER_ID, bearerToken: token})
  expect(viaToken).toMatchObject({data: {viewer: {id: userId}}})

  const readLastUsedAt = async () => {
    const res = await sendPublic({query: PERSONAL_ACCESS_TOKENS, cookie})
    return res.data.viewer.personalAccessTokens[0].lastUsedAt as string | null
  }
  let lastUsedAt = await readLastUsedAt()
  for (let attempt = 0; !lastUsedAt && attempt < 50; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 100))
    lastUsedAt = await readLastUsedAt()
  }
  expect(lastUsedAt).toEqual(expect.any(String))
})

test('a personal access token cannot create a token', async () => {
  const {cookie} = await signUp()
  const {token} = await createToken(cookie)

  const created = await sendCreateToken({bearerToken: token})

  expect(created).toMatchObject({
    data: null,
    errors: [{message: 'This kind of access token cannot do this'}]
  })
})

test('a personal access token cannot update a token, even itself', async () => {
  const {cookie} = await signUp()
  const {id: tokenId, token} = await createToken(cookie)

  const updated = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId, name: 'renamed token'},
    bearerToken: token
  })

  expect(updated).toMatchObject({
    data: null,
    errors: [{message: 'This kind of access token cannot do this'}]
  })
})
