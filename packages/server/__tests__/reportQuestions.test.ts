import {randomUUIDv7} from 'crypto'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import recordReportQuestion from '../reports/recordReportQuestion'
import {CipherId} from '../utils/CipherId'
import {sendPublic, signUp} from './common'

const REPORT_QUESTIONS = `
  query ReportQuestions($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        recentReportQuestions {
          id
          source
          question
          title
          outcome
        }
      }
    }
  }
`

const START_REPORT_QUESTION = `
  mutation LogReportQuestionUse($orgId: ID!, $popularQuestionKey: String, $reportQuestionId: ID) {
    logReportQuestionUse(
      orgId: $orgId
      popularQuestionKey: $popularQuestionKey
      reportQuestionId: $reportQuestionId
    ) {
      reportQuestion {
        id
        source
        title
      }
    }
  }
`

const ASK_REPORT_QUESTION = `
  mutation AskReportQuestion($orgId: ID!, $question: String!, $timeZone: String!) {
    askReportQuestion(orgId: $orgId, question: $question, timeZone: $timeZone) {
      reportQuestion {
        title
        spec
        outcome
      }
      reason
      suggestion
    }
  }
`

const RATE_REPORT_QUESTION = `
  mutation RateReportQuestion($orgId: ID!, $reportQuestionId: ID!, $rating: ReportQuestionRatingEnum) {
    rateReportQuestion(orgId: $orgId, reportQuestionId: $reportQuestionId, rating: $rating) {
      reportQuestion {
        id
        rating
      }
    }
  }
`

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessTokenMutation($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const tableOfTeams = (limit: number): ReportSpec => ({
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}],
  filters: [],
  where: [],
  period: null,
  compareTo: null,
  showAs: 'TABLE',
  sort: null,
  limit
})

const signUpWithReports = async () => {
  const user = await signUp()
  await getKysely()
    .insertInto('FeatureFlagOwner')
    .values({featureName: 'Reports', orgId: user.orgId})
    .execute()
  return user
}

const recentTitles = async (orgId: string, cookie: string) => {
  const res = await sendPublic({query: REPORT_QUESTIONS, variables: {orgId}, cookie})
  return res.data.viewer.organization.recentReportQuestions.map(({title}: {title: string}) => title)
}

const start = (orgId: string, cookie: string, variables: Record<string, string>) =>
  sendPublic({query: START_REPORT_QUESTION, variables: {orgId, ...variables}, cookie})

test('a new viewer has no recent questions', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const res = await sendPublic({query: REPORT_QUESTIONS, variables: {orgId}, cookie})
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.organization.recentReportQuestions).toEqual([])
})

test('a picked popular question goes first in recent questions, and picking it again counts a use', async () => {
  const {orgId, cookie, userId} = await signUpWithReports()
  await start(orgId, cookie, {popularQuestionKey: 'teamsNotMet30Days'})
  await start(orgId, cookie, {popularQuestionKey: 'meetingsByType'})
  expect(await recentTitles(orgId, cookie)).toEqual(['Meetings by type', 'Teams by last meeting'])
  const again = await start(orgId, cookie, {popularQuestionKey: 'teamsNotMet30Days'})
  expect(again.data.logReportQuestionUse.reportQuestion).toMatchObject({source: 'popular'})
  expect(await recentTitles(orgId, cookie)).toEqual(['Teams by last meeting', 'Meetings by type'])
  const {uses} = await getKysely()
    .selectFrom('ReportQuestion')
    .select('uses')
    .where('userId', '=', userId)
    .where('title', '=', 'Teams by last meeting')
    .executeTakeFirstOrThrow()
  expect(uses).toBe(2)
})

test('opening a recent question again moves it to the top', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const first = await start(orgId, cookie, {popularQuestionKey: 'retroCadence'})
  await start(orgId, cookie, {popularQuestionKey: 'meetingTypesByTeam'})
  const reportQuestionId = first.data.logReportQuestionUse.reportQuestion.id
  const reopened = await start(orgId, cookie, {reportQuestionId})
  expect(reopened.errors).toBeUndefined()
  expect(await recentTitles(orgId, cookie)).toEqual([
    'Retrospective cadence',
    'Meeting types by team'
  ])
})

test('recent questions belong to the person who asked them', async () => {
  const owner = await signUpWithReports()
  const colleague = await signUp()
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId: owner.orgId, userId: colleague.userId})
    .execute()
  const picked = await start(owner.orgId, owner.cookie, {popularQuestionKey: 'retroCadence'})
  expect(await recentTitles(owner.orgId, colleague.cookie)).toEqual([])
  const reportQuestionId = picked.data.logReportQuestionUse.reportQuestion.id
  const taken = await start(owner.orgId, colleague.cookie, {reportQuestionId})
  expect(taken.errors?.[0]?.message).toBe('That isn’t one of your recent questions')
})

test('a start names a popular question, a recent one or a built report, and only one', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const neither = await start(orgId, cookie, {})
  expect(neither.errors?.[0]?.message).toBe(
    'Pick a popular question, one of your recent ones, or a report you built'
  )
  const unknown = await start(orgId, cookie, {popularQuestionKey: 'storyPointsBySprint'})
  expect(unknown.errors?.[0]?.message).toBe('That popular question isn’t available')
})

test('asking needs AI turned on for the organization', async () => {
  const {orgId, cookie} = await signUpWithReports()
  await getKysely()
    .updateTable('Organization')
    .set({useAI: false})
    .where('id', '=', orgId)
    .execute()
  const res = await sendPublic({
    query: ASK_REPORT_QUESTION,
    variables: {orgId, question: 'Are retro tasks getting done?', timeZone: 'America/New_York'},
    cookie
  })
  expect(res.errors?.[0]?.message).toMatch('AI is turned off')
  expect(await recentTitles(orgId, cookie)).toEqual([])
})

test('a personal access token needs reports:write to keep recent questions', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const created = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {name: 'reports', scopes: ['USERS_READ', 'ORGS_READ', 'REPORTS_READ'], expiresAt},
    cookie
  })
  const res = await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId, popularQuestionKey: 'retroCadence'},
    bearerToken: created.data.createPersonalAccessToken.token
  })
  expect(res.errors?.[0]?.message).toMatch('missing required scope')
})

test('each person keeps their newest 20 questions in an organization', async () => {
  const {orgId, userId} = await signUpWithReports()
  for (let limit = 1; limit <= 22; limit++) {
    await recordReportQuestion({
      userId,
      orgId,
      source: 'builder',
      question: null,
      title: `Top ${limit} teams`,
      spec: tableOfTeams(limit)
    })
  }
  const kept = await getKysely()
    .selectFrom('ReportQuestion')
    .select('title')
    .where('userId', '=', userId)
    .where('orgId', '=', orgId)
    .execute()
  expect(kept).toHaveLength(20)
  expect(kept.map(({title}) => title)).not.toContain('Top 1 teams')
  expect(kept.map(({title}) => title)).not.toContain('Top 2 teams')
})

const askedQuestion = (userId: string, orgId: string, question: string) =>
  recordReportQuestion({
    userId,
    orgId,
    source: 'ask',
    question,
    title: question,
    aiSpec: tableOfTeams(5),
    spec: tableOfTeams(5)
  })

const rate = (orgId: string, cookie: string, reportQuestionId: string, rating: string | null) =>
  sendPublic({query: RATE_REPORT_QUESTION, variables: {orgId, reportQuestionId, rating}, cookie})

test('a person rates the report AI made for their question, and can take the rating back', async () => {
  const {orgId, userId, cookie} = await signUpWithReports()
  const asked = await askedQuestion(userId, orgId, 'Which teams meet most?')
  const reportQuestionId = CipherId.toClient(asked.id, 'ReportQuestion')
  const rated = await rate(orgId, cookie, reportQuestionId, 'bad')
  expect(rated.errors).toBeUndefined()
  expect(rated.data.rateReportQuestion.reportQuestion).toEqual({
    id: reportQuestionId,
    rating: 'bad'
  })
  const cleared = await rate(orgId, cookie, reportQuestionId, null)
  expect(cleared.data.rateReportQuestion.reportQuestion.rating).toBeNull()
  const ratings = await getKysely()
    .selectFrom('ReportQuestionRating')
    .select(['question', 'rating'])
    .where('reportQuestionId', '=', asked.id)
    .orderBy('id')
    .execute()
  expect(ratings).toEqual([
    {question: 'Which teams meet most?', rating: 'bad'},
    {question: 'Which teams meet most?', rating: null}
  ])
})

test('only the person who asked can rate, and only a report AI made', async () => {
  const owner = await signUpWithReports()
  const colleague = await signUp()
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId: owner.orgId, userId: colleague.userId})
    .execute()
  const asked = await askedQuestion(owner.userId, owner.orgId, 'Which teams meet most?')
  const taken = await rate(
    owner.orgId,
    colleague.cookie,
    CipherId.toClient(asked.id, 'ReportQuestion'),
    'good'
  )
  expect(taken.errors?.[0]?.message).toBe('That isn’t a report AI made for one of your questions')
  const built = await recordReportQuestion({
    userId: owner.userId,
    orgId: owner.orgId,
    source: 'builder',
    question: null,
    title: 'Top teams',
    spec: tableOfTeams(3)
  })
  const res = await rate(
    owner.orgId,
    owner.cookie,
    CipherId.toClient(built.id, 'ReportQuestion'),
    'good'
  )
  expect(res.errors?.[0]?.message).toBe('That isn’t a report AI made for one of your questions')
})

test('a rating keeps its question and report after the question leaves the recent list', async () => {
  const {orgId, userId, cookie} = await signUpWithReports()
  const asked = await askedQuestion(userId, orgId, 'Which teams meet most?')
  await rate(orgId, cookie, CipherId.toClient(asked.id, 'ReportQuestion'), 'good')
  for (let limit = 11; limit <= 30; limit++) {
    await recordReportQuestion({
      userId,
      orgId,
      source: 'builder',
      question: null,
      title: `Top ${limit} teams`,
      spec: tableOfTeams(limit)
    })
  }
  expect(await recentTitles(orgId, cookie)).not.toContain('Which teams meet most?')
  const rating = await getKysely()
    .selectFrom('ReportQuestionRating')
    .select(['reportQuestionId', 'question', 'title', 'spec', 'rating'])
    .where('userId', '=', userId)
    .where('orgId', '=', orgId)
    .executeTakeFirstOrThrow()
  expect(rating).toEqual({
    reportQuestionId: null,
    question: 'Which teams meet most?',
    title: 'Which teams meet most?',
    spec: tableOfTeams(5),
    rating: 'good'
  })
})
