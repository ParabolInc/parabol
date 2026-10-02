import getKysely from '../postgres/getKysely'
import {
  createOrgAdmin,
  getTestDomain,
  getTestEmail,
  HOST,
  PROTOCOL,
  sendIntranet,
  sendPublic
} from './common'

const verifyDomain = (slug: string, domain: string, orgId: string) =>
  sendIntranet({
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
    variables: {slug, addDomains: [domain], orgId}
  })

const querySAMLs = (orgId: string, cookie: string) =>
  sendPublic({
    query: `
      query SAMLs($orgId: ID!) {
        viewer {
          organization(orgId: $orgId) {
            id
            samls {
              id
              domains
              metadataURL
              scimAuthenticationType
            }
          }
        }
      }
    `,
    variables: {orgId},
    cookie
  })

const setupOrgWithTwoIdPs = async (adminDomain?: string) => {
  const parentDomain = getTestDomain()
  const subsidiaryDomain = getTestDomain()
  const {
    orgId,
    cookie,
    userId: adminId
  } = await createOrgAdmin(getTestEmail(adminDomain ?? parentDomain))
  await getKysely()
    .updateTable('Organization')
    .set({tier: 'enterprise'})
    .where('id', '=', orgId)
    .execute()
  const parentSlug = parentDomain.split('.')[0]!
  const subsidiarySlug = subsidiaryDomain.split('.')[0]!
  expect(await verifyDomain(parentSlug, parentDomain, orgId)).toMatchObject({
    data: {verifyDomain: {saml: {id: parentSlug}}}
  })
  expect(await verifyDomain(subsidiarySlug, subsidiaryDomain, orgId)).toMatchObject({
    data: {verifyDomain: {saml: {id: subsidiarySlug}}}
  })
  return {orgId, cookie, adminId, parentSlug, parentDomain, subsidiarySlug, subsidiaryDomain}
}

test('an organization can own multiple identity providers', async () => {
  const {orgId, cookie, parentSlug, parentDomain, subsidiarySlug, subsidiaryDomain} =
    await setupOrgWithTwoIdPs()
  const res = await querySAMLs(orgId, cookie)
  expect(res.data.viewer.organization.samls).toEqual([
    {id: parentSlug, domains: [parentDomain], metadataURL: null, scimAuthenticationType: null},
    {
      id: subsidiarySlug,
      domains: [subsidiaryDomain],
      metadataURL: null,
      scimAuthenticationType: null
    }
  ])
})

test('non-enterprise orgs get null samls without losing the organization', async () => {
  const {orgId, cookie} = await createOrgAdmin(getTestEmail(getTestDomain()))
  const res = await querySAMLs(orgId, cookie)
  expect(res.data.viewer.organization).toMatchObject({id: orgId, samls: null})
})

const UPDATE_SCIM = `
  mutation UpdateSCIM($samlId: ID!, $authenticationType: SCIMAuthenticationTypeEnum) {
    updateSCIM(samlId: $samlId, authenticationType: $authenticationType) {
      scimBearerToken
      saml {
        id
        scimAuthenticationType
      }
    }
  }
`

test('SCIM credentials are scoped to one identity provider', async () => {
  const {orgId, cookie, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs()
  const res = await sendPublic({
    query: UPDATE_SCIM,
    variables: {samlId: subsidiarySlug, authenticationType: 'bearerToken'},
    cookie
  })
  expect(res.data.updateSCIM).toMatchObject({
    scimBearerToken: expect.any(String),
    saml: {id: subsidiarySlug, scimAuthenticationType: 'bearerToken'}
  })
  const {samls} = (await querySAMLs(orgId, cookie)).data.viewer.organization
  expect(samls.find(({id}: {id: string}) => id === parentSlug).scimAuthenticationType).toBeNull()
})

test("an org admin cannot change another org's identity provider", async () => {
  const {subsidiarySlug} = await setupOrgWithTwoIdPs()
  const {cookie: outsiderCookie} = await createOrgAdmin(getTestEmail(getTestDomain()))
  const res = await sendPublic({
    query: UPDATE_SCIM,
    variables: {samlId: subsidiarySlug, authenticationType: 'bearerToken'},
    cookie: outsiderCookie
  })
  expect(res.errors).toMatchObject([{message: 'Viewer is not on Organization'}])
  const row = await getKysely()
    .selectFrom('SAML')
    .select('scimAuthenticationType')
    .where('id', '=', subsidiarySlug)
    .executeTakeFirstOrThrow()
  expect(row.scimAuthenticationType).toBeNull()
})

test('an orphan identity provider is not editable', async () => {
  const {cookie, subsidiarySlug} = await setupOrgWithTwoIdPs()
  await getKysely()
    .updateTable('SAML')
    .set({orgId: null})
    .where('id', '=', subsidiarySlug)
    .execute()
  const res = await sendPublic({
    query: UPDATE_SCIM,
    variables: {samlId: subsidiarySlug, authenticationType: 'bearerToken'},
    cookie
  })
  expect(res.errors).toMatchObject([{message: 'Organization not found'}])
  const row = await getKysely()
    .selectFrom('SAML')
    .select('scimAuthenticationType')
    .where('id', '=', subsidiarySlug)
    .executeTakeFirstOrThrow()
  expect(row.scimAuthenticationType).toBeNull()
})

test('per-IdP metadata files are publicly fetchable by the metadata fetcher', async () => {
  const res = await fetch(
    `${PROTOCOL}://${HOST}/assets/Organization/someOrg/idpMetadata/someSlug.xml`,
    {redirect: 'manual'}
  )
  expect(res.status).toBe(307)
})

const DISCONNECT_SAML = `
  mutation DisconnectSAML($samlId: ID!) {
    disconnectSAML(samlId: $samlId) {
      saml {
        id
        domains
        metadataURL
        scimAuthenticationType
      }
    }
  }
`

test('disconnecting one identity provider leaves its domains and its sibling intact', async () => {
  const {cookie, parentSlug, subsidiarySlug, subsidiaryDomain} = await setupOrgWithTwoIdPs()
  const pg = getKysely()
  await pg
    .updateTable('SAML')
    .set({
      metadata: '<EntityDescriptor/>',
      metadataURL: 'https://idp.example.com/metadata',
      scimAuthenticationType: 'bearerToken',
      scimBearerToken: 'token'
    })
    .where('id', 'in', [parentSlug, subsidiarySlug])
    .execute()

  const res = await sendPublic({
    query: DISCONNECT_SAML,
    variables: {samlId: subsidiarySlug},
    cookie
  })
  expect(res.data.disconnectSAML.saml).toEqual({
    id: subsidiarySlug,
    domains: [subsidiaryDomain],
    metadataURL: null,
    scimAuthenticationType: null
  })

  const rows = await pg
    .selectFrom('SAML')
    .select(['id', 'metadata', 'metadataURL', 'scimBearerToken'])
    .where('id', 'in', [parentSlug, subsidiarySlug])
    .execute()
  expect(rows.find(({id}) => id === parentSlug)).toMatchObject({
    metadataURL: 'https://idp.example.com/metadata',
    scimBearerToken: 'token'
  })
  expect(rows.find(({id}) => id === subsidiarySlug)).toMatchObject({
    metadata: null,
    metadataURL: null,
    scimBearerToken: null
  })
})

test("an org admin cannot disconnect another org's identity provider", async () => {
  const {subsidiarySlug} = await setupOrgWithTwoIdPs()
  await getKysely()
    .updateTable('SAML')
    .set({metadataURL: 'https://idp.example.com/metadata'})
    .where('id', '=', subsidiarySlug)
    .execute()
  const {cookie: outsiderCookie} = await createOrgAdmin(getTestEmail(getTestDomain()))
  const res = await sendPublic({
    query: DISCONNECT_SAML,
    variables: {samlId: subsidiarySlug},
    cookie: outsiderCookie
  })
  expect(res.errors).toMatchObject([{message: 'Viewer is not on Organization'}])
  const row = await getKysely()
    .selectFrom('SAML')
    .select('metadataURL')
    .where('id', '=', subsidiarySlug)
    .executeTakeFirstOrThrow()
  expect(row.metadataURL).toBe('https://idp.example.com/metadata')
})

test('downgrading to Starter disconnects every identity provider and revokes its SCIM credentials', async () => {
  const {orgId, cookie, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs()
  const pg = getKysely()
  await pg
    .updateTable('SAML')
    .set({
      metadata: '<EntityDescriptor/>',
      metadataURL: 'https://idp.example.com/metadata',
      scimAuthenticationType: 'bearerToken',
      scimBearerToken: 'token'
    })
    .where('id', 'in', [parentSlug, subsidiarySlug])
    .execute()

  const res = await sendPublic({
    query: `
      mutation DowngradeToStarter($orgId: ID!) {
        downgradeToStarter(orgId: $orgId) {
          error {
            message
          }
          organization {
            billingTier
          }
        }
      }
    `,
    variables: {orgId},
    cookie
  })
  expect(res.data.downgradeToStarter).toEqual({error: null, organization: {billingTier: 'starter'}})

  const rows = await pg
    .selectFrom('SAML')
    .select(['metadata', 'metadataURL', 'scimAuthenticationType', 'scimBearerToken'])
    .where('id', 'in', [parentSlug, subsidiarySlug])
    .execute()
  expect(rows).toEqual([
    {metadata: null, metadataURL: null, scimAuthenticationType: null, scimBearerToken: null},
    {metadata: null, metadataURL: null, scimAuthenticationType: null, scimBearerToken: null}
  ])
})

const scimRequest = (token: string, path: string, init: RequestInit = {}) =>
  fetch(`${PROTOCOL}://${HOST}/scim${path}`, {
    ...init,
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/scim+json'}
  })

const enableSCIM = async (samlId: string, cookie: string) => {
  const res = await sendPublic({
    query: UPDATE_SCIM,
    variables: {samlId, authenticationType: 'bearerToken'},
    cookie
  })
  return res.data.updateSCIM.scimBearerToken as string
}

const provisionUser = async (token: string, email: string) => {
  const created = await scimRequest(token, '/Users', {
    method: 'POST',
    body: JSON.stringify({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: email,
      emails: [{value: email, primary: true}],
      active: true
    })
  })
  expect(created.status).toBe(201)
  const {id} = await created.json()
  return id as string
}

const listUsersByUserName = async (token: string, userName: string) => {
  const res = await scimRequest(
    token,
    `/Users?filter=${encodeURIComponent(`userName eq "${userName}"`)}`
  )
  return res.json()
}

test("an identity provider's SCIM client cannot see or remove a sibling's people", async () => {
  const {cookie, parentSlug, subsidiarySlug, subsidiaryDomain} = await setupOrgWithTwoIdPs()
  const parentToken = await enableSCIM(parentSlug, cookie)
  const subsidiaryToken = await enableSCIM(subsidiarySlug, cookie)

  const email = getTestEmail(subsidiaryDomain)
  const userId = await provisionUser(subsidiaryToken, email)

  expect((await scimRequest(parentToken, `/Users/${userId}`)).status).toBe(404)
  expect((await listUsersByUserName(parentToken, email)).totalResults).toBe(0)
  expect((await scimRequest(parentToken, `/Users/${userId}`, {method: 'DELETE'})).status).toBe(404)
  expect((await scimRequest(subsidiaryToken, `/Users/${userId}`)).status).toBe(200)
  expect((await listUsersByUserName(subsidiaryToken, email)).totalResults).toBe(1)
})

test('an identity provider keeps managing a user it provisioned at a sibling domain', async () => {
  const {cookie, parentSlug, subsidiarySlug, subsidiaryDomain} = await setupOrgWithTwoIdPs()
  const parentToken = await enableSCIM(parentSlug, cookie)
  await enableSCIM(subsidiarySlug, cookie)

  const email = getTestEmail(subsidiaryDomain)
  const userId = await provisionUser(parentToken, email)

  expect((await scimRequest(parentToken, `/Users/${userId}`)).status).toBe(200)
  expect((await listUsersByUserName(parentToken, email)).totalResults).toBe(1)
})

test("an identity provider's SCIM client still sees org members no identity provider owns", async () => {
  const {cookie, adminId, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs(getTestDomain())
  const parentToken = await enableSCIM(parentSlug, cookie)
  await enableSCIM(subsidiarySlug, cookie)

  expect((await scimRequest(parentToken, `/Users/${adminId}`)).status).toBe(200)
  const listed = await (await scimRequest(parentToken, '/Users')).json()
  expect(listed.Resources.map(({id}: {id: string}) => id)).toEqual([adminId])
})

const GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group'

test("an identity provider's SCIM client cannot see or remove a sibling's people through Groups", async () => {
  const {cookie, parentSlug, parentDomain, subsidiarySlug, subsidiaryDomain} =
    await setupOrgWithTwoIdPs()
  const parentToken = await enableSCIM(parentSlug, cookie)
  const subsidiaryToken = await enableSCIM(subsidiarySlug, cookie)
  const parentUserId = await provisionUser(parentToken, getTestEmail(parentDomain))
  const subsidiaryUserId = await provisionUser(subsidiaryToken, getTestEmail(subsidiaryDomain))

  const displayName = `Shared ${subsidiarySlug}`
  const created = await scimRequest(subsidiaryToken, '/Groups', {
    method: 'POST',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: subsidiaryUserId}]
    })
  })
  expect(created.status).toBe(201)
  const {id: teamId} = await created.json()

  const replaced = await scimRequest(parentToken, `/Groups/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: parentUserId}]
    })
  })
  expect(replaced.status).toBe(200)
  const memberIds = async (token: string) => {
    const group = await (await scimRequest(token, `/Groups/${teamId}`)).json()
    return group.members.map(({value}: {value: string}) => value)
  }
  expect(await memberIds(parentToken)).toEqual([parentUserId])
  expect(await memberIds(subsidiaryToken)).toEqual([subsidiaryUserId])
})

const teamMemberIds = async (teamId: string) => {
  const teamMembers = await getKysely()
    .selectFrom('TeamMember')
    .select('userId')
    .where('teamId', '=', teamId)
    .where('isNotRemoved', '=', true)
    .execute()
  return teamMembers.map(({userId}) => userId).sort()
}

const setupSiblingGroup = async () => {
  const idps = await setupOrgWithTwoIdPs()
  const {cookie, parentSlug, parentDomain, subsidiarySlug, subsidiaryDomain} = idps
  const parentToken = await enableSCIM(parentSlug, cookie)
  const subsidiaryToken = await enableSCIM(subsidiarySlug, cookie)
  const parentUserId = await provisionUser(parentToken, getTestEmail(parentDomain))
  const subsidiaryUserId = await provisionUser(subsidiaryToken, getTestEmail(subsidiaryDomain))
  const displayName = `Shared ${subsidiarySlug}`
  const created = await scimRequest(subsidiaryToken, '/Groups', {
    method: 'POST',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: subsidiaryUserId}]
    })
  })
  expect(created.status).toBe(201)
  const {id: teamId} = await created.json()
  return {
    ...idps,
    parentToken,
    subsidiaryToken,
    parentUserId,
    subsidiaryUserId,
    displayName,
    teamId
  }
}

test("a Group PATCH from one identity provider keeps a sibling's people on the team", async () => {
  const {parentToken, parentUserId, subsidiaryUserId, teamId} = await setupSiblingGroup()
  const patched = await scimRequest(parentToken, `/Groups/${teamId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'],
      Operations: [{op: 'add', path: 'members', value: [{value: parentUserId}]}]
    })
  })
  expect(patched.status).toBeLessThan(300)
  expect(await teamMemberIds(teamId)).toEqual([parentUserId, subsidiaryUserId].sort())
})

test("an identity provider's SCIM client cannot add a sibling's people to a Group", async () => {
  const {parentToken, parentUserId, subsidiaryUserId, subsidiarySlug} = await setupSiblingGroup()
  const displayName = `Parent ${subsidiarySlug}`
  const created = await scimRequest(parentToken, '/Groups', {
    method: 'POST',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: subsidiaryUserId}, {value: parentUserId}]
    })
  })
  expect(created.status).toBe(201)
  const {id: parentTeamId} = await created.json()
  expect(await teamMemberIds(parentTeamId)).toEqual([parentUserId])

  const replaced = await scimRequest(parentToken, `/Groups/${parentTeamId}`, {
    method: 'PUT',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: parentUserId}, {value: subsidiaryUserId}]
    })
  })
  expect(replaced.status).toBe(200)
  expect(await teamMemberIds(parentTeamId)).toEqual([parentUserId])
})

test("a SCIM client cannot pull another organization's user into a Group", async () => {
  const {parentToken, parentUserId, teamId, displayName} = await setupSiblingGroup()
  const {userId: outsiderId} = await createOrgAdmin(getTestEmail(getTestDomain()))
  const before = await teamMemberIds(teamId)
  const replaced = await scimRequest(parentToken, `/Groups/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify({
      schemas: [GROUP_SCHEMA],
      displayName,
      members: [{value: parentUserId}, {value: outsiderId}]
    })
  })
  expect(replaced.status).toBe(200)
  expect(await teamMemberIds(teamId)).toEqual([...before, parentUserId].sort())
})

test("a sibling's SSO-only users are hidden even though SCIM never provisioned them", async () => {
  const {cookie, adminId, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs()
  const parentToken = await enableSCIM(parentSlug, cookie)
  const subsidiaryToken = await enableSCIM(subsidiarySlug, cookie)
  expect((await scimRequest(parentToken, `/Users/${adminId}`)).status).toBe(200)
  expect((await scimRequest(subsidiaryToken, `/Users/${adminId}`)).status).toBe(404)
  const listed = await (await scimRequest(subsidiaryToken, '/Users')).json()
  expect(listed.totalResults).toBe(0)
})

test('disconnecting an identity provider revokes the SCIM token it already issued', async () => {
  const {cookie, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs()
  const parentToken = await enableSCIM(parentSlug, cookie)
  const subsidiaryToken = await enableSCIM(subsidiarySlug, cookie)
  expect((await scimRequest(subsidiaryToken, '/Users')).status).toBe(200)

  const res = await sendPublic({
    query: DISCONNECT_SAML,
    variables: {samlId: subsidiarySlug},
    cookie
  })
  expect(res.errors).toBeUndefined()
  expect((await scimRequest(subsidiaryToken, '/Users')).status).toBe(401)
  expect((await scimRequest(parentToken, '/Users')).status).toBe(200)
})

test('an orphan identity provider cannot be disconnected', async () => {
  const {cookie, subsidiarySlug} = await setupOrgWithTwoIdPs()
  await getKysely()
    .updateTable('SAML')
    .set({orgId: null, metadataURL: 'https://idp.example.com/metadata'})
    .where('id', '=', subsidiarySlug)
    .execute()
  const res = await sendPublic({
    query: DISCONNECT_SAML,
    variables: {samlId: subsidiarySlug},
    cookie
  })
  expect(res.errors).toMatchObject([{message: 'Organization not found'}])
  const row = await getKysely()
    .selectFrom('SAML')
    .select('metadataURL')
    .where('id', '=', subsidiarySlug)
    .executeTakeFirstOrThrow()
  expect(row.metadataURL).toBe('https://idp.example.com/metadata')
})

const UPLOAD_IDP_METADATA = `
  mutation UploadIdPMetadata($file: File!, $samlId: ID!) {
    uploadIdPMetadata(file: $file, samlId: $samlId) {
      url
    }
  }
`

const uploadMetadata = (samlId: string, cookie: string, type = 'text/xml') =>
  sendPublic({
    query: UPLOAD_IDP_METADATA,
    variables: {file: null, samlId},
    uploadables: {
      file: new File([`<EntityDescriptor entityID="${samlId}"/>`], 'metadata.xml', {type})
    },
    cookie
  })

test('each identity provider uploads its metadata file to its own URL', async () => {
  const {orgId, cookie, parentSlug, subsidiarySlug} = await setupOrgWithTwoIdPs()
  const parentUpload = await uploadMetadata(parentSlug, cookie)
  const subsidiaryUpload = await uploadMetadata(subsidiarySlug, cookie)
  const assetURL = (slug: string) =>
    `${PROTOCOL}://${HOST}/assets/Organization/${orgId}/idpMetadata/${slug}.xml`
  expect(parentUpload.data.uploadIdPMetadata.url).toBe(assetURL(parentSlug))
  expect(subsidiaryUpload.data.uploadIdPMetadata.url).toBe(assetURL(subsidiarySlug))
  const fetched = await fetch(assetURL(subsidiarySlug), {redirect: 'manual'})
  expect(fetched.status).toBe(307)
})

test("an org admin cannot upload metadata for another org's identity provider", async () => {
  const {subsidiarySlug} = await setupOrgWithTwoIdPs()
  const {cookie: outsiderCookie} = await createOrgAdmin(getTestEmail(getTestDomain()))
  const res = await uploadMetadata(subsidiarySlug, outsiderCookie)
  expect(res.errors).toMatchObject([{message: 'Viewer is not on Organization'}])
})

test('a metadata file that is not XML is rejected with a GraphQL error', async () => {
  const {cookie, parentSlug} = await setupOrgWithTwoIdPs()
  const res = await uploadMetadata(parentSlug, cookie, 'text/plain')
  expect(res.errors).toMatchObject([{message: 'file must be XML'}])
})
