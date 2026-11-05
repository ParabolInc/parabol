import {parseReportSpec} from '../../client/shared/reports/parseReportSpec'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const ORGANIZATION_REPORT = `
  query OrganizationReport($orgId: ID!, $spec: ReportSpecInput!) {
    viewer {
      organization(orgId: $orgId) {
        report(spec: $spec, timeZone: "America/New_York") {
          step
          rows {
            keys { value label isPartial }
            values
            previousValues
          }
          totalRowCount
          notes { kind count }
        }
      }
    }
  }
`

const REPORT_PINS = `
  query PinnedReports($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        pinnedReports {
          id
          title
          spec
          report(timeZone: "America/New_York", pagePeriod: {preset: LAST_30_DAYS}) {
            rows {
              values
            }
            teamHealth {
              latestCheckEndedAt
            }
          }
        }
      }
    }
  }
`

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation CreatePersonalAccessTokenMutation(
    $name: String!
    $scopes: [OAuthScopeEnum!]!
    $grantedOrgIds: [ID!]
    $expiresAt: DateTime!
  ) {
    createPersonalAccessToken(
      name: $name
      scopes: $scopes
      grantedOrgIds: $grantedOrgIds
      expiresAt: $expiresAt
    ) {
      token
    }
  }
`

const meetingsByTeam = {
  measures: ['MEETINGS'],
  breakdown: [{dimension: 'TEAM'}],
  period: {preset: 'LAST_30_DAYS'},
  showAs: 'BARS'
}

const turnOnReports = async (orgId: string) => {
  await getKysely().insertInto('FeatureFlagOwner').values({featureName: 'Reports', orgId}).execute()
}

const createToken = async (cookie: string, scopes: string[], grantedOrgIds?: string[]) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {name: 'reports', scopes, grantedOrgIds, expiresAt},
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const requestReport = (orgId: string, auth: {cookie: string} | {bearerToken: string}) =>
  sendPublic({query: ORGANIZATION_REPORT, variables: {orgId, spec: meetingsByTeam}, ...auth})

test('Reports stays off until the organization has the flag', async () => {
  const {orgId, cookie} = await signUp()
  const res = await requestReport(orgId, {cookie})
  expect(res.errors?.[0]?.message).toBe("Reports isn't turned on for this organization")
  expect(res.data.viewer.organization).toBeNull()
})

test('a member gets a report on their teams', async () => {
  const {orgId, teamId, cookie} = await signUp()
  await turnOnReports(orgId)
  const res = await requestReport(orgId, {cookie})
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.organization.report).toEqual({
    step: null,
    rows: [
      {
        keys: [{value: teamId, label: expect.any(String), isPartial: false}],
        values: [0],
        previousValues: null
      }
    ],
    totalRowCount: 1,
    notes: []
  })
})

test('someone outside the organization gets nothing', async () => {
  const {orgId} = await signUp()
  await turnOnReports(orgId)
  const outsider = await signUp()
  const res = await requestReport(orgId, {cookie: outsider.cookie})
  expect(res.errors).toBeTruthy()
  expect(res.data.viewer.organization).toBeNull()
})

test('a personal access token needs the reports scope', async () => {
  const {orgId, cookie} = await signUp()
  await turnOnReports(orgId)
  const withoutScope = await createToken(cookie, ['USERS_READ', 'ORGS_READ'])
  const denied = await requestReport(orgId, {bearerToken: withoutScope})
  expect(denied.errors?.[0]?.message).toMatch('missing required scope')
  expect(denied.data.viewer.organization).toBeNull()

  const withScope = await createToken(cookie, ['USERS_READ', 'ORGS_READ', 'REPORTS_READ'])
  const allowed = await requestReport(orgId, {bearerToken: withScope})
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.viewer.organization.report.rows).toHaveLength(1)
})

test('a personal access token reaches only the organizations it was granted', async () => {
  const {orgId, cookie} = await signUp()
  await turnOnReports(orgId)
  const other = await signUp()
  const scopes = ['USERS_READ', 'ORGS_READ', 'REPORTS_READ']
  const grantedHere = await createToken(cookie, scopes, [orgId])
  const allowed = await requestReport(orgId, {bearerToken: grantedHere})
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.viewer.organization.report.rows).toHaveLength(1)

  const grantedElsewhere = await createToken(cookie, scopes, [other.orgId])
  const denied = await requestReport(orgId, {bearerToken: grantedElsewhere})
  expect(denied.errors).toBeTruthy()
  expect(denied.data.viewer.organization).toBeNull()
})

test('every organization starts with the built-in pins, each with a spec that runs', async () => {
  const {orgId, cookie} = await signUp()
  const flagOff = await sendPublic({query: REPORT_PINS, variables: {orgId}, cookie})
  expect(flagOff.errors?.[0]?.message).toBe("Reports isn't turned on for this organization")

  await turnOnReports(orgId)
  const res = await sendPublic({query: REPORT_PINS, variables: {orgId}, cookie})
  expect(res.errors).toBeUndefined()
  const {pinnedReports} = res.data.viewer.organization
  expect(pinnedReports.map(({title}: {title: string}) => title)).toEqual([
    'Active users over time',
    'Health score by team',
    'Meetings by type',
    'Where new tasks end up'
  ])
  for (const pin of pinnedReports) {
    expect(pin.id).toContain(orgId)
    expect(parseReportSpec(JSON.parse(pin.spec)).spec).toEqual(JSON.parse(pin.spec))
    // a Team Health heatmap has no rows until a team runs a check, and says none has
    const {rows, teamHealth} = pin.report
    if (teamHealth) expect(teamHealth.latestCheckEndedAt).toBeNull()
    else expect(rows.length).toBeGreaterThan(0)
  }
})
