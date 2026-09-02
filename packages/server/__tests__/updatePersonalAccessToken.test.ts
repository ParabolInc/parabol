import {sendPublic, signUp} from './common'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessTokenMutation(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
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

const createToken = async (cookie: string) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const created = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {name: 'test token', scopes: ['USERS_WRITE'], expiresAt},
    cookie
  })
  expect(created).toMatchObject({
    data: {createPersonalAccessToken: {personalAccessToken: {id: expect.any(String)}}}
  })
  return created.data.createPersonalAccessToken.personalAccessToken.id as string
}

test('rejects an update that supplies no fields', async () => {
  const {cookie} = await signUp()
  const tokenId = await createToken(cookie)

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
  const tokenId = await createToken(cookie)

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
  const tokenId = await createToken(cookie)

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
