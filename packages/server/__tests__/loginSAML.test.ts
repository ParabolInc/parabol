import base64url from 'base64url'
import faker from 'faker'
import * as samlify from 'samlify'
import getKysely from '../postgres/getKysely'
import {samlXMLValidator} from '../utils/samlXMLValidator'
import {sendIntranet} from './common'

// Test-only RSA key pair (self-signed cert valid for 100 years, no real security value)
const TEST_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCiq6o+TKgQFAvR
VH45z/rwFhy6EdKOAhTPU13RsaLq8iEsFxlrPLGOHH/NTRwMQftdTK9ZzXkUhPGO
opVCITPEG+1vdZGeJxwLNWBMfMc/kD5BUfwY48/nXnWykB2iGb2NuOBl86gBSmWV
nnnYJODrYyNMgGRK8OxfqlMs/QiMrTfLaay+K/ego3MOd5s4dQ1DjmqtUTcHMDxr
SUQsWPcejzqOKr6XqezphS2miL+xRaKnsF8wYI7Z/AKN9WSdFs+V97gesYx7rqZK
pSVAPNoB6/tGpW9TSiwbmiVr12wHSRPmz/99Bo4jLt0g3rzDSwflqCXCx4fMUnNr
YFc6naUFAgMBAAECggEADjlJdRIZ3fIKyH6FXQPBEu40C9cUHKO08x38haHtN3L9
kI/igpx3gBAg4rA75Bx+4L0cVhNf43nub0TrHTGvB5ZTkBvtJDGSQ66ioX2FpJq1
vttu2jRNURNS4k60sKBkkThZssB378j0Ef2d9NbgreRoyT8uxdjEKmdHx5bGgRpe
priZP17nS9uKz8lL81DFKWsC3xOeAnUnfckp9XYs+zu1xbVcAEbsfsarxw9g/nmb
PUtOxwlZoTqUCre0LBzDXyBCMI33UwiU/LeGiBEtsZm+tJab/n3SBJRTtnKiXkAC
cM2rtZshoMQSXMU6XQpyFbj8FsAfTHjbRccg6nwKoQKBgQDN1NmxaYCBZUm9GNGH
RIVQFNOqVSqEHOIp7NH51vNDvanrIBr/FLe75PwKRaand+OZY7jQsTs8GceAtLXL
/Rp8bAQUVVyNbPo8fYo7r8vBdi1E4W7b9LdcmEQvnRwowgfmCiHqZQUHlvRWv+fw
WlyvcOCQFS7e6fd6sI4hFdDUdQKBgQDKUbq2jsK08P/A7zu5A/bdijZqkVsTDHkB
aL9y9VJK78CQ+B5HpakYCVSlDfZw3MVV0UnollNUSds87Uu1InqjoBWTzUGdEROc
bMn/fqFPGg3nixq33Ortmtz41UK4YvfACo3wfnidLeobe5XUSF9uIzQD2qmFix+5
VRrGRuM8UQKBgHKsQxw0SwPMCmjvisxxwFP9Rm9/Q1CXRulUpycqOh1jbWcxW9kB
Edv8lu6iH1bt1D+A71ZVZ0r0kdGC3EXpnPf0tdEePZINRNyulHTsW/hMfqwBbGHe
1Mkhi9t7DFUoxH3E52BPJ54y2634/J9LuJeFq5aaNqK6dsZD1utX3CCBAoGAeA6r
x61LqWfhvLG6NP4/PhPIWtDKxLEAFW/9O9CL9t/y25QBE+8gOp0+13tDpJG9oEFD
pHugE0KIkM0XwfMl53cVltGUgAokIw0DiVOxkWkamy4WusijuD/PpPGYWCaScilR
NUc3d75JT+m0bXZM+uR091yIgDCgsK/p5YMnUSECgYBBr3T2VdOCb0ItCePs4VJj
Mt6aXmJORyWTCfjzqdDKT//PH/7Q0zeBGUGXZxtR8ydIAwxu4hC2gWJhbDcfjQ1D
OwIJqVR76iMNitz1lerViRdbPFHUpKYCWnd1HXLoo0Baz5PA9SCmXf/9qQj5AQHd
8LTc47+kYGiFLoKMa+mbgA==
-----END PRIVATE KEY-----`

// Certificate body without PEM headers (base64 DER), valid until 2126
const TEST_CERT_BODY =
  'MIIDcTCCAlmgAwIBAgIUZcc/FbjGK0g9OtHpz7joaCZi590wDQYJKoZIhvcNAQEL' +
  'BQAwRzELMAkGA1UEBhMCVVMxCzAJBgNVBAgMAkNBMRAwDgYDVQQKDAdUZXN0IENv' +
  'MRkwFwYDVQQDDBB0ZXN0LmV4YW1wbGUuY29tMCAXDTI2MDIyNDE0MTgwM1oYDzIx' +
  'MjYwMTMxMTQxODAzWjBHMQswCQYDVQQGEwJVUzELMAkGA1UECAwCQ0ExEDAOBgNV' +
  'BAoMB1Rlc3QgQ28xGTAXBgNVBAMMEHRlc3QuZXhhbXBsZS5jb20wggEiMA0GCSqG' +
  'SIb3DQEBAQUAA4IBDwAwggEKAoIBAQCiq6o+TKgQFAvRVH45z/rwFhy6EdKOAhTP' +
  'U13RsaLq8iEsFxlrPLGOHH/NTRwMQftdTK9ZzXkUhPGOopVCITPEG+1vdZGeJxwL' +
  'NWBMfMc/kD5BUfwY48/nXnWykB2iGb2NuOBl86gBSmWVnnnYJODrYyNMgGRK8Oxf' +
  'qlMs/QiMrTfLaay+K/ego3MOd5s4dQ1DjmqtUTcHMDxrSUQsWPcejzqOKr6Xqezp' +
  'hS2miL+xRaKnsF8wYI7Z/AKN9WSdFs+V97gesYx7rqZKpSVAPNoB6/tGpW9TSiwb' +
  'miVr12wHSRPmz/99Bo4jLt0g3rzDSwflqCXCx4fMUnNrYFc6naUFAgMBAAGjUzBR' +
  'MB0GA1UdDgQWBBSD6zML1wCzONVM+eZoimgv3Z+/hjAfBgNVHSMEGDAWgBSD6zML' +
  '1wCzONVM+eZoimgv3Z+/hjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUA' +
  'A4IBAQAcAhABnN/gk1yz+0nsz7mSaxTHzFpVnWLL31r6S20sKei658dyb1TQaMU5' +
  'XLGdSbEn0DAuttNpBUsvoLqfsJ9q/6TClums7qE3uslTOeQ7dCv9/uBz24DRvv9V' +
  'PzODzZNOWvIfZ4SQgFIPXA6sh9/o3RMmtd0EWTP06CQsK1Gsjjy25nHNXQXSerb6' +
  'zV7nYc8St0ugugF+C/sUmWjHGWCzmAZN6zU+0kbUolVv4CedCdE/SaUDGfzmrR9g' +
  'S6n0/f+ugfxl5Raj4r0iItfRQ8ejUDPJD27JEl29dv79TI5l66UKsG+0fXyhDeNO' +
  '/DZm+gLCReSuCNzPAYXXA622bf5b'

const IDP_ENTITY_ID = 'https://idp.example.com/metadata'

const buildIdpMetadata = (certBody: string) => `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor entityID="${IDP_ENTITY_ID}" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <KeyInfo xmlns="http://www.w3.org/2000/09/xmldsig#">
        <X509Data>
          <X509Certificate>${certBody}</X509Certificate>
        </X509Data>
      </KeyInfo>
    </KeyDescriptor>
    <NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://idp.example.com/sso/saml"/>
  </IDPSSODescriptor>
</EntityDescriptor>`

test('SAML', async () => {
  const companyName = faker.company.companyName()
  const samlName = faker.helpers.slugify(companyName).toLowerCase()
  const orgId = `${samlName}-orgId`
  const domain = 'example.com'
  const testEmail = `test@${domain}`

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

  // Store metadata directly in DB so loginSAML uses it without fetching from a URL
  const idpMetadata = buildIdpMetadata(TEST_CERT_BODY)
  const pg = getKysely()
  // Clear orgId so loginSAML doesn't try to add user to a non-existent org
  await pg
    .updateTable('SAML')
    .set({metadata: idpMetadata, metadataURL: null, orgId: null})
    .where('id', '=', samlName)
    .execute()

  // Build a signed SAML response dynamically with fresh timestamps
  samlify.setSchemaValidator(samlXMLValidator)
  const idp = samlify.IdentityProvider({
    metadata: idpMetadata,
    privateKey: TEST_PRIVATE_KEY,
    loginResponseTemplate: {
      context: samlify.SamlLib.defaultLoginResponseTemplate.context,
      attributes: [
        {
          name: 'email',
          nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
          valueTag: 'email',
          valueXsiType: 'xs:string'
        }
      ]
    }
  })
  const sp = samlify.ServiceProvider({})

  const now = new Date().toISOString()
  const fiveMinutesLater = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  const id = `_test${Date.now()}`
  const {context: samlResponseBase64} = await idp.createLoginResponse(
    sp,
    {},
    'post',
    {email: testEmail},
    (template: string) => ({
      id,
      context: samlify.SamlLib.replaceTagsByValue(template, {
        ID: id,
        AssertionID: `_assertion${Date.now()}`,
        Destination: '',
        Audience: '',
        EntityID: '',
        SubjectRecipient: '',
        Issuer: IDP_ENTITY_ID,
        IssueInstant: now,
        AssertionConsumerServiceURL: '',
        StatusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
        ConditionsNotBefore: now,
        ConditionsNotOnOrAfter: fiveMinutesLater,
        SubjectConfirmationDataNotOnOrAfter: fiveMinutesLater,
        NameIDFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        NameID: testEmail,
        InResponseTo: '',
        AuthnStatement: '',
        attrEmail: testEmail
      })
    })
  )

  // samlify returns standard base64; convert to base64url to avoid URL encoding issues
  const samlResponse = Buffer.from(samlResponseBase64, 'base64').toString('base64url')
  const relayState = base64url.encode(JSON.stringify({}))

  const saml = await sendIntranet({
    query: `
      mutation loginSAML($queryString: String!, $samlName: ID!) {
        loginSAML(queryString: $queryString, samlName: $samlName) {
          error {
            title
            message
          }
          authToken
        }
      }
    `,
    variables: {
      queryString: `SAMLResponse=${samlResponse}&RelayState=${relayState}`,
      samlName
    }
  })

  expect(saml).toMatchObject({
    data: {
      loginSAML: {
        error: null,
        authToken: expect.anything()
      }
    }
  })
})
