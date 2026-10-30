import faker from 'faker'
import {
  createOrgAdmin,
  getTestDomain,
  getTestEmail,
  sendIntranet,
  sendPublic,
  signUp
} from './common'

const REQUEST_SAML_METADATA_CHANGE = `
  mutation RequestSAMLMetadataChange($samlId: ID!, $metadataURL: String!) {
    requestSAMLMetadataChange(samlId: $samlId, metadataURL: $metadataURL) {
      signOnURL
    }
  }
`

// The private-IP guard refuses loopback before any request is made, so the resolver only gets as
// far as the fetch: a permission denial and a fetch failure are distinguishable
const UNREACHABLE_METADATA_URL = 'https://127.0.0.1/metadata'

const createSAMLForOrg = async (orgId: string, domain: string) => {
  const samlName = faker.helpers
    .slugify(`${faker.company.companyName()} ${Date.now()}`)
    .toLowerCase()
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
    variables: {slug: samlName, addDomains: [domain], orgId}
  })
  expect(verifyDomain).toMatchObject({data: {verifyDomain: {saml: {id: samlName}}}})
  return samlName
}

describe('requestSAMLMetadataChange', () => {
  const domain = getTestDomain()
  let samlName: string
  let adminCookie: string

  beforeAll(async () => {
    const admin = await createOrgAdmin(getTestEmail(domain))
    adminCookie = admin.cookie
    samlName = await createSAMLForOrg(admin.orgId, domain)
  })

  test('lets an org admin of the SSO connection request a metadata change', async () => {
    const res = await sendPublic({
      query: REQUEST_SAML_METADATA_CHANGE,
      variables: {samlId: samlName, metadataURL: UNREACHABLE_METADATA_URL},
      cookie: adminCookie
    })

    expect(res.errors).toMatchObject([{message: 'Metadata URL could not be fetched'}])
  })

  test('refuses a user outside the organization', async () => {
    const outsider = await signUp()
    const res = await sendPublic({
      query: REQUEST_SAML_METADATA_CHANGE,
      variables: {samlId: samlName, metadataURL: UNREACHABLE_METADATA_URL},
      cookie: outsider.cookie
    })

    expect(res.errors).toMatchObject([{message: 'Viewer is not on Organization'}])
  })
})
