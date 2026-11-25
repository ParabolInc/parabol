import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
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
  query ListPages($isPrivate: Boolean, $parentPageId: ID) {
    viewer {
      pages(first: 100, isPrivate: $isPrivate, parentPageId: $parentPageId) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const SEARCH_WORD = 'grantcheck'

const SEARCH_PAGES = `
  query SearchPages($query: String!) {
    viewer {
      search(query: $query, first: 100, type: page, alpha: 0) {
        edges {
          node {
            ... on Page {
              id
            }
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

  const authorOnBothTeams = await createToken(cookie, ['PAGES_WRITE'], {
    grantedOrgIds: null,
    grantedTeamIds: null,
    grantedPageIds: null
  })
  const pages = {
    teamAPage: await createPage(authorOnBothTeams, teamA),
    orgAPage: await createPage(authorOnBothTeams),
    teamBPage: await createPage(authorOnBothTeams, teamB),
    privatePage: await createPage(authorOnBothTeams),
    otherPrivatePage: await createPage(authorOnBothTeams)
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
  await getKysely()
    .updateTable('Page')
    .set({title: SEARCH_WORD})
    .where(
      'id',
      'in',
      Object.values(pages).map((pageId) => CipherId.fromClient(pageId)[0])
    )
    .execute()
  return {cookie, orgA, teamA, pages}
}

const listPageIds = async (
  bearerToken: string,
  filters: {isPrivate?: boolean; parentPageId?: string | null} = {}
) => {
  const res = await sendPublic({query: LIST_PAGES, variables: filters, bearerToken})
  expect(res.errors).toBeUndefined()
  return res.data.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id) as string[]
}

const searchPageIds = async (bearerToken: string, query: string) => {
  const res = await sendPublic({query: SEARCH_PAGES, variables: {query}, bearerToken})
  expect(res.errors).toBeUndefined()
  return res.data.viewer.search.edges.map(({node}: {node: {id: string}}) => node.id) as string[]
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
])(
  'a token granted $grant lists and finds exactly the pages it can open',
  async ({grants, reaches}) => {
    const setup = await setUpPages()
    const bearerToken = await createToken(setup.cookie, ['USERS_READ', 'PAGES_READ'], grants(setup))

    const listedIds = await listPageIds(bearerToken)
    const recentIds = await searchPageIds(bearerToken, '')
    const foundIds = await searchPageIds(bearerToken, SEARCH_WORD)
    const openedIds: string[] = []
    for (const pageId of new Set([...Object.values(setup.pages), ...listedIds, ...recentIds])) {
      if (await canOpenPage(bearerToken, pageId)) openedIds.push(pageId)
    }

    expect(namesOf(setup.pages, openedIds)).toEqual(reaches)
    expect(listedIds.toSorted()).toEqual(openedIds.toSorted())
    expect(recentIds.toSorted()).toEqual(openedIds.toSorted())
    expect(namesOf(setup.pages, foundIds)).toEqual(reaches)
    expect(foundIds).toHaveLength(reaches.length)
  }
)

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
  expect(await listPageIds(bearerToken, {isPrivate: false})).toEqual([subpage])
})

test('a token granted one team lists another team page shared with it among shared pages', async () => {
  const {cookie, teamA, pages} = await setUpPages()
  const shared = await sendPublic({
    query: SHARE_PAGE,
    variables: {pageId: pages.teamBPage, subjectType: 'team', subjectId: teamA, role: 'viewer'},
    cookie
  })
  expect(shared.errors).toBeUndefined()
  const bearerToken = await createToken(cookie, ['USERS_READ', 'PAGES_READ'], {
    grantedOrgIds: [],
    grantedTeamIds: [teamA],
    grantedPageIds: null
  })

  expect(await canOpenPage(bearerToken, pages.teamBPage)).toBe(true)
  expect(await listPageIds(bearerToken, {isPrivate: false})).toEqual([pages.teamBPage])
})

test('a token granted one private subpage lists it among top-level private pages', async () => {
  const {cookie, pages} = await setUpPages()
  const copied = await sendPublic({
    query: DUPLICATE_PAGE,
    variables: {pageId: pages.otherPrivatePage, parentPageId: pages.privatePage},
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
  expect(await listPageIds(bearerToken, {isPrivate: true, parentPageId: null})).toEqual([subpage])
})

test('a token granted one page lists, finds and opens the pages nested under it and no others', async () => {
  const {cookie, pages} = await setUpPages()
  const copyInto = async (parentPageId: string) => {
    const copied = await sendPublic({
      query: DUPLICATE_PAGE,
      variables: {pageId: pages.otherPrivatePage, parentPageId},
      cookie
    })
    expect(copied.errors).toBeUndefined()
    return copied.data.duplicatePage.page.id as string
  }
  const child = await copyInto(pages.privatePage)
  const grandchild = await copyInto(child)
  const outsideCopy = await copyInto(pages.teamAPage)
  const bearerToken = await createToken(cookie, ['USERS_READ', 'PAGES_READ'], {
    grantedOrgIds: [],
    grantedTeamIds: [],
    grantedPageIds: [pages.privatePage]
  })
  const reachable = [pages.privatePage, child, grandchild].toSorted()

  expect((await listPageIds(bearerToken)).toSorted()).toEqual(reachable)
  expect((await searchPageIds(bearerToken, '')).toSorted()).toEqual(reachable)
  const foundIds = await searchPageIds(bearerToken, 'Untitled')
  expect(foundIds).toEqual(expect.arrayContaining([child, grandchild]))
  expect(foundIds.filter((pageId) => !reachable.includes(pageId))).toEqual([])
  expect(await listPageIds(bearerToken, {parentPageId: null})).toEqual([pages.privatePage])
  expect(await canOpenPage(bearerToken, grandchild)).toBe(true)
  expect(await canOpenPage(bearerToken, outsideCopy)).toBe(false)
  for (const pageId of Object.values(pages)) {
    expect(await canOpenPage(bearerToken, pageId)).toBe(pageId === pages.privatePage)
  }
})
