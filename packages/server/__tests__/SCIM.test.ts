import faker from 'faker'
import fs from 'fs'
import {HOST, PROTOCOL, sendIntranet, sendPublic, signUpWithEmail} from './common'

const SCIM_URL = `${PROTOCOL}://${HOST}/scim`

function getValue(obj: any, path?: string): string | number | boolean | undefined {
  if (!path) return obj

  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function assertionLabel(a: Assertion) {
  const prop = a.property ? `.${a.property}` : ''
  return `[${a.source}${prop} ${a.comparison}${
    a.value != null ? ` ${JSON.stringify(a.value)}` : ''
  }]`
}

function assertRadarV1(step: Step, res: ParsedResponse, variables: Record<string, string>) {
  for (const a of step.assertions ?? []) {
    const actual = getSourceValue(a, res)
    const label = assertionLabel(a)

    const value = interpolate(a.value, variables)

    try {
      switch (a.comparison) {
        case 'equal_number':
          expect(Number(actual)).toBe(Number(value))
          break

        case 'equal':
          expect(actual?.toString()).toEqual(value)
          break

        case 'contains':
        case 'has_value':
          expect(actual).toContain(value)
          break

        case 'not_empty':
          expect(actual).toBeDefined()
          if (typeof actual === 'string' || Array.isArray(actual)) {
            expect(actual.length).toBeGreaterThan(0)
          }
          break

        case 'is_a_number':
          expect(typeof actual).toBe('number')
          break

        case 'is_a_string':
          expect(typeof actual).toBe('string')
          break

        case 'is_true':
          expect(actual).toBe(true)
          break

        case 'is_false':
          expect(actual).toBe(false)
          break

        default:
          throw new Error(`Unsupported comparison: ${a.comparison}`)
      }
    } catch (err) {
      if (!(err instanceof Error)) throw err
      err.message = `${label}, actual: ${actual},\n${JSON.stringify(a)},\n${JSON.stringify(res, undefined, 2)}\n\n${err.message}`
      throw err
    }
  }
}

function getSourceValue(a: Assertion, res: ParsedResponse) {
  switch (a.source) {
    case 'response_status':
      return res.status
    case 'response_json':
      return getValue(res.data, a.property)
    default:
      throw new Error(`Unsupported source: ${a.source}`)
  }
}

type ParsedResponse = {
  status: number
  headers: Record<string, string>
  data: any
}
async function runRadarV1Step(
  step: Step,
  variables: Record<string, string>
): Promise<ParsedResponse> {
  const url = interpolate(step.url, variables) as string
  const headers = interpolateObject(step.headers, variables) as Record<string, string>
  const body = step.body ? (interpolate(step.body, variables) as string) : undefined

  const res = await fetch(url, {
    method: step.method,
    headers,
    body
  })

  const contentType = res.headers.get('content-type') || ''

  let data: any
  if (contentType.includes('application/json') || contentType.includes('application/scim+json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    data
  }
}

function interpolate(str: Json, variables: Record<string, string>): Json {
  if (typeof str === 'string') {
    return str.replace(/\{\{(\w+)\}\}/g, (_, k) => {
      const replacement = variables[k]
      if (replacement === undefined) {
        throw new Error(
          `Missing variable ${k},\nvariables: ${JSON.stringify(variables, undefined, 2)}`
        )
      }
      return replacement
    })
  }
  if (Array.isArray(str)) {
    return str.map((s) => interpolate(s, variables))
  }
  if (typeof str === 'object' && str !== null) {
    return interpolateObject(str, variables)
  }
  return str
}

function interpolateObject(
  obj: {[key: string]: Json},
  variables: Record<string, string>
): {[key: string]: Json} {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, interpolate(v, variables)]))
}

function extractRadarV1(step: Step, res: ParsedResponse, variables: Record<string, string>) {
  for (const v of step.variables ?? []) {
    let value: any

    switch (v.source) {
      case 'response_json':
        value = getValue(res.data, v.property)
        break

      case 'response_status':
        value = res.status
        break

      case 'response_headers': {
        const key = v.property?.toLowerCase()
        if (key) {
          value = res.headers[key]
        }
        break
      }

      default:
        throw new Error(`Unsupported variable source: ${v.source}`)
    }

    if (v.name) {
      console.log(` - Setting variable "${v.name}" to:`, value)
      if (variables[v.name] !== undefined) {
        console.log(`   (overwriting previous value: ${variables[v.name]})`)
      }
      variables[v.name] = value
    }
  }
}

type Assertion = {
  source: string
  property?: string
  comparison: string
  value?: any
}
type Step = {
  step_type: string
  note?: string
  method: string
  url: string
  headers: Record<string, string>
  body?: any
  assertions?: Array<Assertion>
  variables?: Array<{
    source: string
    property?: string
    name?: string
  }>
}

const createOrgAdmin = async (email: string) => {
  const {userId, cookie, orgId} = await signUpWithEmail(email)
  const promoteToOrgAdmin = await sendIntranet({
    query: `
      mutation SetOrgUserRoleMutation($orgId: ID!, $userId: ID!, $role: OrgUserRole) {
        setOrgUserRole(orgId: $orgId, userId: $userId, role: $role) {
          __typename
          ... on ErrorPayload {
            error {
              message
            }
          }
        }
      }
    `,
    variables: {
      orgId,
      userId,
      role: 'ORG_ADMIN'
    }
  })

  expect(promoteToOrgAdmin).toMatchObject({
    data: {
      setOrgUserRole: {
        __typename: 'SetOrgUserRoleSuccess'
      }
    }
  })

  return {cookie, orgId, userId}
}

const verifyDomain = async (domain: string, orgId: string) => {
  const samlName = domain.split('.')[0]!
  const verifyDomain = await sendIntranet({
    query: `
      mutation VerifyDomain($slug: ID!, $addDomains: [ID!], $orgId: ID!) {
        verifyDomain(slug: $slug, addDomains: $addDomains, orgId: $orgId) {
          ... on ErrorPayload {
            error {
              message
            }
          }
          ... on VerifyDomainSuccess {
            saml {
              id
            }
          }
        }
      }
    `,
    variables: {
      slug: samlName,
      addDomains: [domain],
      orgId
    }
  })

  expect(verifyDomain).toMatchObject({
    data: {
      verifyDomain: {
        saml: {
          id: samlName
        }
      }
    }
  })
}

const enableSCIM = async (orgId: string, cookie: string) => {
  const res = await sendPublic({
    query: `
      mutation UpdateSCIM(
        $orgId: ID!
        $authenticationType: SCIMAuthenticationTypeEnum
      ) {
        updateSCIM(orgId: $orgId, authenticationType: $authenticationType) {
          scimBearerToken
          scimOAuthClientSecret
        }
      }
    `,
    variables: {
      orgId,
      authenticationType: 'bearerToken'
    },
    cookie
  })

  expect(res).toMatchObject({
    data: {
      updateSCIM: {
        scimBearerToken: expect.anything(),
        scimOAuthClientSecret: null
      }
    }
  })

  const bearerToken = res.data.updateSCIM.scimBearerToken
  console.log('Enabled SCIM with bearer token', bearerToken)

  return res.data.updateSCIM.scimBearerToken
}

describe('Okta SCIM 2.0 Runscope test spec', () => {
  const domain = faker.internet.domainName()
  const variables: Record<string, string> = {}

  beforeAll(async () => {
    const {orgId, cookie} = await createOrgAdmin(`admin@${domain}`)
    await verifyDomain(domain, orgId)
    const bearerToken = await enableSCIM(orgId, cookie)

    const randomUsername = faker.internet.userName().toLowerCase()
    Object.assign(variables, {
      SCIMBaseURL: SCIM_URL,
      auth: `Bearer ${bearerToken}`,
      UserIdThatDoesNotExist: 'non-existent-user-id-12345',
      InvalidUserEmail: 'invalid-email-format',
      randomUsername,
      randomUsernameCaps: randomUsername.toUpperCase(),
      randomGivenName: faker.name.firstName(),
      randomFamilyName: faker.name.lastName(),
      randomEmail: faker.internet.email()
    })
  })

  const spec = JSON.parse(fs.readFileSync('./__tests__/Okta-SCIM-20-SPEC-Test.json', 'utf8'))

  const tests = (spec.steps as Step[]).filter((step: Step) => {
    if (step.step_type === 'request') return true
    if (step.step_type === 'pause') return false
    throw new Error(`Unsupported step_type: ${step.step_type}`)
  })

  // Use test.each to parameterize per step
  test.each(tests.map((step, idx) => [step.note || `Step ${idx}`, step]))(
    '%s',
    async (_name, step) => {
      const res = await runRadarV1Step(step, variables)
      assertRadarV1(step, res, variables)
      extractRadarV1(step, res, variables)
    }
  )
})
