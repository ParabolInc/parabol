import {sql} from 'kysely'
import {pagePrefixTerms, pagePrefixTsQuery, pageQueryWords} from '../../expressions'
import getKysely from '../../getKysely'
import {
  getPagesByKeyword,
  type KeywordMatching,
  type PageKeywordSearchParams
} from '../getPagesByKeyword'
import {decodePageSearchCursor} from '../pageSearchCursor'

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
let compoundWordsId: number
let toDoId: number
let lateMatchId: number
let zephyr5Id: number
let zephyr50Id: number
let zephyrId: number
let zephyrDecimalId: number
let zephyrSevId: number
let vendorComparisonId: number
let vendorListId: number
let whiteboardIdeasId: number
let whitebordIdeasId: number
let whiteboardBodyId: number

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
  compoundWordsId = await insertPage({
    title: 'Release checklist',
    plaintextContent:
      'Email ops@parabol.co about the parabol.co status page before shipping v1.2.3 on 2026-10-26.'
  })
  toDoId = await insertPage({title: 'To do'})
  lateMatchId = await insertPage({
    title: 'Quarterly planning',
    plaintextContent: `${'filler '.repeat(40)}Budget review moved on Friday.`
  })
  zephyr5Id = await insertPage({
    title: 'Zephyr 5',
    plaintextContent: 'Shipped build 5 yesterday.',
    updatedAt: new Date('2026-09-01T12:00:00Z')
  })
  zephyr50Id = await insertPage({title: 'Zephyr 50', updatedAt: new Date('2026-09-02T12:00:00Z')})
  zephyrId = await insertPage({title: 'Zephyr', updatedAt: new Date('2026-09-03T12:00:00Z')})
  zephyrDecimalId = await insertPage({title: 'Zephyr 3.12 upgrade'})
  zephyrSevId = await insertPage({title: 'Zephyr SEV-1 review'})
  vendorComparisonId = await insertPage({
    title: 'Vendor comparison',
    updatedAt: new Date('2026-08-01T12:00:00Z')
  })
  vendorListId = await insertPage({
    title: 'Vendor list',
    updatedAt: new Date('2026-08-03T12:00:00Z')
  })
  whiteboardIdeasId = await insertPage({
    title: 'Whiteboard ideas',
    updatedAt: new Date('2026-08-01T12:00:00Z')
  })
  whitebordIdeasId = await insertPage({
    title: 'Whitebord ideas',
    plaintextContent: 'ideas '.repeat(20),
    updatedAt: new Date('2026-08-02T12:00:00Z')
  })
  whiteboardBodyId = await insertPage({
    title: 'Room booking',
    plaintextContent: 'Whiteboard markers'
  })
  const viewerPageIds = [
    zephyr5Id,
    zephyr50Id,
    zephyrId,
    zephyrDecimalId,
    zephyrSevId,
    vendorComparisonId,
    vendorListId,
    whiteboardIdeasId,
    whitebordIdeasId,
    whiteboardBodyId,
    toDoId,
    lateMatchId,
    compoundWordsId,
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

const keywordSearch = (
  query: string,
  overrides: Partial<Parameters<typeof getPagesByKeyword>[0]> = {}
) =>
  getPagesByKeyword({
    query,
    first: 20,
    offset: 0,
    viewerId,
    teamIds: undefined,
    dateRange: null,
    ...overrides
  })

const ids = async (query: string, overrides?: Partial<Parameters<typeof getPagesByKeyword>[0]>) =>
  (await keywordSearch(query, overrides)).edges.map(({nodeId}) => nodeId)

describe('splits the query into search words', () => {
  const words = async (query: string, dropStopWords: boolean) => {
    const {rows} = await sql<{
      words: string[] | null
    }>`select ${pageQueryWords(query, dropStopWords)} as words`.execute(pg)
    return rows[0]!.words
  }

  it.each([
    ['retro #5', false, ['retro', '5']],
    ['the weekly offsite agenda', true, ['weekly', 'offsite', 'agenda']],
    [
      'one two three four five six seven eight nine',
      false,
      ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']
    ]
  ])('splits %p (without stop words: %p) into %p', async (query, dropStopWords, expected) =>
    expect(await words(query, dropStopWords)).toEqual(expected)
  )

  it('gives no words for single letters', async () => expect(await words('a b', false)).toBeNull())
})

describe('turns the query into prefix terms', () => {
  const terms = async (query: string, dropStopWords = false, operator: '&' | '|' = '&') => {
    const {rows} = await sql<{
      terms: string | null
    }>`select ${pagePrefixTsQuery(pagePrefixTerms(query, dropStopWords), operator)}::text as terms`.execute(
      pg
    )
    return rows[0]!.terms
  }

  it.each([
    ['retro notes', "'retro':* & 'notes':*"],
    ['Retr', "'retr':*"],
    ['retro retro', "'retro':*"],
    [`'"); DROP & | !:*`, "'drop':*"],
    ['会議 メモ', "'会議':* & 'メモ':*"],
    [
      'one two three four five six seven eight nine',
      "'one':* & 'two':* & 'three':* & 'four':* & 'five':* & 'six':* & 'seven':* & 'eight':*"
    ],
    ['हिंदी', "'हिंदी':*"],
    ['नमस्ते दुनिया', "'नमस्ते':* & 'दुनिया':*"],
    ['ค้นหา', "'ค้นหา':*"],
    ['İstanbul', "'istanbul':*"],
    ['parabol.co', "'parabol.co':*"],
    ['jordan@parabol.co', "'jordan@parabol.co':*"],
    ['v1.2', "'v1.2':*"],
    ['2026-10-26', "'2026':* & '-10':* & '-26':*"],
    ['retro #5', "'retro':* & ( '5' | '5.':* | '-5' )"],
    ['day 7 of 2026', "'day':* & ( '7' | '7.':* | '-7' ) & 'of':* & '2026':*"],
    ['5', "'5' | '5.':* | '-5'"],
    ['plan b 2', "'plan':* & ( '2' | '2.':* | '-2' )"],
    ['follow-up', "'follow-up':* & 'follow':* & 'up':*"],
    ['C:\\temp\\notes.txt', null]
  ])('turns %p into %p', async (query, expected) => {
    if (expected === null) {
      await expect(terms(query)).resolves.toEqual(expect.any(String))
      return
    }
    await expect(terms(query)).resolves.toBe(expected)
  })

  it.each(['', '   ', 'a b', '𠮷', '５'])('gives no terms for %p', async (query) =>
    expect(await terms(query)).toBeNull()
  )

  it.each([
    ['when were the cdn assets restored', "'cdn':* & 'assets':* & 'restored':*"],
    ['to do', "'to':* & 'do':*"],
    ['follow-up', "'follow-up':* & 'follow':*"],
    ['de la reunión', "'de':* & 'la':* & 'reunión':*"],
    [
      'what is the one two three four five six seven eight nine',
      "'one':* & 'two':* & 'three':* & 'four':* & 'five':* & 'six':* & 'seven':* & 'eight':*"
    ]
  ])('turns %p into %p without stop words', async (query, expected) =>
    expect(await terms(query, true)).toBe(expected)
  )

  it('joins any-word terms with OR', async () =>
    expect(await terms('retro notes', false, '|')).toBe("'retro':* | 'notes':*"))
})

it('matches compound words as typed', async () => {
  expect(await ids('parabol')).toEqual([compoundWordsId])
  expect(await ids('2026-10')).toEqual([compoundWordsId])
  expect(await ids('v1.2')).toEqual([compoundWordsId])
  expect(await ids('ops@parabol.co')).toEqual([compoundWordsId])
})

it('matches a single digit as a whole number', async () =>
  expect(await ids('zephyr #5', {anyWordFallbackBelow: 0})).toEqual([zephyr5Id]))

it('matches a digit written as the whole part of a decimal', async () =>
  expect(await ids('zephyr 3', {anyWordFallbackBelow: 0})).toEqual([zephyrDecimalId]))

it('matches a digit written after a hyphen', async () =>
  expect(await ids('zephyr sev 1', {anyWordFallbackBelow: 0})).toEqual([zephyrSevId]))

it('puts the page with the number first by default', async () =>
  expect((await ids('zephyr 5'))[0]).toBe(zephyr5Id))

it('highlights a single digit', async () => {
  const {edges} = await keywordSearch('build 5')
  expect(edges[0]!.snippets[0]).toMatch(/<b>5<\/b>/)
})

it('matches a misspelled title word', async () =>
  expect((await ids('vendor comparsion', {titleTypoSimilarity: 0.5}))[0]).toBe(vendorComparisonId))

it('matches misspelled title words by default', async () =>
  expect((await ids('vendor comparsion'))[0]).toBe(vendorComparisonId))

it('never matches a digit by title similarity', async () =>
  expect(await ids('5')).not.toContain(zephyr50Id))

it('never matches a short word by title similarity', async () =>
  expect(await ids('vent')).not.toContain(vendorListId))

it('puts closer misspelled title matches first', async () =>
  expect(await ids('whiteboad', {first: 2})).toEqual([whiteboardIdeasId, whitebordIdeasId]))

it('pages through misspelled title matches without gaps or repeats', async () => {
  const all = await ids('whiteboad', {first: 2})
  const walked = [
    ...(await ids('whiteboad', {first: 1, offset: 0})),
    ...(await ids('whiteboad', {first: 1, offset: 1}))
  ]
  expect(walked).toEqual(all)
})

it('ignores misspellings when the threshold is 0', async () =>
  expect(await ids('whiteboad', {titleTypoSimilarity: 0})).toEqual([]))

it('matches misspellings only in titles', async () => {
  const found = await ids('whiteboad', {titleTypoSimilarity: 0.5})
  expect(found).toContain(whiteboardIdeasId)
  expect(found).not.toContain(whiteboardBodyId)
})

it('puts exact matches before misspelled ones', async () =>
  expect((await ids('whiteboard ideas', {titleTypoSimilarity: 0.5})).slice(0, 2)).toEqual([
    whiteboardIdeasId,
    whitebordIdeasId
  ]))

it("never returns another user's page", async () => expect(await ids('secret')).toEqual([]))

it('never returns a trashed page, even one the viewer can open', async () =>
  expect(await ids('deleted')).toEqual([]))

it('puts title matches before body-only matches', async () =>
  expect(await ids('standup')).toEqual([standupNotesId, meetingSummariesId]))

it('matches every word as a prefix', async () =>
  expect(await ids('onboard check', {anyWordFallbackBelow: 0})).toEqual([onboardingChecklistId]))

it('requires every word to match', async () =>
  expect(await ids('onboarding budget', {anyWordFallbackBelow: 0})).toEqual([]))

it('drops stop words and falls back to pages with some of the words by default', async () =>
  expect(await ids('the weekly offsite agenda')).toEqual([
    laterLongOffsiteId,
    earlierShortOffsiteId,
    laterWeeklySyncId,
    earlierWeeklySyncId
  ]))

it('falls back to pages with some of the words, most words first', async () =>
  expect(await ids('weekly offsite agenda', {anyWordFallbackBelow: 1})).toEqual([
    laterLongOffsiteId,
    earlierShortOffsiteId,
    laterWeeklySyncId,
    earlierWeeklySyncId
  ]))

it('falls back only when fewer pages than the threshold have every word', async () => {
  expect(await ids('standup notes', {anyWordFallbackBelow: 1})).toEqual([standupNotesId])
  expect(await ids('standup notes', {anyWordFallbackBelow: 2})).toEqual([
    standupNotesId,
    meetingSummariesId
  ])
  const secondPage = await keywordSearch('standup notes', {anyWordFallbackBelow: 1, offset: 1})
  expect(secondPage.edges).toEqual([])
})

it('requires the minimum share of words', async () =>
  expect(
    await ids('weekly offsite agenda', {anyWordFallbackBelow: 1, anyWordMinShare: 0.5})
  ).toEqual([laterLongOffsiteId, earlierShortOffsiteId]))

it('highlights the words an any-word match contains', async () => {
  const {edges} = await keywordSearch('onboarding laptop budget', {anyWordFallbackBelow: 1})
  const snippet = edges.find(({nodeId}) => nodeId === onboardingChecklistId)?.snippets[0]
  expect(snippet).toContain('<b>Laptop</b>')
})

it('highlights an any-word match past the start of the page', async () => {
  const {edges} = await keywordSearch('budget zebra', {anyWordFallbackBelow: 1})
  const snippet = edges.find(({nodeId}) => nodeId === lateMatchId)?.snippets[0]
  expect(snippet).toContain('<b>Budget</b>')
})

it('pages through any-word matches without gaps or repeats', async () => {
  const pages = await Promise.all(
    [0, 1, 2, 3, 4].map((offset) =>
      keywordSearch('weekly offsite agenda', {anyWordFallbackBelow: 1, first: 1, offset})
    )
  )
  expect(pages.flatMap(({edges}) => edges.map(({nodeId}) => nodeId))).toEqual([
    laterLongOffsiteId,
    earlierShortOffsiteId,
    laterWeeklySyncId,
    earlierWeeklySyncId
  ])
  expect(pages.map(({pageInfo}) => pageInfo.hasNextPage)).toEqual([true, true, true, false, false])
})

it('finds a question by its content words', async () => {
  const question = 'what is on the onboarding checklist'
  const everyWord = {anyWordFallbackBelow: 0}
  expect(await ids(question, {...everyWord, dropStopWords: true})).toEqual([onboardingChecklistId])
  expect(await ids(question, {...everyWord, dropStopWords: false})).toEqual([])
})

it('keeps finding pages while a stop word is typed', async () =>
  expect(await ids('onboarding the', {dropStopWords: true})).toEqual([onboardingChecklistId]))

it('still requires every word of a query made only of stop words', async () =>
  expect(await ids('to do', {dropStopWords: true})).toEqual([toDoId]))

it('leaves stop words out of snippet highlights', async () => {
  const {edges} = await keywordSearch('the platform team', {dropStopWords: true})
  const snippet = edges.find(({nodeId}) => nodeId === standupNotesId)?.snippets[0]
  expect(snippet).toContain('<b>platform</b>')
  expect(snippet).not.toContain('<b>the</b>')
})

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
  expect(pageInfo.hasNextPage).toBe(false)
  expect(pageInfo.hasPreviousPage).toBe(false)
  expect(decodePageSearchCursor(pageInfo.startCursor!)).toEqual({ranking: 'keyword', position: 1})
  expect(decodePageSearchCursor(pageInfo.endCursor!)).toEqual({ranking: 'keyword', position: 2})
})

it('pages through the keyword ranking', async () => {
  const firstPage = await keywordSearch('weekly sync', {first: 1})
  expect(firstPage.edges.map(({nodeId}) => nodeId)).toEqual([laterWeeklySyncId])
  expect(firstPage.pageInfo.hasNextPage).toBe(true)
  const offset = decodePageSearchCursor(firstPage.pageInfo.endCursor!)!.position
  const secondPage = await keywordSearch('weekly sync', {first: 1, offset})
  expect(secondPage.edges.map(({nodeId}) => nodeId)).toEqual([earlierWeeklySyncId])
  expect(secondPage.edges[0]!.score.keywordRank).toBe(2)
  expect(secondPage.pageInfo.hasNextPage).toBe(false)
  expect(secondPage.pageInfo.hasPreviousPage).toBe(true)
})

it('pages through a longer keyword ranking one page at a time', async () => {
  const fullRanking = await ids('page')
  const pagedRanking: typeof fullRanking = []
  let offset = 0
  let hasNextPage = true
  let requests = 0
  while (hasNextPage && requests < fullRanking.length + 1) {
    const {edges, pageInfo} = await keywordSearch('page', {first: 1, offset})
    requests++
    pagedRanking.push(...edges.map(({nodeId}) => nodeId))
    hasNextPage = pageInfo.hasNextPage
    offset = decodePageSearchCursor(pageInfo.endCursor ?? '')?.position ?? offset
  }
  expect(fullRanking.length).toBeGreaterThan(2)
  expect(pagedRanking).toEqual(fullRanking)
  expect(requests).toBe(fullRanking.length)
})

it('breaks exact ties by page id so the order is stable', async () =>
  expect(await ids('tied page', {anyWordFallbackBelow: 0})).toEqual([
    secondTiedPageId,
    firstTiedPageId
  ]))

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

describe('matches a plain reference query', () => {
  const refSuffix = `pbk-ref-${Date.now()}`
  const refViewerId = `ref-viewer-${refSuffix}`
  const refOtherUserId = `ref-other-${refSuffix}`
  const refOrgId = `ref-org-${refSuffix}`
  const refTeamIds = [`ref-a-${refSuffix}`, `ref-b-${refSuffix}`, `ref-c-${refSuffix}`] as const
  const vocabulary = [
    'retro',
    'retrospective',
    'roadmap',
    'standup',
    'planning',
    'plan',
    'budget',
    'launch',
    'review',
    'sync'
  ]
  const updatedAtChoices = [
    new Date('2026-09-01T12:00:00Z'),
    new Date('2026-09-15T12:00:00Z'),
    new Date('2026-10-01T12:00:00Z')
  ]

  const seededRandom = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const random = seededRandom(13776)
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)]!
  const words = (min: number, max: number) =>
    Array.from({length: min + Math.floor(random() * (max - min + 1))}, () => pick(vocabulary)).join(
      ' '
    )

  beforeAll(async () => {
    await pg
      .insertInto('User')
      .values([
        makeUser(refViewerId, 'Reference Viewer'),
        makeUser(refOtherUserId, 'Reference Other')
      ])
      .execute()
    await pg.insertInto('Organization').values({id: refOrgId, name: 'Reference Org'}).execute()
    await pg
      .insertInto('Team')
      .values(refTeamIds.map((id) => ({id, name: id, orgId: refOrgId})))
      .execute()
    const seeds = Array.from({length: 120}, () => ({
      title: words(1, 3),
      plaintextContent: random() < 0.2 ? '' : words(0, 40),
      updatedAt: pick(updatedAtChoices),
      deletedAt: random() < 0.1 ? new Date() : null,
      userId: random() < 0.15 ? refOtherUserId : refViewerId
    }))
    const pages = await pg
      .insertInto('Page')
      .values(seeds.map((seed) => ({...seed, sortOrder: 'a0'})))
      .returning(['id', 'userId'])
      .execute()
    await pg
      .insertInto('PageAccess')
      .values(pages.map(({id, userId}) => ({userId, pageId: id, role: 'owner' as const})))
      .execute()
    const teamShares = pages.flatMap(({id}) =>
      refTeamIds
        .filter(() => random() < 0.3)
        .map((teamId) => ({pageId: id, teamId, role: 'editor' as const}))
    )
    await pg.insertInto('PageTeamAccess').values(teamShares).execute()
  })

  afterAll(async () => {
    await pg.deleteFrom('Team').where('orgId', '=', refOrgId).execute()
    await pg.deleteFrom('Organization').where('id', '=', refOrgId).execute()
    await pg.deleteFrom('User').where('id', 'in', [refViewerId, refOtherUserId]).execute()
  })

  const referenceSearch = async ({
    query,
    first,
    teamIds,
    dateRange,
    anyWordFallbackBelow = 0,
    anyWordMinShare = 0
  }: SearchCase) => {
    const words = query.split(' ')
    const everyWordQuery = words.map((word) => `${word}:*`).join(' & ')
    const anyWordQuery = words.map((word) => `${word}:*`).join(' | ')
    const minAnyWords = Math.max(1, Math.ceil(anyWordMinShare * words.length))
    const searchText = sql`setweight(to_tsvector('simple', coalesce(p.title, '')), 'A') || setweight(to_tsvector('simple', left(coalesce(p."plaintextContent", ''), 100000)), 'D')`
    const teamFilter = teamIds
      ? sql`exists (select 1 from "PageTeamAccess" t where t."pageId" = p.id and t."teamId" in (${sql.join(teamIds)}))`
      : sql`true`
    const dateFilter = dateRange
      ? sql`p.${sql.ref(dateRange.dateField)} between ${dateRange.startAt} and ${dateRange.endAt}`
      : sql`true`
    const {rows} = await sql<{id: number; score: number; matched: number}>`
      select id, score, matched from (
        select p.id, p."updatedAt", m.matched,
          count(*) filter (where m.matched = ${words.length}) over () as "everyWordCount",
          to_tsvector('simple', coalesce(p.title, '')) @@ q.match as "titleMatch",
          ts_rank_cd(${searchText}, q.match, 0)::float8 as score
        from "Page" p
          cross join lateral (
            select count(*)::int as matched from unnest(${words}::text[]) w
            where (${searchText}) @@ to_tsquery('simple', w || ':*')
          ) m
          cross join lateral (
            select to_tsquery('simple', case when m.matched = ${words.length} then ${everyWordQuery} else ${anyWordQuery} end) as match
          ) q
        where exists (select 1 from "PageAccess" a where a."pageId" = p.id and a."userId" = ${refViewerId})
          and p."deletedAt" is null
          and m.matched > 0
          and ${teamFilter}
          and ${dateFilter}
      ) ranked
      where matched = ${words.length} or ("everyWordCount" < ${anyWordFallbackBelow} and matched >= ${minAnyWords})
      order by matched desc, "titleMatch" desc, score desc, "updatedAt" desc, id desc
      limit ${first}
    `.execute(pg)
    return rows.map(({id, score, matched}) => ({id, score, hasEveryWord: matched === words.length}))
  }

  type SearchCase = Omit<PageKeywordSearchParams, 'viewerId'> &
    Partial<
      Pick<KeywordMatching, 'anyWordFallbackBelow' | 'anyWordMinShare' | 'titleTypoSimilarity'>
    >
  const unfiltered = (query: string, first = 100): SearchCase => ({
    query,
    first,
    offset: 0,
    teamIds: undefined,
    dateRange: null,
    anyWordFallbackBelow: 0,
    anyWordMinShare: 0,
    titleTypoSimilarity: 0
  })
  const cases: [string, SearchCase][] = [
    ...[...vocabulary, 'ret', 'pla', 'retro plan', 'standup review sync', 'budget launch'].map(
      (query): [string, SearchCase] => [query, unfiltered(query)]
    ),
    ...['retro', 'plan', 'sync'].map((query): [string, SearchCase] => [
      `${query}, first 5`,
      unfiltered(query, 5)
    ]),
    ...['retro', 'roadmap'].map((query): [string, SearchCase] => [
      `${query}, two teams`,
      {...unfiltered(query), teamIds: [refTeamIds[0], refTeamIds[2]]}
    ]),
    ...(['updatedAt', 'createdAt'] as const).map((dateField): [string, SearchCase] => [
      `review, ${dateField} range`,
      {
        ...unfiltered('review'),
        dateRange: {
          startAt: new Date('2026-09-10T00:00:00Z'),
          endAt: new Date('2026-10-10T00:00:00Z'),
          dateField
        }
      }
    ]),
    ...['retro zebra', 'retro plan', 'standup review sync', 'budget launch roadmap sync'].flatMap(
      (query): [string, SearchCase][] => [
        [`${query}, any words below 5`, {...unfiltered(query), anyWordFallbackBelow: 5}],
        [
          `${query}, any words always, half of them`,
          {...unfiltered(query), anyWordFallbackBelow: 1000, anyWordMinShare: 0.5}
        ]
      ]
    ),
    [
      'retro plan, two teams, any words always',
      {
        ...unfiltered('retro plan'),
        teamIds: [refTeamIds[0], refTeamIds[2]],
        anyWordFallbackBelow: 1000
      }
    ],
    [
      'review sync, updatedAt range, any words always',
      {
        ...unfiltered('review sync'),
        anyWordFallbackBelow: 1000,
        dateRange: {
          startAt: new Date('2026-09-10T00:00:00Z'),
          endAt: new Date('2026-10-10T00:00:00Z'),
          dateField: 'updatedAt'
        }
      }
    ]
  ]

  it.each(cases)('for %s', async (_label, searchCase) => {
    const expected = await referenceSearch(searchCase)
    const {edges} = await getPagesByKeyword({...searchCase, viewerId: refViewerId})
    expect(edges.map(({nodeId, score}) => ({id: nodeId, score: score.keyword}))).toEqual(
      expected.map(({id, score}) => ({id, score}))
    )
    expect(edges.map(({score}) => score.keywordRank)).toEqual(expected.map((_, i) => i + 1))
  })

  it('covers non-trivial cases', async () => {
    const results = await Promise.all(cases.map(([, searchCase]) => referenceSearch(searchCase)))
    expect(results.filter((rows) => rows.length > 0).length).toBeGreaterThan(cases.length / 2)
    expect(results.some((rows) => rows.length === 5)).toBe(true)
    expect(results.some((rows) => rows.some(({hasEveryWord}) => !hasEveryWord))).toBe(true)
  })
})
