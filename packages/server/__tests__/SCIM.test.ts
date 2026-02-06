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

  return res.data.updateSCIM.scimBearerToken
}

describe('Okta SCIM 2.0', () => {
  let bearerToken: string
  const domain = faker.internet.domainName()

  beforeAll(async () => {
    const {orgId, cookie} = await createOrgAdmin(`admin@${domain}`)
    await verifyDomain(domain, orgId)
    bearerToken = await enableSCIM(orgId, cookie)
  })

  describe('Okta SCIM 2.0 Runscope test spec', () => {
    const variables: Record<string, string> = {}

    beforeAll(async () => {
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

  describe('Soft delete and re-provision user', () => {
    const userName = faker.internet.userName().toLowerCase()
    const givenName = faker.name.firstName()
    const familyName = faker.name.lastName()
    const testEmail = faker.internet.userName().toLowerCase() + '@' + domain
    const displayName = faker.name.firstName()
    const externalId = faker.datatype.uuid()

    let id: string
    test('Create User for Disable', async () => {
      const res = await fetch(`${SCIM_URL}/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          active: true,
          displayName: displayName,
          externalId,
          emails: [
            {
              type: 'work',
              value: testEmail
            }
          ],
          name: {
            givenName,
            familyName
          },
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName: userName
        })
      })
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: expect.anything(),
        externalId,
        userName,
        active: true,
        emails: [
          {
            type: 'work',
            value: testEmail
          }
        ],
        displayName,
        name: {
          givenName,
          familyName
        }
      })
      id = data.id
    })

    test('PATCH /Users/{id} - Disable User', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          Operations: [
            {
              op: 'replace',
              path: 'active',
              value: false
            }
          ],
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp']
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        active: false
      })
    })

    test('PATCH /Users/{id} - Re-enable User', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'replace',
              path: 'active',
              value: true
            }
          ]
        })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      // check it didn't mess with other properties while re-enabling
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        externalId,
        active: true,
        emails: [
          {
            type: 'work',
            value: testEmail
          }
        ],
        displayName,
        name: {
          givenName,
          familyName
        }
      })
    })

    const newEmail = faker.internet.userName().toLowerCase() + '@' + domain
    const newUserName = faker.internet.userName().toLowerCase()

    test('PUT /Users/{id} - Update User with the latest email and username', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          id,
          externalId,
          userName: newUserName,
          active: true,
          emails: [
            {
              value: newEmail,
              type: 'work',
              primary: true
            }
          ],
          locale: 'en-US',
          groups: []
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        externalId,
        userName: newUserName,
        active: true,
        emails: [
          {
            type: 'work',
            value: newEmail,
            primary: true
          }
        ]
      })
    })
  })
})

describe('Microsoft Entra SCIM 2.0', () => {
  // see https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups#user-operations

  let bearerToken: string
  const domain = faker.internet.domainName()
  beforeAll(async () => {
    const {orgId, cookie} = await createOrgAdmin(`admin@${domain}`)
    await verifyDomain(domain, orgId)
    bearerToken = await enableSCIM(orgId, cookie)
  })

  describe('Create New User', () => {
    const userName = faker.internet.userName().toLowerCase()
    const testEmail = faker.internet.userName().toLowerCase() + '@' + domain
    const externalId = faker.datatype.uuid()
    const givenName = faker.name.firstName()
    const familyName = faker.name.lastName()

    let id: string
    test('POST /Users', async () => {
      const res = await fetch(`${SCIM_URL}/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: [
            'urn:ietf:params:scim:schemas:core:2.0:User',
            'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
          ],
          externalId,
          userName,
          active: true,
          emails: [
            {
              primary: true,
              type: 'work',
              value: testEmail
            }
          ],
          meta: {
            resourceType: 'User'
          },
          name: {
            formatted: `${givenName} ${familyName}`,
            familyName: familyName,
            givenName: givenName
          },
          roles: []
        })
      })
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: expect.anything(),
        externalId,
        userName,
        active: true,
        emails: [
          {
            primary: true,
            type: 'work',
            value: testEmail
          }
        ],
        name: {
          familyName: familyName,
          givenName: givenName
        }
      })
      id = data.id
    })

    test('GET /Users?filter={joiningProperty} eq "value"', async () => {
      const res = await fetch(`${SCIM_URL}/Users?filter=userName eq "${userName}"`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 1,
        Resources: [
          {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id,
            externalId,
            userName,
            active: true,
            emails: [
              {
                primary: true,
                type: 'work',
                value: testEmail
              }
            ],
            name: {
              familyName: familyName,
              givenName: givenName
            }
          }
        ]
      })
    })
    test('GET /Users/{id}', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        externalId,
        userName,
        active: true,
        emails: [
          {
            primary: true,
            type: 'work',
            value: testEmail
          }
        ],
        name: {
          familyName: familyName,
          givenName: givenName
        }
      })
    })

    test('DELETE /Users/{id}', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(204)
    })

    test('GET Deleted User by ID', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(404)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        status: '404',
        detail: expect.anything()
      })
    })
  })

  test('Create Duplicate User', async () => {
    const userName = faker.internet.userName().toLowerCase()
    const testEmail = faker.internet.userName().toLowerCase() + '@' + domain

    const post1 = await fetch(`${SCIM_URL}/Users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/scim+json',
        Authorization: `Bearer ${bearerToken}`
      },
      body: JSON.stringify({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName,
        active: true,
        emails: [
          {
            primary: true,
            type: 'work',
            value: testEmail
          }
        ]
      })
    })
    expect(post1.status).toBe(201)

    const otherEmail = faker.internet.userName().toLowerCase() + '@' + domain
    const post2 = await fetch(`${SCIM_URL}/Users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/scim+json',
        Authorization: `Bearer ${bearerToken}`
      },
      body: JSON.stringify({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName,
        active: true,
        emails: [
          {
            primary: true,
            type: 'work',
            value: otherEmail
          }
        ]
      })
    })
    expect(post2.status).toBe(409)
    const post2Data = await post2.json()
    expect(post2Data).toMatchObject({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      status: '409',
      detail: expect.anything()
    })
  })

  test('Get User by query - Zero results', async () => {
    const getByQuery = await fetch(
      `${SCIM_URL}/Users?filter=userName eq "non-existent-user-12345"`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      }
    )
    expect(getByQuery.status).toBe(200)
    const getByQueryData = await getByQuery.json()
    expect(getByQueryData).toMatchObject({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: 0,
      Resources: []
    })
  })

  describe('Update User', () => {
    const userName = faker.internet.userName().toLowerCase()
    const testEmail = faker.internet.userName().toLowerCase() + '@' + domain
    const givenName = faker.name.firstName()
    const familyName = faker.name.lastName()

    let id: string
    test('Create User for Update', async () => {
      const res = await fetch(`${SCIM_URL}/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName,
          active: true,
          emails: [
            {
              primary: true,
              type: 'work',
              value: testEmail
            }
          ]
        })
      })
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toMatchObject({
        id: expect.anything(),
        userName
      })
      id = data.id
    })

    test('PATCH /Users/{id} insert additional non-required attributes', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'Add',
              value: {
                name: {
                  givenName: givenName,
                  familyName: familyName
                }
              }
            }
          ]
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        userName,
        emails: [
          {
            primary: true,
            type: 'work',
            value: testEmail
          }
        ],
        name: {
          givenName,
          familyName
        }
      })
    })

    test('GET Updated User', async () => {
      const res = await fetch(`${SCIM_URL}/Users?filter=userName eq "${userName}"`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 1,
        Resources: [
          {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id,
            userName,
            emails: [
              {
                primary: true,
                type: 'work',
                value: testEmail
              }
            ],
            name: {
              givenName,
              familyName
            }
          }
        ]
      })
    })

    const newEmail = faker.internet.email().toLowerCase()
    const newFamilyName = faker.name.lastName()
    test('PATCH /Users/{id} Replace multi-valued properties', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'Replace',
              path: 'emails[type eq "work"].value',
              value: newEmail
            },
            {
              op: 'Replace',
              path: 'name.familyName',
              value: newFamilyName
            }
          ]
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        userName,
        emails: [
          {
            primary: true,
            type: 'work',
            value: newEmail
          }
        ],
        name: {
          givenName,
          familyName: newFamilyName
        }
      })
    })
    test('GET Updated User', async () => {
      const res = await fetch(`${SCIM_URL}/Users?filter=userName eq "${userName}"`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 1,
        Resources: [
          {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id,
            userName,
            emails: [
              {
                primary: true,
                type: 'work',
                value: newEmail
              }
            ],
            name: {
              givenName,
              familyName: newFamilyName
            }
          }
        ]
      })
    })

    const newUserName = faker.internet.userName().toLowerCase()
    test('PATCH /Users/{id} Update joining attribute', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'replace',
              path: 'userName',
              value: newUserName
            }
          ]
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        userName: newUserName,
        emails: [
          {
            primary: true,
            type: 'work',
            value: expect.anything()
          }
        ],
        name: {
          givenName,
          familyName: expect.anything()
        }
      })
    })
    test('GET Updated User', async () => {
      const res = await fetch(`${SCIM_URL}/Users?filter=userName eq "${newUserName}"`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/scim+json',
          Authorization: `Bearer ${bearerToken}`
        }
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
        totalResults: 1,
        Resources: [
          {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            id,
            userName: newUserName,
            emails: [
              {
                primary: true,
                type: 'work',
                value: expect.anything()
              }
            ],
            name: {
              givenName,
              familyName: expect.anything()
            }
          }
        ]
      })
    })
  })

  describe('Soft delete and re-provision user', () => {
    const userName = faker.internet.userName().toLowerCase()
    const lastName = faker.name.firstName()
    const testEmail = lastName.toLowerCase() + '@' + domain
    const displayName = faker.name.firstName()

    let id: string
    test('Create User for Disable', async () => {
      const res = await fetch(`${SCIM_URL}/Users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          active: true,
          displayName: displayName,
          emails: [
            {
              type: 'work',
              value: testEmail
            }
          ],
          schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
          userName: userName
        })
      })
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id: expect.anything(),
        userName,
        active: true,
        emails: [
          {
            type: 'work',
            value: testEmail
          }
        ],
        displayName,
        name: {
          givenName: displayName,
          familyName: lastName
        }
      })
      id = data.id
    })

    test('PATCH /Users/{id} - Disable User', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          Operations: [
            {
              op: 'replace',
              path: 'active',
              value: false
            }
          ],
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp']
        })
      })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        active: false
      })
    })

    test('PATCH /Users/{id} - Re-enable User', async () => {
      const res = await fetch(`${SCIM_URL}/Users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/scim+json; charset=utf-8',
          Authorization: `Bearer ${bearerToken}`
        },
        body: JSON.stringify({
          schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
          Operations: [
            {
              op: 'replace',
              path: 'emails[type eq "work"].value',
              value: testEmail
            },
            {
              op: 'replace',
              path: 'active',
              value: true
            }
          ]
        })
      })

      expect(res.status).toBe(200)
      const data = await res.json()
      // check it didn't mess with other properties while re-enabling
      expect(data).toMatchObject({
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        id,
        active: true,
        emails: [
          {
            type: 'work',
            value: testEmail
          }
        ],
        displayName,
        name: {
          givenName: displayName,
          familyName: lastName
        }
      })
    })
  })
})

test('Invalid endpoint returns 404', async () => {
  const res = await fetch(`${SCIM_URL}/InvalidEndpoint`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/scim+json',
      Authorization: `Bearer invalid-token`
    }
  })
  expect(res.status).toBe(404)
})
