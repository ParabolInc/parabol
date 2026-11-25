import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {makeExecutableSchema} from '@graphql-tools/schema'
import {applyScopeDirective} from '../graphql/public/applyScopeDirective'
import {createOrgAdmin, getTestEmail, getUserTeams, sendPublic, signUp} from './common'

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const UPLOAD_USER_ASSET = `
  mutation UploadUserAsset($file: File!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    uploadUserAsset(file: $file, scope: $scope, scopeKey: $scopeKey) {
      url
    }
  }
`

const UPLOAD_USER_IMAGE = `
  mutation UploadUserImage($file: File!) {
    uploadUserImage(file: $file) {
      user {
        id
      }
    }
  }
`

const UPLOAD_ORG_IMAGE = `
  mutation UploadOrgImage($file: File!, $orgId: ID!) {
    uploadOrgImage(file: $file, orgId: $orgId) {
      organization {
        id
      }
    }
  }
`

const CREATE_PAGE = `
  mutation CreatePage($teamId: ID) {
    createPage(teamId: $teamId) {
      page {
        id
      }
    }
  }
`

const createToken = async (cookie: string, scopes: string[]) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'owner scopes',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const createPage = async (cookie: string) => {
  const res = await sendPublic({query: CREATE_PAGE, variables: {}, cookie})
  expect(res.errors).toBeUndefined()
  return res.data.createPage.page.id as string
}

const upload = (
  bearerToken: string,
  scope: 'User' | 'Organization' | 'Team' | 'Page',
  scopeKey: string
) =>
  sendPublic({
    query: UPLOAD_USER_ASSET,
    variables: {file: null, scope, scopeKey},
    uploadables: {file: new File(['hello'], 'notes.txt', {type: 'text/plain'})},
    bearerToken
  })

const uploadImage = (bearerToken: string, query: string, variables: Record<string, unknown>) =>
  sendPublic({
    query,
    variables: {file: null, ...variables},
    uploadables: {file: new File(['not really a png'], 'avatar.png', {type: 'image/png'})},
    bearerToken
  })

const MISSING_SCOPE = 'Access token is missing required scope'

test('a PAT with pages:write uploads into Page scope', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie)
  const token = await createToken(cookie, ['PAGES_WRITE'])
  const res = await upload(token, 'Page', pageId)
  expect(res.errors).toBeUndefined()
  expect(res.data.uploadUserAsset.url).toEqual(expect.any(String))
})

test('a PAT with users:write but not pages:write cannot upload into Page scope', async () => {
  const {cookie} = await signUp()
  const pageId = await createPage(cookie)
  const token = await createToken(cookie, ['USERS_WRITE'])
  const res = await upload(token, 'Page', pageId)
  expect(res.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: pages:write`)
  expect(res.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')
})

test('a PAT with teams:write uploads into Team scope and pages:write alone cannot', async () => {
  const {userId, cookie} = await createOrgAdmin(getTestEmail())
  const [team] = await getUserTeams(userId)
  const allowed = await upload(await createToken(cookie, ['TEAMS_WRITE']), 'Team', team!.id)
  expect(allowed.errors).toBeUndefined()
  const denied = await upload(await createToken(cookie, ['PAGES_WRITE']), 'Team', team!.id)
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: teams:write`)
})

test('a PAT with orgs:write uploads into Organization scope and users:write alone cannot', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  const allowed = await upload(await createToken(cookie, ['ORGS_WRITE']), 'Organization', orgId)
  expect(allowed.errors).toBeUndefined()
  const denied = await upload(await createToken(cookie, ['USERS_WRITE']), 'Organization', orgId)
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: orgs:write`)
})

test('a PAT with users:write uploads into User scope and pages:write alone cannot', async () => {
  const {userId, cookie} = await signUp()
  const allowed = await upload(await createToken(cookie, ['USERS_WRITE']), 'User', userId)
  expect(allowed.errors).toBeUndefined()
  const denied = await upload(await createToken(cookie, ['PAGES_WRITE']), 'User', userId)
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: users:write`)
})

test('a session cookie uploads without any token scope', async () => {
  const {userId, cookie} = await signUp()
  const res = await sendPublic({
    query: UPLOAD_USER_ASSET,
    variables: {file: null, scope: 'User', scopeKey: userId},
    uploadables: {file: new File(['hello'], 'notes.txt', {type: 'text/plain'})},
    cookie
  })
  expect(res.errors).toBeUndefined()
})

test('uploadUserImage still needs users:write', async () => {
  const {cookie} = await signUp()
  const denied = await uploadImage(
    await createToken(cookie, ['PAGES_WRITE']),
    UPLOAD_USER_IMAGE,
    {}
  )
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: users:write`)
  const passed = await uploadImage(
    await createToken(cookie, ['USERS_WRITE']),
    UPLOAD_USER_IMAGE,
    {}
  )
  expect(JSON.stringify(passed)).not.toContain(MISSING_SCOPE)
})

test('uploadOrgImage still needs orgs:write', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail())
  const denied = await uploadImage(await createToken(cookie, ['USERS_WRITE']), UPLOAD_ORG_IMAGE, {
    orgId
  })
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: orgs:write`)
  const passed = await uploadImage(await createToken(cookie, ['ORGS_WRITE']), UPLOAD_ORG_IMAGE, {
    orgId
  })
  expect(JSON.stringify(passed)).not.toContain(MISSING_SCOPE)
})

const scopeDirectiveSDL = readFileSync(
  join(__dirname, '../graphql/public/typeDefs/ScopeDirective.graphql'),
  'utf8'
)

const buildSchemaWith = (mutationField: string) =>
  applyScopeDirective(
    makeExecutableSchema({
      typeDefs: `
        ${scopeDirectiveSDL}
        enum OAuthScopeEnum { PAGES_WRITE }
        enum AssetScopeEnum { Page Team Organization User }
        type Query { ok: Boolean }
        type Mutation { ${mutationField} }
      `
    })
  )

test('a mutation with both @scope arguments fails the schema build', () => {
  expect(() =>
    buildSchemaWith(
      'doIt(scope: String!): Boolean @scope(name: PAGES_WRITE, ownerFromArg: "scope")'
    )
  ).toThrow('Mutation.doIt')
})

test('a mutation with neither @scope argument fails the schema build', () => {
  expect(() => buildSchemaWith('doIt: Boolean @scope')).toThrow('Mutation.doIt')
})

test('a mutation with an AssetScopeEnum ownerFromArg argument builds', () => {
  expect(() =>
    buildSchemaWith('doIt(scope: AssetScopeEnum!): Boolean @scope(ownerFromArg: "scope")')
  ).not.toThrow()
})

test('ownerFromArg naming an argument the field lacks fails the schema build', () => {
  expect(() =>
    buildSchemaWith('doIt(scope: AssetScopeEnum!): Boolean @scope(ownerFromArg: "owner")')
  ).toThrow('Mutation.doIt')
})

test('ownerFromArg naming an argument that is not an AssetScopeEnum fails the schema build', () => {
  expect(() =>
    buildSchemaWith('doIt(scope: String!): Boolean @scope(ownerFromArg: "scope")')
  ).toThrow('Mutation.doIt')
})
