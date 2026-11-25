import getKysely from '../postgres/getKysely'
import {
  createOrgAdmin,
  createPage,
  getTestEmail,
  getUserOrgs,
  getUserTeams,
  HOST,
  PROTOCOL,
  sendPublic,
  signUp
} from './common'
import {createClient, createCode, createPKCEPair} from './oauthClient'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $expiresAt: DateTime!
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      expiresAt: $expiresAt
      grantedOrgIds: $grantedOrgIds
      grantedTeamIds: $grantedTeamIds
      grantedPageIds: $grantedPageIds
    ) {
      token
    }
  }
`

const UPLOAD_USER_ASSET = `
  mutation UploadUserAssetMutation($file: File!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    uploadUserAsset(file: $file, scope: $scope, scopeKey: $scopeKey) {
      url
    }
  }
`

const createToken = async (
  cookie: string,
  scopes: string[],
  grantedOrgIds?: string[],
  grantedTeamIds?: string[],
  grantedPageIds?: string[]
) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'asset proxy',
      scopes,
      grantedOrgIds,
      grantedTeamIds,
      grantedPageIds,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const uploadAsset = async (
  auth: {cookie?: string; bearerToken?: string},
  scope: 'User' | 'Organization' | 'Team' | 'Page',
  scopeKey: string
) => {
  const res = await sendPublic({
    query: UPLOAD_USER_ASSET,
    variables: {file: null, scope, scopeKey},
    uploadables: {file: new File(['hello'], 'notes.txt', {type: 'text/plain'})},
    ...auth
  })
  expect(res.errors).toBeUndefined()
  const url = res.data.uploadUserAsset.url as string
  expect(url).toBeTruthy()
  return new URL(url, `${PROTOCOL}://${HOST}`).pathname
}

const fetchAsset = (path: string, headers: Record<string, string>) =>
  fetch(`${PROTOCOL}://${HOST}${path}`, {headers, redirect: 'manual'})

test('a PAT holding users:read can fetch a user asset', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const token = await createToken(cookie, ['USERS_READ'])
  const res = await fetchAsset(path, {authorization: `Bearer ${token}`})
  expect(res.status).toBe(307)
})

test('a PAT without users:read cannot fetch a user asset', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const token = await createToken(cookie, ['PAGES_READ'])
  const res = await fetchAsset(path, {authorization: `Bearer ${token}`})
  expect(res.status).toBe(403)
})

test('an invalid token is answered 401', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const invalidPAT = await fetchAsset(path, {
    authorization: 'Bearer pat_notarealtoken0000000000000000'
  })
  expect(invalidPAT.status).toBe(401)
  const invalidJWT = await fetchAsset(path, {authorization: 'Bearer not.a.jwt'})
  expect(invalidJWT.status).toBe(401)
})

test('a PAT limited to another org cannot fetch an org asset', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  const {orgId: otherOrgId} = await createOrgAdmin(getTestEmail())
  const path = await uploadAsset({cookie}, 'Organization', orgId)
  const allowed = await createToken(cookie, ['ORGS_READ'], [orgId])
  const limited = await createToken(cookie, ['ORGS_READ'], [otherOrgId])
  expect((await fetchAsset(path, {authorization: `Bearer ${allowed}`})).status).toBe(307)
  expect((await fetchAsset(path, {authorization: `Bearer ${limited}`})).status).toBe(403)
})

test('a PAT reads a page file only when it holds pages:read', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie)
  const path = await uploadAsset({cookie}, 'Page', pageId)
  const withPages = await createToken(cookie, ['PAGES_READ'])
  const withoutPages = await createToken(cookie, ['USERS_READ', 'PAGES_WRITE'])
  expect((await fetchAsset(path, {authorization: `Bearer ${withPages}`})).status).toBe(307)
  expect((await fetchAsset(path, {authorization: `Bearer ${withoutPages}`})).status).toBe(403)
})

test('a PAT with pages:read granted one page reads that page file, not another page file', async () => {
  const {cookie} = await signUp()
  const grantedPageId = await createPage(cookie)
  const otherPageId = await createPage(cookie)
  const grantedPath = await uploadAsset({cookie}, 'Page', grantedPageId)
  const otherPath = await uploadAsset({cookie}, 'Page', otherPageId)
  const token = await createToken(cookie, ['PAGES_READ'], undefined, undefined, [grantedPageId])
  const authorization = `Bearer ${token}`
  expect((await fetchAsset(grantedPath, {authorization})).status).toBe(307)
  expect((await fetchAsset(otherPath, {authorization})).status).toBe(403)
})

test('a PAT without pages:read cannot read a page picture, but reads a user avatar', async () => {
  const {userId, cookie} = await signUp()
  const pageId = await createPage(cookie)
  const pageCode = (await uploadAsset({cookie}, 'Page', pageId)).split('/')[3]
  const token = await createToken(cookie, ['USERS_READ'])
  const authorization = `Bearer ${token}`
  const pagePicture = await fetchAsset(`/assets/Page/${pageCode}/picture/cover.png`, {
    authorization
  })
  const avatar = await fetchAsset(`/assets/User/${userId}/picture/avatar.png`, {authorization})
  expect(pagePicture.status).toBe(403)
  expect(avatar.status).toBe(307)
})

test('a PAT reads a team file only with teams:read and an org file only with orgs:read', async () => {
  const {userId, orgId, cookie} = await createOrgAdmin(getTestEmail())
  const [team] = await getUserTeams(userId)
  const teamPath = await uploadAsset({cookie}, 'Team', team!.id)
  const orgPath = await uploadAsset({cookie}, 'Organization', orgId)
  const withTeams = `Bearer ${await createToken(cookie, ['TEAMS_READ'])}`
  const withOrgs = `Bearer ${await createToken(cookie, ['ORGS_READ'])}`
  expect((await fetchAsset(teamPath, {authorization: withTeams})).status).toBe(307)
  expect((await fetchAsset(teamPath, {authorization: withOrgs})).status).toBe(403)
  expect((await fetchAsset(orgPath, {authorization: withOrgs})).status).toBe(307)
  expect((await fetchAsset(orgPath, {authorization: withTeams})).status).toBe(403)
})

test('a PAT reads an avatar without any read scope', async () => {
  const {userId, cookie} = await signUp()
  const token = await createToken(cookie, ['PAGES_WRITE'])
  const res = await fetchAsset(`/assets/User/${userId}/picture/avatar.png`, {
    authorization: `Bearer ${token}`
  })
  expect(res.status).toBe(307)
})

test('a session cookie still fetches assets as before', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const res = await fetchAsset(path, {cookie})
  expect(res.status).toBe(307)
})

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
        id
      }
    }
  }
`

const EMBED_USER_ASSET = `
  mutation EmbedUserAssetMutation($url: String!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    embedUserAsset(url: $url, scope: $scope, scopeKey: $scopeKey) {
      url
      size
      type
    }
  }
`

const signUpWithTwoOrgs = async () => {
  const {userId, orgId: firstOrgId, cookie} = await createOrgAdmin(getTestEmail())
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {newTeam: {name: 'Second team', orgId: '', isPublic: false}, orgName: 'Second org'},
    cookie
  })
  expect(added.errors).toBeUndefined()
  const secondTeamId = added.data.addOrg.team.id as string
  const orgs = await getUserOrgs(userId)
  const secondOrgId = orgs.map(({id}) => id).find((id) => id !== firstOrgId)!
  const teams = await getUserTeams(userId)
  const firstTeamId = teams.map(({id}) => id).find((id) => id !== secondTeamId)!
  return {userId, cookie, firstOrgId, secondOrgId, firstTeamId, secondTeamId}
}

test('a PAT limited to one org cannot read its own user assets, an unrestricted PAT can', async () => {
  const {userId, firstOrgId, cookie} = await signUpWithTwoOrgs()
  const path = await uploadAsset({cookie}, 'User', userId)
  const limited = await createToken(cookie, ['USERS_READ'], [firstOrgId])
  const unrestricted = await createToken(cookie, ['USERS_READ'])
  expect((await fetchAsset(path, {authorization: `Bearer ${limited}`})).status).toBe(403)
  expect((await fetchAsset(path, {authorization: `Bearer ${unrestricted}`})).status).toBe(307)
})

test('a PAT limited to one org still reads server-owned user assets', async () => {
  const {firstOrgId, cookie} = await signUpWithTwoOrgs()
  const limited = await createToken(cookie, ['USERS_READ'], [firstOrgId])
  const res = await fetchAsset('/assets/User/aGhostUser/assets/seeded.png', {
    authorization: `Bearer ${limited}`
  })
  expect(res.status).toBe(307)
})

test('a PAT without users:read or orgs:read still reads server-owned assets, not IdP metadata', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  const authorization = `Bearer ${await createToken(cookie, ['PAGES_WRITE'])}`
  const ghostUser = await fetchAsset('/assets/User/aGhostUser/assets/seeded.png', {authorization})
  const ghostOrg = await fetchAsset('/assets/Organization/aGhostOrg/template/seeded.png', {
    authorization
  })
  const idpMetadataPath = `/assets/Organization/${orgId}/idpMetadata/metadata.xml`
  const idpMetadata = await fetchAsset(idpMetadataPath, {authorization})
  const withOrgs = `Bearer ${await createToken(cookie, ['ORGS_READ'])}`
  expect(ghostUser.status).toBe(307)
  expect(ghostOrg.status).toBe(307)
  expect(idpMetadata.status).toBe(403)
  expect((await fetchAsset(idpMetadataPath, {authorization: withOrgs})).status).toBe(307)
})

const getBytesUploaded = async (userId: string) => {
  const userDetail = await getKysely()
    .selectFrom('UserDetail')
    .select('bytesUploaded')
    .where('id', '=', userId)
    .executeTakeFirst()
  return Number(userDetail?.bytesUploaded ?? 0)
}

test('a token-driven embed charges the asset size to the user', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const token = await createToken(cookie, ['USERS_WRITE', 'USERS_READ'])
  const before = await getBytesUploaded(userId)
  const res = await sendPublic({
    query: EMBED_USER_ASSET,
    variables: {url: `${PROTOCOL}://${HOST}${path}`, scope: 'User', scopeKey: userId},
    bearerToken: token
  })
  expect(res.errors).toBeUndefined()
  expect(res.data.embedUserAsset).toMatchObject({size: 5, type: 'text/plain'})
  expect((await getBytesUploaded(userId)) - before).toBe(5)
})

test('a PAT limited to org A cannot embed an org B asset', async () => {
  const {userId, firstOrgId, secondOrgId, cookie} = await signUpWithTwoOrgs()
  const path = await uploadAsset({cookie}, 'Organization', secondOrgId)
  const limited = await createToken(cookie, ['USERS_WRITE', 'ORGS_READ'], [firstOrgId])
  const unrestricted = await createToken(cookie, ['USERS_WRITE', 'ORGS_READ'])
  const embed = (bearerToken: string) =>
    sendPublic({
      query: EMBED_USER_ASSET,
      variables: {url: `${PROTOCOL}://${HOST}${path}`, scope: 'User', scopeKey: userId},
      bearerToken
    })
  const denied = await embed(limited)
  expect(JSON.stringify(denied)).toContain('Access denied to source asset')
  const allowed = await embed(unrestricted)
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.embedUserAsset.url).toEqual(expect.any(String))
})

test('embedding an org file into a page needs orgs:read', async () => {
  const {firstOrgId, firstTeamId, cookie} = await signUpWithTwoOrgs()
  const pageId = await createPage(cookie, firstTeamId)
  const path = await uploadAsset({cookie}, 'Organization', firstOrgId)
  const withoutOrgs = await createToken(cookie, ['PAGES_WRITE'], [firstOrgId])
  const withOrgs = await createToken(cookie, ['PAGES_WRITE', 'ORGS_READ'], [firstOrgId])
  const embed = (bearerToken: string) =>
    sendPublic({
      query: EMBED_USER_ASSET,
      variables: {url: `${PROTOCOL}://${HOST}${path}`, scope: 'Page', scopeKey: pageId},
      bearerToken
    })
  const denied = await embed(withoutOrgs)
  expect(JSON.stringify(denied)).toContain('Access denied to source asset')
  const allowed = await embed(withOrgs)
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.embedUserAsset.url).toEqual(expect.any(String))
})

test('a PAT limited to org A reads org A team assets, not org B team assets', async () => {
  const {firstOrgId, firstTeamId, secondTeamId, cookie} = await signUpWithTwoOrgs()
  const writer = await createToken(cookie, ['TEAMS_WRITE'])
  const firstTeamPath = await uploadAsset({bearerToken: writer}, 'Team', firstTeamId)
  const secondTeamPath = await uploadAsset({bearerToken: writer}, 'Team', secondTeamId)
  const limited = await createToken(cookie, ['TEAMS_READ'], [firstOrgId], [])
  const authorization = `Bearer ${limited}`
  expect((await fetchAsset(firstTeamPath, {authorization})).status).toBe(307)
  expect((await fetchAsset(secondTeamPath, {authorization})).status).toBe(403)
})

const getOAuthAccessToken = async (cookie: string, scope: string) => {
  const {clientId, redirectUri} = await createClient()
  const {codeVerifier, codeChallenge} = createPKCEPair()
  const approved = await createCode({clientId, redirectUri, scope, codeChallenge}, cookie)
  expect(approved.errors).toBeUndefined()
  const code = new URL(approved.data.createOAuthAPICode.redirectUri).searchParams.get('code')!
  const tokenResponse = await fetch(`${PROTOCOL}://${HOST}/oauth/token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier
    })
  })
  expect(tokenResponse.status).toBe(200)
  const {access_token} = await tokenResponse.json()
  return access_token as string
}

test('an OAuth access token fetches an org asset only when it holds orgs:read', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  const path = await uploadAsset({cookie}, 'Organization', orgId)
  const withOrgs = await getOAuthAccessToken(cookie, 'orgs:read')
  const withoutOrgs = await getOAuthAccessToken(cookie, 'users:read')
  expect((await fetchAsset(path, {authorization: `Bearer ${withOrgs}`})).status).toBe(307)
  expect((await fetchAsset(path, {authorization: `Bearer ${withoutOrgs}`})).status).toBe(403)
})

const EDIT_PAGE_CONTENT = `
  mutation EditPageContent($pageId: ID!, $content: String!) {
    editPageContent(pageId: $pageId, content: $content, format: markdown) {
      page {
        id
      }
    }
  }
`

const PATCH_PAGE_CONTENT = `
  mutation PatchPageContent($pageId: ID!, $edits: [PageContentEditInput!]!) {
    patchPageContent(pageId: $pageId, edits: $edits) {
      page {
        content
      }
    }
  }
`

const imageBlockMarkdown = (src: string) => `:::imageBlock {src="${src}"}\n\n:::`

const setUpOrgAPage = async () => {
  const twoOrgs = await signUpWithTwoOrgs()
  const {cookie, firstOrgId, firstTeamId, secondOrgId} = twoOrgs
  const pageId = await createPage(cookie, firstTeamId)
  const edited = await sendPublic({
    query: EDIT_PAGE_CONTENT,
    variables: {pageId, content: '# Plan\n\nFirst step\n\nSecond step\n\nThird step'},
    cookie
  })
  expect(edited.errors).toBeUndefined()
  const orgBAssetPath = await uploadAsset({cookie}, 'Organization', secondOrgId)
  const limited = await createToken(cookie, ['PAGES_READ', 'PAGES_WRITE'], [firstOrgId], [])
  const withoutOrgs = await createToken(cookie, ['PAGES_READ', 'PAGES_WRITE'])
  const unrestricted = await createToken(cookie, ['PAGES_READ', 'PAGES_WRITE', 'ORGS_READ'])
  return {...twoOrgs, pageId, orgBAssetPath, limited, withoutOrgs, unrestricted}
}

const PAGE_CONTENT = `
  query PageContent($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        content
      }
    }
  }
`

const readPageContent = async (pageId: string, cookie: string) => {
  const res = await sendPublic({query: PAGE_CONTENT, variables: {pageId}, cookie})
  return res.data.public.page.content as string
}

const COPIED_INTO_PAGE = /\/assets\/Page\/\d+\/assets\//

const waitForCopy = async (pageId: string, cookie: string) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    const content = await readPageContent(pageId, cookie)
    if (COPIED_INTO_PAGE.test(content)) return content
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return readPageContent(pageId, cookie)
}

test('a PAT limited to org A can write an org B asset src into an org A page, but it is never copied in', async () => {
  const {userId, cookie, pageId, orgBAssetPath, limited, unrestricted} = await setUpOrgAPage()
  const edit = (bearerToken: string) =>
    sendPublic({
      query: EDIT_PAGE_CONTENT,
      variables: {pageId, content: `# Plan\n\n${imageBlockMarkdown(orgBAssetPath)}`},
      bearerToken
    })
  expect((await edit(limited)).errors).toBeUndefined()
  const afterLimited = await waitForCopy(pageId, cookie)
  expect(afterLimited).toContain(orgBAssetPath)
  expect(afterLimited).not.toMatch(COPIED_INTO_PAGE)

  const reset = await sendPublic({
    query: EDIT_PAGE_CONTENT,
    variables: {pageId, content: '# Plan\n\nFirst step'},
    cookie
  })
  expect(reset.errors).toBeUndefined()
  const before = await getBytesUploaded(userId)
  expect((await edit(unrestricted)).errors).toBeUndefined()
  expect(await waitForCopy(pageId, cookie)).toMatch(COPIED_INTO_PAGE)
  expect((await getBytesUploaded(userId)) - before).toBe(5)
}, 20_000)

test('a PAT limited to org A, or without orgs:read, patching an org B asset src into a page gets no copy', async () => {
  const {cookie, pageId, orgBAssetPath, limited, withoutOrgs, unrestricted} = await setUpOrgAPage()
  const absoluteSrc = `${PROTOCOL}://${HOST}${orgBAssetPath}`
  const patch = (bearerToken: string, oldText: string) =>
    sendPublic({
      query: PATCH_PAGE_CONTENT,
      variables: {pageId, edits: [{oldText, newText: imageBlockMarkdown(absoluteSrc)}]},
      bearerToken
    })
  expect((await patch(limited, 'First step')).errors).toBeUndefined()
  const afterLimited = await waitForCopy(pageId, cookie)
  expect(afterLimited).toContain(orgBAssetPath)
  expect(afterLimited).not.toMatch(COPIED_INTO_PAGE)

  expect((await patch(withoutOrgs, 'Second step')).errors).toBeUndefined()
  expect(await waitForCopy(pageId, cookie)).not.toMatch(COPIED_INTO_PAGE)

  expect((await patch(unrestricted, 'Third step')).errors).toBeUndefined()
  expect(await waitForCopy(pageId, cookie)).toMatch(COPIED_INTO_PAGE)
}, 30_000)

test('a lowercase bearer scheme still fetches an asset', async () => {
  const {userId, cookie} = await signUp()
  const path = await uploadAsset({cookie}, 'User', userId)
  const token = await createToken(cookie, ['USERS_READ'])
  const res = await fetchAsset(path, {authorization: `bearer ${token}`})
  expect(res.status).toBe(307)
})
