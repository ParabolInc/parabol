import getKysely from '../postgres/getKysely'
import {createOrgAdmin, getTestEmail, getUserTeams, sendPublic} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

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

const ADD_ORG = `
  mutation AddOrg($newTeam: NewTeamInput!, $orgName: String!) {
    addOrg(newTeam: $newTeam, orgName: $orgName) {
      team {
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

const SHARE_PAGE = `
  mutation UpdatePageAccess($pageId: ID!, $subjectType: PageSubjectEnum!, $subjectId: ID!, $role: PageRoleEnum) {
    updatePageAccess(pageId: $pageId, subjectType: $subjectType, subjectId: $subjectId, role: $role) {
      page {
        id
      }
    }
  }
`

const LIST_PAGES = `
  query ListPages($isPrivate: Boolean) {
    viewer {
      pages(first: 100, isPrivate: $isPrivate) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const DUPLICATE_PAGE = `
  mutation DuplicatePage($pageId: ID!, $parentPageId: ID) {
    duplicatePage(pageId: $pageId, parentPageId: $parentPageId) {
      page {
        id
      }
    }
  }
`

const OPEN_PAGE = `
  query OpenPage($pageId: ID!) {
    public {
      page(pageId: $pageId) {
        id
      }
    }
  }
`

type Grants = {
  grantedOrgIds: string[] | null
  grantedTeamIds: string[] | null
  grantedPageIds: string[] | null
}

const createToken = async (cookie: string, scopes: string[], grants: Grants) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'page list',
      scopes,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      ...grants
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const createPage = async (bearerToken: string, teamId?: string) => {
  const res = await sendPublic({query: CREATE_PAGE, variables: {teamId}, bearerToken})
  expect(res.errors).toBeUndefined()
  return res.data.createPage.page.id as string
}

const setUpPages = async () => {
  const {userId, orgId: orgA, cookie} = await createOrgAdmin(getTestEmail())
  const [{id: teamA}] = await getUserTeams(userId)
  const added = await sendPublic({
    query: ADD_ORG,
    variables: {newTeam: {name: 'Team B', orgId: '', isPublic: false}, orgName: 'Org B'},
    cookie
  })
  expect(added.errors).toBeUndefined()
  const teamB = added.data.addOrg.team.id as string

  // a session cookie keeps the teams it was issued with, so write as a token made after Team B
  const author = await createToken(cookie, ['PAGES_WRITE'], {
    grantedOrgIds: null,
    grantedTeamIds: null,
    grantedPageIds: null
  })
  const pages = {
    teamAPage: await createPage(author, teamA),
    orgAPage: await createPage(author),
    teamBPage: await createPage(author, teamB),
    privatePage: await createPage(author),
    otherPrivatePage: await createPage(author)
  }
  const shared = await sendPublic({
    query: SHARE_PAGE,
    variables: {
      pageId: pages.orgAPage,
      subjectType: 'organization',
      subjectId: orgA,
      role: 'viewer'
    },
    cookie
  })
  expect(shared.errors).toBeUndefined()
  return {cookie, orgA, teamA, pages}
}

const listPageIds = async (bearerToken: string, isPrivate?: boolean) => {
  const res = await sendPublic({query: LIST_PAGES, variables: {isPrivate}, bearerToken})
  expect(res.errors).toBeUndefined()
  return res.data.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id) as string[]
}

const canOpenPage = async (bearerToken: string, pageId: string) => {
  const res = await sendPublic({query: OPEN_PAGE, variables: {pageId}, bearerToken})
  return !res.errors && !!res.data.public.page
}

type Setup = Awaited<ReturnType<typeof setUpPages>>
type PageName = keyof Setup['pages']

const namesOf = (pages: Setup['pages'], pageIds: string[]) =>
  (Object.keys(pages) as PageName[]).filter((name) => pageIds.includes(pages[name])).sort()

test.each<{grant: string; grants: (setup: Setup) => Grants; reaches: PageName[]}>([
  {
    grant: 'one whole org, as the token dialog saves it',
    grants: ({orgA}) => ({grantedOrgIds: [orgA], grantedTeamIds: [], grantedPageIds: null}),
    reaches: ['orgAPage', 'teamAPage']
  },
  {
    grant: 'one team',
    grants: ({teamA}) => ({grantedOrgIds: [], grantedTeamIds: [teamA], grantedPageIds: null}),
    reaches: ['teamAPage']
  },
  {
    grant: 'every org and team plus one private page',
    grants: ({pages}) => ({
      grantedOrgIds: null,
      grantedTeamIds: null,
      grantedPageIds: [pages.privatePage]
    }),
    reaches: ['orgAPage', 'privatePage', 'teamAPage', 'teamBPage']
  },
  {
    grant: 'one private page',
    grants: ({pages}) => ({
      grantedOrgIds: [],
      grantedTeamIds: [],
      grantedPageIds: [pages.privatePage]
    }),
    reaches: ['privatePage']
  },
  {
    grant: 'nothing',
    grants: () => ({grantedOrgIds: [], grantedTeamIds: [], grantedPageIds: null}),
    reaches: []
  }
])('a token granted $grant lists exactly the pages it can open', async ({grants, reaches}) => {
  const setup = await setUpPages()
  const bearerToken = await createToken(setup.cookie, ['USERS_READ', 'PAGES_READ'], grants(setup))

  const openedIds: string[] = []
  for (const pageId of Object.values(setup.pages)) {
    if (await canOpenPage(bearerToken, pageId)) openedIds.push(pageId)
  }

  expect(namesOf(setup.pages, openedIds)).toEqual(reaches)
  expect(namesOf(setup.pages, await listPageIds(bearerToken))).toEqual(reaches)
})

test('a token granted one subpage of a shared page lists it among shared pages', async () => {
  const {cookie, pages} = await setUpPages()
  const copied = await sendPublic({
    query: DUPLICATE_PAGE,
    variables: {pageId: pages.privatePage, parentPageId: pages.orgAPage},
    cookie
  })
  expect(copied.errors).toBeUndefined()
  const subpage = copied.data.duplicatePage.page.id as string
  const bearerToken = await createToken(cookie, ['USERS_READ', 'PAGES_READ'], {
    grantedOrgIds: [],
    grantedTeamIds: [],
    grantedPageIds: [subpage]
  })

  expect(await canOpenPage(bearerToken, subpage)).toBe(true)
  expect(await listPageIds(bearerToken, false)).toEqual([subpage])
})
