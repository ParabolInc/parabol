import {randomUUIDv7} from 'crypto'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const REPORT_PINS = `
  query ReportPins($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        reportPins {
          id
          title
          pinnedBy {
            id
          }
        }
      }
    }
  }
`

const PIN_REPORT = `
  mutation PinReport($orgId: ID!, $spec: ReportSpecInput!, $title: String!, $reportQuestionId: ID) {
    pinReport(orgId: $orgId, spec: $spec, title: $title, reportQuestionId: $reportQuestionId) {
      reportPin {
        id
        title
      }
    }
  }
`

const UNPIN_REPORT = `
  mutation UnpinReport($orgId: ID!, $pinId: ID!) {
    unpinReport(orgId: $orgId, pinId: $pinId) {
      organization {
        reportPins {
          title
        }
      }
    }
  }
`

const MOVE_REPORT_PIN = `
  mutation MoveReportPin($orgId: ID!, $pinId: ID!, $toIndex: Int!) {
    moveReportPin(orgId: $orgId, pinId: $pinId, toIndex: $toIndex) {
      organization {
        reportPins {
          title
        }
      }
    }
  }
`

const START_REPORT_QUESTION = `
  mutation StartReportQuestion($orgId: ID!, $popularQuestionKey: String, $reportQuestionId: ID, $spec: ReportSpecInput, $title: String) {
    startReportQuestion(orgId: $orgId, popularQuestionKey: $popularQuestionKey, reportQuestionId: $reportQuestionId, spec: $spec, title: $title) {
      reportQuestion {
        id
        source
      }
    }
  }
`

const BUILT_IN_TITLES = [
  'Active users over time',
  'Meetings by type',
  'Discussions and tasks by meeting type',
  'Retrospective cadence'
]

const topTeams = (limit: number) => ({
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}],
  period: {preset: 'PAGE'},
  showAs: 'TABLE',
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

const addMember = async (orgId: string) => {
  const member = await signUp()
  await getKysely()
    .insertInto('OrganizationUser')
    .values({id: randomUUIDv7(), orgId, userId: member.userId})
    .execute()
  return member
}

const pinsOf = async (orgId: string, cookie: string) => {
  const res = await sendPublic({query: REPORT_PINS, variables: {orgId}, cookie})
  return res.data.viewer.organization.reportPins as {
    id: string
    title: string
    pinnedBy: {id: string} | null
  }[]
}

const pin = (orgId: string, cookie: string, variables: Record<string, unknown>) =>
  sendPublic({query: PIN_REPORT, variables: {orgId, ...variables}, cookie})

test('a new pin goes first, and the built-in pins keep their ids once the org has pins of its own', async () => {
  const {orgId, cookie, userId} = await signUpWithReports()
  const builtIns = await pinsOf(orgId, cookie)
  expect(builtIns.map(({title}) => title)).toEqual(BUILT_IN_TITLES)
  const res = await pin(orgId, cookie, {spec: topTeams(5), title: 'Top 5 teams'})
  expect(res.errors).toBeUndefined()
  await pin(orgId, cookie, {spec: topTeams(10), title: 'Top 10 teams'})
  const pins = await pinsOf(orgId, cookie)
  expect(pins.map(({title}) => title)).toEqual(['Top 10 teams', 'Top 5 teams', ...BUILT_IN_TITLES])
  expect(pins[0]?.pinnedBy?.id).toBe(userId)
  expect(pins.at(-1)?.pinnedBy).toBeNull()
  expect(pins.slice(2).map(({id}) => id)).toEqual(builtIns.map(({id}) => id))
})

test('pinning a report that is already pinned keeps the one pin', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const first = await pin(orgId, cookie, {spec: topTeams(5), title: 'Top 5 teams'})
  const again = await pin(orgId, cookie, {spec: topTeams(5), title: 'Same report'})
  expect(again.data.pinReport.reportPin).toEqual(first.data.pinReport.reportPin)
  expect(await pinsOf(orgId, cookie)).toHaveLength(BUILT_IN_TITLES.length + 1)
})

test('a pin keeps the question it came from, so asks can be compared with pins', async () => {
  const {orgId, cookie} = await signUpWithReports()
  const started = await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId, popularQuestionKey: 'teamsNotMet30Days'},
    cookie
  })
  const reportQuestionId = started.data.startReportQuestion.reportQuestion.id
  const spec = {
    measures: ['LAST_MEETING'],
    breakdown: [{dimension: 'TEAM'}],
    where: [{measure: 'LAST_MEETING', operator: 'OLDER_THAN_DAYS', value: 30}],
    period: {preset: 'ALL_TIME'},
    showAs: 'TABLE',
    sort: {by: 'VALUE', order: 'ASC'}
  }
  await pin(orgId, cookie, {spec, title: 'Teams by last meeting', reportQuestionId})
  const row = await getKysely()
    .selectFrom('ReportPin')
    .select(['source', 'question', 'shape', 'popularQuestionId'])
    .where('orgId', '=', orgId)
    .where('isBuiltIn', '=', false)
    .executeTakeFirstOrThrow()
  expect(row).toMatchObject({source: 'popular', question: 'Which teams haven’t met in 30 days?'})
  expect(row.popularQuestionId).not.toBeNull()
  expect(row.shape).toContain('LAST_MEETING | TEAM')
})

test('someone else’s question doesn’t travel with a pin', async () => {
  const owner = await signUpWithReports()
  const member = await addMember(owner.orgId)
  const started = await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId: owner.orgId, popularQuestionKey: 'retroCadence'},
    cookie: member.cookie
  })
  await pin(owner.orgId, owner.cookie, {
    spec: topTeams(8),
    title: 'Top 8 teams',
    reportQuestionId: started.data.startReportQuestion.reportQuestion.id
  })
  const row = await getKysely()
    .selectFrom('ReportPin')
    .select(['source', 'question', 'createdBy'])
    .where('orgId', '=', owner.orgId)
    .where('isBuiltIn', '=', false)
    .executeTakeFirstOrThrow()
  expect(row).toEqual({source: null, question: null, createdBy: owner.userId})
})

test('an unpinned report is kept as history', async () => {
  const {orgId, cookie, userId} = await signUpWithReports()
  const pinned = await pin(orgId, cookie, {spec: topTeams(10), title: 'Top 10 teams'})
  const pinId = pinned.data.pinReport.reportPin.id
  const res = await sendPublic({query: UNPIN_REPORT, variables: {orgId, pinId}, cookie})
  expect(res.errors).toBeUndefined()
  expect(
    res.data.unpinReport.organization.reportPins.map(({title}: {title: string}) => title)
  ).toEqual(BUILT_IN_TITLES)
  const row = await getKysely()
    .selectFrom('ReportPin')
    .select(['removedAt', 'removedBy'])
    .where('orgId', '=', orgId)
    .where('title', '=', 'Top 10 teams')
    .executeTakeFirstOrThrow()
  expect(row.removedAt).not.toBeNull()
  expect(row.removedBy).toBe(userId)
})

test('only org admins and billing leaders pin and unpin reports', async () => {
  const owner = await signUpWithReports()
  const member = await addMember(owner.orgId)
  const byMember = await pin(owner.orgId, member.cookie, {
    spec: topTeams(20),
    title: 'Top 20 teams'
  })
  expect(byMember.errors).toBeTruthy()
  const pins = await pinsOf(owner.orgId, owner.cookie)
  expect(pins.map(({title}) => title)).toEqual(BUILT_IN_TITLES)
  const unpinAs = (cookie: string) =>
    sendPublic({query: UNPIN_REPORT, variables: {orgId: owner.orgId, pinId: pins[0]!.id}, cookie})
  expect((await unpinAs(member.cookie)).errors).toBeTruthy()
  const byLeader = await unpinAs(owner.cookie)
  expect(byLeader.errors).toBeUndefined()
  expect(byLeader.data.unpinReport.organization.reportPins[0].title).toBe('Meetings by type')
})

test('leaders move pins and members can’t', async () => {
  const owner = await signUpWithReports()
  const member = await addMember(owner.orgId)
  const pins = await pinsOf(owner.orgId, owner.cookie)
  const moveAs = (cookie: string) =>
    sendPublic({
      query: MOVE_REPORT_PIN,
      variables: {orgId: owner.orgId, pinId: pins[3]!.id, toIndex: 0},
      cookie
    })
  expect((await moveAs(member.cookie)).errors).toBeTruthy()
  const moved = await moveAs(owner.cookie)
  expect(moved.errors).toBeUndefined()
  expect(
    moved.data.moveReportPin.organization.reportPins.map(({title}: {title: string}) => title)
  ).toEqual([
    'Retrospective cadence',
    'Active users over time',
    'Meetings by type',
    'Discussions and tasks by meeting type'
  ])
})

test('the page holds 24 pins', async () => {
  const {orgId, cookie} = await signUpWithReports()
  for (let limit = 1; limit <= 20; limit++) {
    const res = await pin(orgId, cookie, {spec: topTeams(limit), title: `Top ${limit} teams`})
    expect(res.errors).toBeUndefined()
  }
  const full = await pin(orgId, cookie, {spec: topTeams(21), title: 'Top 21 teams'})
  expect(full.errors?.[0]?.message).toBe('Reports holds 24 pins. Unpin one first')
})

test('a changed report is kept as the spec used, and one built by hand as a builder question', async () => {
  const {orgId, cookie, userId} = await signUpWithReports()
  const started = await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId, popularQuestionKey: 'retroCadence'},
    cookie
  })
  const reportQuestionId = started.data.startReportQuestion.reportQuestion.id
  const changed = {
    measures: ['MEETINGS'],
    breakdown: [{dimension: 'TEAM'}, {dimension: 'WEEK'}],
    filters: [{dimension: 'MEETING_TYPE', values: ['retrospective']}],
    period: {preset: 'PAGE'},
    showAs: 'HEATMAP'
  }
  await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId, reportQuestionId, spec: changed},
    cookie
  })
  const built = await sendPublic({
    query: START_REPORT_QUESTION,
    variables: {orgId, spec: topTeams(5), title: 'Meetings by team'},
    cookie
  })
  expect(built.data.startReportQuestion.reportQuestion.source).toBe('builder')
  const rows = await getKysely()
    .selectFrom('ReportQuestion')
    .select(['source', 'shape', 'editedAt'])
    .where('userId', '=', userId)
    .orderBy('id')
    .execute()
  expect(rows[0]).toMatchObject({source: 'popular', shape: expect.stringContaining('TEAM, WEEK')})
  expect(rows[0]!.editedAt).not.toBeNull()
  expect(rows[1]).toMatchObject({source: 'builder', editedAt: null})
})
