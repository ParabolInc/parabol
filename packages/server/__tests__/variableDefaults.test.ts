import {HOST, PROTOCOL, sendPublic, signUp} from './common'

const TASKS_WITH_DEFAULT_FIRST = `
  query VariableDefaultsTasks($first: Int = 50) {
    viewer {
      tasks(first: $first) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const ORGANIZATION_REPORT = `
  query VariableDefaultsReport($orgId: ID!, $spec: ReportSpecInput!) {
    viewer {
      organization(orgId: $orgId) {
        report(spec: $spec, timeZone: "UTC") {
          totalRowCount
        }
      }
    }
  }
`

const literalReport = (period: string) => `
  query VariableDefaultsLiteralReport($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        report(spec: {measures: [MEETINGS], showAs: TABLE, period: ${period}}, timeZone: "UTC") {
          totalRowCount
        }
      }
    }
  }
`

const CREATE_PERSONAL_ACCESS_TOKEN = `
  mutation VariableDefaultsCreateToken($name: String!, $scopes: [OAuthScopeEnum!]!, $expiresAt: DateTime!) {
    createPersonalAccessToken(name: $name, scopes: $scopes, expiresAt: $expiresAt) {
      token
    }
  }
`

const createToken = async (cookie: string) => {
  const res = await sendPublic({
    query: CREATE_PERSONAL_ACCESS_TOKEN,
    variables: {
      name: 'variable defaults',
      scopes: ['USERS_READ', 'TASKS_READ', 'ORGS_READ', 'REPORTS_READ'],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    cookie
  })
  expect(res.errors).toBeUndefined()
  return res.data.createPersonalAccessToken.token as string
}

const sendAdHoc = async (
  bearerToken: string,
  query: string,
  variables?: Record<string, unknown>
) => {
  const response = await fetch(`${PROTOCOL}://${HOST}/graphql`, {
    method: 'POST',
    headers: {'content-type': 'application/json', authorization: `Bearer ${bearerToken}`},
    body: JSON.stringify({query, variables})
  })
  return response.json()
}

const range = {startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-01-31T00:00:00.000Z'}
const presetOnly = '{preset: LAST_30_DAYS}'
const presetAndRange = `{preset: LAST_30_DAYS, range: {startAt: "${range.startAt}", endAt: "${range.endAt}"}}`

test('an operation that leaves out a variable with a default uses the default', async () => {
  const {cookie} = await signUp()
  const res = await sendPublic({query: TASKS_WITH_DEFAULT_FIRST, cookie})
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.tasks.edges.length).toBeGreaterThan(0)
})

test('an ad hoc operation from a personal access token uses the default of a variable it leaves out', async () => {
  const {cookie} = await signUp()
  const token = await createToken(cookie)
  const res = await sendAdHoc(token, TASKS_WITH_DEFAULT_FIRST)
  expect(res.errors).toBeUndefined()
  expect(res.data.viewer.tasks.edges.length).toBeGreaterThan(0)
})

test('a @oneOf input in a variable takes exactly one key', async () => {
  const {orgId, cookie} = await signUp()
  const spec = {measures: ['MEETINGS'], showAs: 'TABLE'}
  const oneKey = await sendPublic({
    query: ORGANIZATION_REPORT,
    variables: {orgId, spec: {...spec, period: {preset: 'LAST_30_DAYS'}}},
    cookie
  })
  expect(oneKey.errors).toBeUndefined()
  expect(oneKey.data.viewer.organization.report.totalRowCount).toEqual(expect.any(Number))

  const twoKeys = await sendPublic({
    query: ORGANIZATION_REPORT,
    variables: {orgId, spec: {...spec, period: {preset: 'LAST_30_DAYS', range}}},
    cookie
  })
  expect(twoKeys.errors?.[0]?.message).toMatch('Exactly one key must be specified')
  expect(twoKeys.data?.viewer?.organization?.report ?? null).toBeNull()
})

test('a @oneOf input written into a persisted operation takes exactly one key', async () => {
  const {orgId, cookie} = await signUp()
  const oneKey = await sendPublic({query: literalReport(presetOnly), variables: {orgId}, cookie})
  expect(oneKey.errors).toBeUndefined()
  expect(oneKey.data.viewer.organization.report.totalRowCount).toEqual(expect.any(Number))

  const twoKeys = await sendPublic({
    query: literalReport(presetAndRange),
    variables: {orgId},
    cookie
  })
  expect(twoKeys.errors?.length).toBeGreaterThan(0)
  expect(twoKeys.data?.viewer?.organization?.report ?? null).toBeNull()
})

test('a @oneOf input written into an ad hoc operation takes exactly one key', async () => {
  const {orgId, cookie} = await signUp()
  const token = await createToken(cookie)
  const oneKey = await sendAdHoc(token, literalReport(presetOnly), {orgId})
  expect(oneKey.errors).toBeUndefined()
  expect(oneKey.data.viewer.organization.report.totalRowCount).toEqual(expect.any(Number))

  const twoKeys = await sendAdHoc(token, literalReport(presetAndRange), {orgId})
  expect(twoKeys.errors?.[0]?.message).toMatch('ReportPeriodInput')
  expect(twoKeys.data?.viewer?.organization?.report ?? null).toBeNull()
})
