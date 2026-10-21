import {randomUUIDv7} from 'crypto'
import type {ReportSpec} from '../../client/shared/reports/reportCatalog'
import getKysely from '../postgres/getKysely'
import recordReportQuestion from '../reports/recordReportQuestion'
import {sendPublic, signUp} from './common'

const REPORT_QUESTIONS = `
  query ReportQuestions($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        popularReportQuestions {
          key
          subject
          question
          spec
        }
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
  mutation StartReportQuestion($orgId: ID!, $popularQuestionKey: String, $reportQuestionId: ID) {
    startReportQuestion(
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
      suggestions {
        key
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

test('the popular questions come in order, each with a spec', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const res = await sendPublic({query: REPORT_QUESTIONS, variables: {orgId}, cookie})
  expect(res.errors).toBeUndefined()
  const {popularReportQuestions, recentReportQuestions} = res.data.viewer.organization
  expect(popularReportQuestions[0]).toMatchObject({key: 'activePeopleOverTime', subject: 'people'})
  expect(popularReportQuestions.every(({spec}: {spec: string}) => JSON.parse(spec).showAs)).toBe(
    true
  )
  expect(recentReportQuestions).toEqual([])
})

test('a picked popular question goes first in recent questions, and picking it again counts a use', async () => {
  const {orgId, cookie, userId} = await signUpWithReports()
  await start(orgId, cookie, {popularQuestionKey: 'teamsNotMet30Days'})
  await start(orgId, cookie, {popularQuestionKey: 'meetingsByType'})
  expect(await recentTitles(orgId, cookie)).toEqual(['Meetings by type', 'Teams by last meeting'])
  const again = await start(orgId, cookie, {popularQuestionKey: 'teamsNotMet30Days'})
  expect(again.data.startReportQuestion.reportQuestion).toMatchObject({source: 'popular'})
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
  const reportQuestionId = first.data.startReportQuestion.reportQuestion.id
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
  const reportQuestionId = picked.data.startReportQuestion.reportQuestion.id
  const taken = await start(owner.orgId, colleague.cookie, {reportQuestionId})
  expect(taken.errors?.[0]?.message).toBe('That isn’t one of your recent questions')
})

test('a start names a popular question or a recent one, but not both', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const neither = await start(orgId, cookie, {})
  expect(neither.errors?.[0]?.message).toBe('Pick a popular question or one of your recent ones')
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
  const tableOfTeams = (limit: number): ReportSpec => ({
    measures: ['MEETINGS'],
    breakdown: [{dimension: 'TEAM'}],
    filters: [],
    where: [],
    period: {preset: 'PAGE', startDate: null, endDate: null},
    compareTo: null,
    showAs: 'TABLE',
    sort: null,
    limit
  })
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
