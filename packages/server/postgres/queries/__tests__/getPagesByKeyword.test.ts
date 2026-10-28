import getKysely from '../../getKysely'
import {getPagesByKeyword, type PageKeywordSearchParams} from '../getPagesByKeyword'

const pg = getKysely()
const suffix = `pbk-${Date.now()}`
const viewerId = `viewer-${suffix}`
const otherUserId = `other-${suffix}`
const orgId = `org-${suffix}`
const platformTeamId = `platform-${suffix}`
const designTeamId = `design-${suffix}`

interface PageSeed {
  title: string
  plaintextContent?: string
  userId?: string
  updatedAt?: Date
  deletedAt?: Date
}

const insertPage = async ({userId = viewerId, ...page}: PageSeed) => {
  const {id} = await pg
    .insertInto('Page')
    .values({...page, userId, sortOrder: 'a0'})
    .returning('id')
    .executeTakeFirstOrThrow()
  return id
}

const makeUser = (id: string, preferredName: string) => ({
  id,
  email: `${id}@example.com`,
  picture: 'https://example.com/pic.png',
  preferredName
})

let standupNotesId: number
let meetingSummariesId: number
let onboardingChecklistId: number
let earlierWeeklySyncId: number
let laterWeeklySyncId: number
let japaneseTitleId: number
let hugePageId: number
let otherUsersPageId: number
let deletedPageId: number
let firstTiedPageId: number
let secondTiedPageId: number
let earlierShortOffsiteId: number
let laterLongOffsiteId: number

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values([makeUser(viewerId, 'Keyword Viewer'), makeUser(otherUserId, 'Keyword Other')])
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Keyword Search Org'}).execute()
  await pg
    .insertInto('Team')
    .values([
      {id: platformTeamId, name: 'Platform', orgId},
      {id: designTeamId, name: 'Design', orgId}
    ])
    .execute()
  standupNotesId = await insertPage({
    title: 'Standup notes',
    plaintextContent: 'Daily updates from the platform team.'
  })
  meetingSummariesId = await insertPage({
    title: 'Meeting summaries',
    plaintextContent: 'standup '.repeat(50)
  })
  onboardingChecklistId = await insertPage({
    title: 'Onboarding checklist',
    plaintextContent: 'Laptop setup, accounts, and first week goals.'
  })
  earlierWeeklySyncId = await insertPage({
    title: 'Weekly sync',
    updatedAt: new Date('2026-10-06T12:00:00Z')
  })
  laterWeeklySyncId = await insertPage({
    title: 'Weekly sync',
    updatedAt: new Date('2026-10-13T12:00:00Z')
  })
  japaneseTitleId = await insertPage({title: '週次ミーティング'})
  hugePageId = await insertPage({
    title: 'Huge page',
    plaintextContent: `roadmap ${Array.from({length: 200_000}, (_, i) => `w${i.toString(36)}`).join(' ')}`
  })
  otherUsersPageId = await insertPage({title: 'Standup secret', userId: otherUserId})
  deletedPageId = await insertPage({title: 'Standup deleted', deletedAt: new Date()})
  const tiedUpdatedAt = new Date('2026-10-20T12:00:00Z')
  firstTiedPageId = await insertPage({title: 'Tied page', updatedAt: tiedUpdatedAt})
  secondTiedPageId = await insertPage({title: 'Tied page', updatedAt: tiedUpdatedAt})
  earlierShortOffsiteId = await insertPage({
    title: 'Offsite agenda',
    updatedAt: new Date('2026-10-08T12:00:00Z')
  })
  laterLongOffsiteId = await insertPage({
    title: 'Offsite agenda',
    plaintextContent: Array.from({length: 300}, (_, i) => `detail${i}`).join(' '),
    updatedAt: new Date('2026-10-15T12:00:00Z')
  })
  const viewerPageIds = [
    standupNotesId,
    meetingSummariesId,
    onboardingChecklistId,
    earlierWeeklySyncId,
    laterWeeklySyncId,
    japaneseTitleId,
    hugePageId,
    deletedPageId,
    firstTiedPageId,
    secondTiedPageId,
    earlierShortOffsiteId,
    laterLongOffsiteId
  ]
  await pg
    .insertInto('PageAccess')
    .values([
      ...viewerPageIds.map((pageId) => ({userId: viewerId, pageId, role: 'owner' as const})),
      {userId: otherUserId, pageId: otherUsersPageId, role: 'owner'}
    ])
    .execute()
  await pg
    .insertInto('PageTeamAccess')
    .values([
      {pageId: standupNotesId, teamId: platformTeamId, role: 'editor'},
      {pageId: standupNotesId, teamId: designTeamId, role: 'editor'},
      {pageId: meetingSummariesId, teamId: designTeamId, role: 'editor'}
    ])
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Team').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', [viewerId, otherUserId]).execute()
  await pg.destroy()
})

const keywordSearch = (query: string, overrides: Partial<PageKeywordSearchParams> = {}) =>
  getPagesByKeyword({
    query,
    first: 20,
    viewerId,
    teamIds: undefined,
    dateRange: null,
    ...overrides
  })

const ids = async (query: string, overrides?: Partial<PageKeywordSearchParams>) =>
  (await keywordSearch(query, overrides)).edges.map(({nodeId}) => nodeId)

it('puts title matches before body-only matches', async () =>
  expect(await ids('standup')).toEqual([standupNotesId, meetingSummariesId]))

it('matches every word as a prefix', async () =>
  expect(await ids('onboard check')).toEqual([onboardingChecklistId]))

it('requires every word to match', async () => expect(await ids('onboarding budget')).toEqual([]))

it('breaks ties by the most recent update', async () =>
  expect(await ids('weekly sync')).toEqual([laterWeeklySyncId, earlierWeeklySyncId]))

it('ranks equal title matches by recency, not by body length', async () =>
  expect(await ids('offsite agenda')).toEqual([laterLongOffsiteId, earlierShortOffsiteId]))

it('finds titles written without spaces', async () =>
  expect(await ids('週次')).toEqual([japaneseTitleId]))

it('searches pages too large for a full tsvector', async () =>
  expect(await ids('roadmap')).toContain(hugePageId))

it('highlights matches in snippets', async () => {
  const {edges} = await keywordSearch('laptop')
  expect(edges[0]!.snippets[0]).toMatch(/<b>Laptop<\/b>/)
})

it('returns nothing for operator characters', async () =>
  expect(await ids(`'"); DROP & | !:*`)).toEqual([]))

it('returns plain numbers for scores', async () => {
  const {edges} = await keywordSearch('standup')
  expect(typeof edges[0]!.score.keyword).toBe('number')
  expect(edges[0]!.score.keywordRank).toBe(1)
})

it('returns at most first pages, best first', async () =>
  expect(await ids('weekly sync', {first: 1})).toEqual([laterWeeklySyncId]))

it('reports keyword scores in the fused score shape', async () => {
  const {edges, pageInfo} = await keywordSearch('weekly sync')
  expect(edges.map(({score}) => score.keywordRank)).toEqual([1, 2])
  expect(edges[1]!.score).toEqual({
    keyword: edges[1]!.score.keyword,
    vector: 0,
    keywordRank: 2,
    vectorRank: null,
    combined: 1 / 62
  })
  expect(pageInfo).toEqual({
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
    endCursor: null
  })
})

it('breaks exact ties by page id so the order is stable', async () =>
  expect(await ids('tied page')).toEqual([secondTiedPageId, firstTiedPageId]))

it('limits results to pages shared with the requested teams', async () =>
  expect(await ids('standup', {teamIds: [platformTeamId]})).toEqual([standupNotesId]))

it('returns a page shared with several requested teams once', async () =>
  expect(await ids('standup', {teamIds: [platformTeamId, designTeamId]})).toEqual([
    standupNotesId,
    meetingSummariesId
  ]))

it('limits results to the date range', async () =>
  expect(
    await ids('weekly sync', {
      dateRange: {
        startAt: new Date('2026-10-10T00:00:00Z'),
        endAt: new Date('2026-10-20T00:00:00Z'),
        dateField: 'updatedAt'
      }
    })
  ).toEqual([laterWeeklySyncId]))

it('applies the date range to the requested date field', async () =>
  expect(
    await ids('weekly sync', {
      dateRange: {
        startAt: new Date('2020-01-01T00:00:00Z'),
        endAt: new Date('2020-12-31T00:00:00Z'),
        dateField: 'createdAt'
      }
    })
  ).toEqual([]))

it('accepts an open-ended date range', async () =>
  expect(
    await ids('weekly sync', {
      dateRange: {
        startAt: new Date('2026-10-10T00:00:00Z'),
        endAt: new Date('9999-12-31T23:59:59.999Z'),
        dateField: 'updatedAt'
      }
    })
  ).toEqual([laterWeeklySyncId]))
