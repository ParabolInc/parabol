import {sendPublic, signUp} from './common'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessTokenMutation(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
      expiresAt: $expiresAt
    ) {
      token
      personalAccessToken {
        id
      }
    }
  }
`

const UPDATE_PERSONAL_ACCESS_TOKEN = `
  mutation UpdatePersonalAccessTokenMutation(
    $tokenId: ID!
    $name: String
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $revoke: Boolean
  ) {
    updatePersonalAccessToken(
      tokenId: $tokenId
      name: $name
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
      revoke: $revoke
    ) {
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

const CREATE_PAGE = `
  mutation CreatePageMutation {
    createPage {
      page {
        id
      }
    }
  }
`

type TokenInput = {
  scopes?: string[]
  grantedOrgIds?: string[] | null
  grantedTeamIds?: string[] | null
  grantedPageIds?: string[] | null
}

const GRANT_DENIED = 'Cannot grant access to resources not granted to the calling token'

const sendCreateToken = (
  auth: {cookie: string} | {bearerToken: string},
  {scopes = ['USERS_WRITE'], ...grants}: TokenInput = {}
) =>
  sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'test token',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ...grants
    },
    ...auth
  })

const createToken = async (cookie: string, input: TokenInput = {}) => {
  const created = await sendCreateToken({cookie}, input)
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
  const {token} = await createToken(cookie, {scopes: ['USERS_READ']})

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

test('a token limited to an org cannot create a token for every org', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const {token} = await createToken(cookie, {
    grantedOrgIds: [orgId],
    grantedTeamIds: [teamId]
  })

  const unrestricted = await sendCreateToken({bearerToken: token})
  expect(unrestricted).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})

  const allOrgs = await sendCreateToken(
    {bearerToken: token},
    {grantedOrgIds: null, grantedTeamIds: [teamId]}
  )
  expect(allOrgs).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})
})

test('a token limited to an org and a team cannot create a token for every team', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const {token} = await createToken(cookie, {
    grantedOrgIds: [orgId],
    grantedTeamIds: [teamId]
  })

  const allTeams = await sendCreateToken(
    {bearerToken: token},
    {grantedOrgIds: [orgId], grantedTeamIds: null}
  )
  expect(allTeams).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})
})

test('a token limited to an org and a team cannot grant a team outside them', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const {teamId: otherTeamId} = await signUp()
  const {token} = await createToken(cookie, {
    grantedOrgIds: [orgId],
    grantedTeamIds: [teamId]
  })

  const otherTeam = await sendCreateToken(
    {bearerToken: token},
    {grantedOrgIds: [orgId], grantedTeamIds: [otherTeamId]}
  )
  expect(otherTeam).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})
})

test('a restricted token can create a token within its grants', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const {token} = await createToken(cookie, {
    grantedOrgIds: [orgId],
    grantedTeamIds: []
  })

  const sameGrants = await sendCreateToken(
    {bearerToken: token},
    {grantedOrgIds: [orgId], grantedTeamIds: [teamId]}
  )
  expect(sameGrants).toMatchObject({
    data: {createPersonalAccessToken: {personalAccessToken: {id: expect.any(String)}}}
  })
})

test('a token limited to a page cannot grant another page', async () => {
  const {cookie} = await signUp()
  const [grantedPage, otherPage] = await Promise.all([
    sendPublic({query: CREATE_PAGE, cookie}),
    sendPublic({query: CREATE_PAGE, cookie})
  ])
  const grantedPageId = grantedPage.data.createPage.page.id as string
  const otherPageId = otherPage.data.createPage.page.id as string
  const {token} = await createToken(cookie, {grantedPageIds: [grantedPageId]})

  const otherPageToken = await sendCreateToken(
    {bearerToken: token},
    {grantedPageIds: [otherPageId]}
  )
  expect(otherPageToken).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})

  const samePageToken = await sendCreateToken(
    {bearerToken: token},
    {grantedPageIds: [grantedPageId]}
  )
  expect(samePageToken).toMatchObject({
    data: {createPersonalAccessToken: {personalAccessToken: {id: expect.any(String)}}}
  })
})

test('a restricted token cannot widen its own grants', async () => {
  const {cookie, orgId, teamId} = await signUp()
  const {id: tokenId, token} = await createToken(cookie, {
    grantedOrgIds: [orgId],
    grantedTeamIds: [teamId]
  })

  const widened = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId, grantedTeamIds: null},
    bearerToken: token
  })
  expect(widened).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})

  const renamed = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId, name: 'renamed token', grantedTeamIds: []},
    bearerToken: token
  })
  expect(renamed).toMatchObject({
    data: {updatePersonalAccessToken: {personalAccessToken: {id: tokenId, name: 'renamed token'}}}
  })
})

test('a restricted token can revoke but not edit a broader token', async () => {
  const {cookie, orgId} = await signUp()
  const {id: broaderTokenId} = await createToken(cookie)
  const {token} = await createToken(cookie, {grantedOrgIds: [orgId]})

  const renamed = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId: broaderTokenId, name: 'renamed token'},
    bearerToken: token
  })
  expect(renamed).toMatchObject({data: null, errors: [{message: GRANT_DENIED}]})

  const revoked = await sendPublic({
    query: UPDATE_PERSONAL_ACCESS_TOKEN,
    variables: {tokenId: broaderTokenId, revoke: true},
    bearerToken: token
  })
  expect(revoked).toMatchObject({
    data: {
      updatePersonalAccessToken: {
        personalAccessToken: {id: broaderTokenId, revokedAt: expect.any(String)}
      }
    }
  })
})
