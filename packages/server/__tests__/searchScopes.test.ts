import getKysely from '../postgres/getKysely'
import {createOrgAdmin, getTestEmail, getUserTeams, sendPublic} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
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

const ADD_POKER_TEMPLATE = `
  mutation AddPokerTemplate($teamId: ID!) {
    addPokerTemplate(teamId: $teamId) {
      pokerTemplate {
        id
      }
    }
  }
`

const SEARCH = `
  query Search($type: SearchTypeEnum!, $startAt: DateTime) {
    viewer {
      search(query: "", first: 100, type: $type, startAt: $startAt) {
        edges {
          node {
            ... on Page {
              id
            }
            ... on MeetingTemplate {
              id
            }
          }
        }
      }
    }
  }
`

const SEARCH_TEMPLATES_THEN_PAGES = `
  query SearchTemplatesThenPages {
    viewer {
      templates: search(query: "", first: 1, type: meetingTemplate) {
        edges {
          snippets
        }
      }
      pages: search(query: "", first: 1, type: page) {
        edges {
          snippets
        }
      }
    }
  }
`

const MISSING_SCOPE = 'Access token is missing required scope'

const createToken = async (cookie: string, scopes: string[]) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'search scopes',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const search = (auth: {bearerToken?: string; cookie?: string}, type: string, startAt?: Date) =>
  sendPublic({query: SEARCH, variables: {type, startAt}, ...auth})

const foundIds = (res: Awaited<ReturnType<typeof search>>) => {
  expect(res.errors).toBeUndefined()
  return res.data.viewer.search.edges.map(({node}: {node: {id: string}}) => node.id) as string[]
}

test('a PAT needs pages:read to search pages', async () => {
  const {userId, cookie} = await createOrgAdmin(getTestEmail())
  const [team] = await getUserTeams(userId)
  const created = await sendPublic({query: CREATE_PAGE, variables: {teamId: team!.id}, cookie})
  expect(created.errors).toBeUndefined()
  const pageId = created.data.createPage.page.id as string

  const denied = await search({bearerToken: await createToken(cookie, ['USERS_READ'])}, 'page')
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: pages:read`)
  expect(denied.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const bearerToken = await createToken(cookie, ['USERS_READ', 'PAGES_READ'])
  expect(foundIds(await search({bearerToken}, 'page'))).toContain(pageId)
  expect(foundIds(await search({cookie}, 'page'))).toContain(pageId)
})

test('a PAT needs templates:read to search meeting templates', async () => {
  const {userId, cookie} = await createOrgAdmin(getTestEmail())
  const [team] = await getUserTeams(userId)
  const teamId = team!.id
  const added = await sendPublic({query: ADD_POKER_TEMPLATE, variables: {teamId}, cookie})
  expect(added.errors).toBeUndefined()
  const templateId = added.data.addPokerTemplate.pokerTemplate.id as string
  const startAt = new Date()
  await getKysely()
    .insertInto('EmbeddingsMetadata')
    .values({objectType: 'meetingTemplate', refId: templateId, teamId, refUpdatedAt: startAt})
    .onConflict((oc) => oc.doNothing())
    .execute()

  const pagesOnly = await createToken(cookie, ['USERS_READ', 'PAGES_READ'])
  const denied = await search({bearerToken: pagesOnly}, 'meetingTemplate')
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: templates:read`)
  expect(denied.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const bearerToken = await createToken(cookie, ['USERS_READ', 'TEMPLATES_READ'])
  expect(foundIds(await search({bearerToken}, 'meetingTemplate', startAt))).toContain(templateId)
})

test('a PAT with templates:read cannot search pages in the same request as templates', async () => {
  const {cookie} = await createOrgAdmin(getTestEmail())
  const bearerToken = await createToken(cookie, ['USERS_READ', 'TEMPLATES_READ'])

  const res = await sendPublic({query: SEARCH_TEMPLATES_THEN_PAGES, bearerToken})
  expect(res.errors?.map(({message}: {message: string}) => message)).toContain(
    `${MISSING_SCOPE}: pages:read`
  )
  expect(res.data?.viewer ?? null).toBeNull()
})

test('a PAT needs meetings:read to search retro discussion topics', async () => {
  const {cookie} = await createOrgAdmin(getTestEmail())

  const denied = await search(
    {bearerToken: await createToken(cookie, ['USERS_READ', 'PAGES_READ'])},
    'retrospectiveDiscussionTopic'
  )
  expect(denied.errors?.[0]?.message).toBe(`${MISSING_SCOPE}: meetings:read`)
  expect(denied.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const bearerToken = await createToken(cookie, ['USERS_READ', 'MEETINGS_READ'])
  expect(foundIds(await search({bearerToken}, 'retrospectiveDiscussionTopic'))).toEqual([])
})
