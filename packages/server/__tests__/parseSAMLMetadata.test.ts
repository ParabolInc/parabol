import faker from 'faker'
import {
  createOrgAdmin,
  getTestDomain,
  getTestEmail,
  sendIntranet,
  sendPublic,
  signUp
} from './common'

const PARSE_SAML_METADATA = `
  query ParseSAMLMetadata($metadataURL: String!, $domain: String!) {
    viewer {
      parseSAMLMetadata(metadataURL: $metadataURL, domain: $domain) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ... on ParseSAMLMetadataSuccess {
          url
        }
      }
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

describe('parseSAMLMetadata', () => {
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
      query: PARSE_SAML_METADATA,
      variables: {metadataURL: UNREACHABLE_METADATA_URL, domain: samlName},
      cookie: adminCookie
    })

    expect(res.errors).toBeUndefined()
    expect(res).toMatchObject({
      data: {
        viewer: {
          parseSAMLMetadata: {error: {message: 'Metadata URL could not be fetched'}}
        }
      }
    })
  })

  test('refuses a user outside the organization', async () => {
    const outsider = await signUp()
    const res = await sendPublic({
      query: PARSE_SAML_METADATA,
      variables: {metadataURL: UNREACHABLE_METADATA_URL, domain: samlName},
      cookie: outsider.cookie
    })

    expect(res.errors).toMatchObject([{message: 'Viewer is not on Organization'}])
  })
})
