import faker from 'faker'
import {sendIntranet} from './common'

test('SAML', async () => {
  const companyName = faker.company.companyName()
  const samlName = faker.helpers.slugify(companyName)
  const domain = 'example.com'

  const metadata = `
    <?xml version="1.0"?>
    <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" validUntil="2021-09-12T09:22:28Z" cacheDuration="PT1631870548S" entityID="https://idp.example.com/metadata">
      <md:IDPSSODescriptor WantAuthnRequestsSigned="false" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:X509Data>
              <ds:X509Certificate>MIICUDCCAbmgAwIBAgIBADANBgkqhkiG9w0BAQ0FADBFMQswCQYDVQQGEwJ1czELMAkGA1UECAwCQ0ExEzARBgNVBAoMCkV4YW1wbGUgQ28xFDASBgNVBAMMC2V4YW1wbGUuY29tMB4XDTIxMDkxMDA3NTkzMFoXDTI2MDkwOTA3NTkzMFowRTELMAkGA1UEBhMCdXMxCzAJBgNVBAgMAkNBMRMwEQYDVQQKDApFeGFtcGxlIENvMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEArg9DZwR9v7Vok1IW+hIpYin9llPBh1MV5CxjfK596EwuadyQuko3jGv8qDlx4tG6JiGTjQfCuzJVAhYi2OKuKBqyJewKoen1uF0dRyws9n6zZl0GsVJkObdrNo5P6eib3VOsXPJ10RjxWsWx5WRur2dYdkOJFxC6zN1IbXSXYYMCAwEAAaNQME4wHQYDVR0OBBYEFKr/1y4R+kamPz623HnHM7tz6C4XMB8GA1UdIwQYMBaAFKr/1y4R+kamPz623HnHM7tz6C4XMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQENBQADgYEALKBl6QPk9HMB5V+GYu50XNFmzyuuXt3zAKMSYcyhxVSBCe6SKw1iqvvPza4rGp7DpeJI/8R3qBTuZqfl0rX624wvHGc4N9WubMLPejAn7dMu3oGfm9KUX+Um1RG0U6zsi9t3X90rroea/5SQvw/uAWUxS59U2r8massI/WFJKh8=</ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:KeyDescriptor use="encryption">
          <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
            <ds:X509Data>
              <ds:X509Certificate>MIICUDCCAbmgAwIBAgIBADANBgkqhkiG9w0BAQ0FADBFMQswCQYDVQQGEwJ1czELMAkGA1UECAwCQ0ExEzARBgNVBAoMCkV4YW1wbGUgQ28xFDASBgNVBAMMC2V4YW1wbGUuY29tMB4XDTIxMDkxMDA3NTkzMFoXDTI2MDkwOTA3NTkzMFowRTELMAkGA1UEBhMCdXMxCzAJBgNVBAgMAkNBMRMwEQYDVQQKDApFeGFtcGxlIENvMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEArg9DZwR9v7Vok1IW+hIpYin9llPBh1MV5CxjfK596EwuadyQuko3jGv8qDlx4tG6JiGTjQfCuzJVAhYi2OKuKBqyJewKoen1uF0dRyws9n6zZl0GsVJkObdrNo5P6eib3VOsXPJ10RjxWsWx5WRur2dYdkOJFxC6zN1IbXSXYYMCAwEAAaNQME4wHQYDVR0OBBYEFKr/1y4R+kamPz623HnHM7tz6C4XMB8GA1UdIwQYMBaAFKr/1y4R+kamPz623HnHM7tz6C4XMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQENBQADgYEALKBl6QPk9HMB5V+GYu50XNFmzyuuXt3zAKMSYcyhxVSBCe6SKw1iqvvPza4rGp7DpeJI/8R3qBTuZqfl0rX624wvHGc4N9WubMLPejAn7dMu3oGfm9KUX+Um1RG0U6zsi9t3X90rroea/5SQvw/uAWUxS59U2r8massI/WFJKh8=</ds:X509Certificate>
            </ds:X509Data>
          </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified</md:NameIDFormat>
        <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="https://idp.example.org/sso/SingleSignOnService"/>
      </md:IDPSSODescriptor>
    </md:EntityDescriptor>
  `

  const enableSaml = await sendIntranet({
    query: `
      mutation EnableSAMLForDomain($name: ID!, $domains: [ID!]!, $metadata: String!) {
        enableSAMLForDomain(name: $name, domains: $domains, metadata: $metadata) {
          ... on ErrorPayload {
            error {
              title
              message
            }
          }
          ... on EnableSAMLForDomainSuccess {
            success
          }
        }
      }
    `,
    variables: {
      name: samlName,
      domains: [domain],
      metadata
    },
    isPrivate: true
  })

  expect(enableSaml).toMatchObject({
    data: {
      enableSAMLForDomain: {
        success: true
      }
    }
  })

  const response = `
    <samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_8e8dc5f69a98cc4c1ff3427e5ce34606fd672f91e6" Version="2.0" IssueInstant="2021-09-09T12:00:00Z" Destination="http://sp.example.com/demo1/index.php?acs" InResponseTo="_41e758fee373d51639552c4b040b1090e97f6685">
    <saml:Issuer>https://idp.example.com/metadata</saml:Issuer>
    <samlp:Status>
        <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
    </samlp:Status>
    <saml:Assertion xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xs="http://www.w3.org/2001/XMLSchema" ID="pfx49466302-35d7-3ac2-955b-b982f937d50a" Version="2.0" IssueInstant="2021-09-09T12:00:00Z">
        <saml:Issuer>https://idp.example.com/metadata</saml:Issuer><ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
  <ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>
    <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
  <ds:Reference URI="#pfx49466302-35d7-3ac2-955b-b982f937d50a"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><ds:Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>BcG3bCJwBTsNi5jyWw1gWUKTYJQ=</ds:DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>RdY7WsYtE/L8seau3CSVsuswoUe0XCsdFJOfQGi8UY4FuBF6hEmzCHS+rsEkVy5SKzZTvL95fdcgR8ZRkaKE3ki42skwo2SgZMYrxuIq64qpnMsg86efzlMMUDSO5DX6B1rLRLGWHOO62Fg6TS1qA+r997ZwQyM/a1Gq08A2tBQ=</ds:SignatureValue>
<ds:KeyInfo><ds:X509Data><ds:X509Certificate>MIICUDCCAbmgAwIBAgIBADANBgkqhkiG9w0BAQ0FADBFMQswCQYDVQQGEwJ1czELMAkGA1UECAwCQ0ExEzARBgNVBAoMCkV4YW1wbGUgQ28xFDASBgNVBAMMC2V4YW1wbGUuY29tMB4XDTIxMDkxMDA3NTkzMFoXDTI2MDkwOTA3NTkzMFowRTELMAkGA1UEBhMCdXMxCzAJBgNVBAgMAkNBMRMwEQYDVQQKDApFeGFtcGxlIENvMRQwEgYDVQQDDAtleGFtcGxlLmNvbTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEArg9DZwR9v7Vok1IW+hIpYin9llPBh1MV5CxjfK596EwuadyQuko3jGv8qDlx4tG6JiGTjQfCuzJVAhYi2OKuKBqyJewKoen1uF0dRyws9n6zZl0GsVJkObdrNo5P6eib3VOsXPJ10RjxWsWx5WRur2dYdkOJFxC6zN1IbXSXYYMCAwEAAaNQME4wHQYDVR0OBBYEFKr/1y4R+kamPz623HnHM7tz6C4XMB8GA1UdIwQYMBaAFKr/1y4R+kamPz623HnHM7tz6C4XMAwGA1UdEwQFMAMBAf8wDQYJKoZIhvcNAQENBQADgYEALKBl6QPk9HMB5V+GYu50XNFmzyuuXt3zAKMSYcyhxVSBCe6SKw1iqvvPza4rGp7DpeJI/8R3qBTuZqfl0rX624wvHGc4N9WubMLPejAn7dMu3oGfm9KUX+Um1RG0U6zsi9t3X90rroea/5SQvw/uAWUxS59U2r8massI/WFJKh8=</ds:X509Certificate></ds:X509Data></ds:KeyInfo></ds:Signature>
        <saml:Subject>
            <saml:NameID SPNameQualifier="https://sp.example.com/metadata" Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">test@example.com</saml:NameID>
            <saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
                <saml:SubjectConfirmationData NotOnOrAfter="2024-01-18T06:21:48Z" Recipient="http://sp.example.com/demo1/index.php?acs" InResponseTo="_4fee3b046395c4e751011e97f8900b5273d56685"/>
            </saml:SubjectConfirmation>
        </saml:Subject>
        <saml:Conditions NotBefore="2021-09-09T12:00:00Z" NotOnOrAfter="2024-09-09T12:00:00Z">
            <saml:AudienceRestriction>
                <saml:Audience>https://sp.example.com/metadata</saml:Audience>
            </saml:AudienceRestriction>
        </saml:Conditions>
        <saml:AuthnStatement AuthnInstant="2021-09-09T12:00:00Z" SessionNotOnOrAfter="2024-09-09T12:00:00Z" SessionIndex="_be9967abd904ddcae3c0eb4189adbe3f71e327cf93">
            <saml:AuthnContext>
                <saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:Password</saml:AuthnContextClassRef>
            </saml:AuthnContext>
        </saml:AuthnStatement>
        <saml:AttributeStatement>
            <saml:Attribute Name="uid" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue xsi:type="xs:string">test</saml:AttributeValue>
            </saml:Attribute>
            <saml:Attribute Name="email" NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
                <saml:AttributeValue xsi:type="xs:string">test@example.com</saml:AttributeValue>
            </saml:Attribute>
        </saml:AttributeStatement>
    </saml:Assertion>
  </samlp:Response>
  `

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
      queryString: `SAMLResponse=${Buffer.from(response).toString('base64url')}`,
      samlName
    },
    isPrivate: true
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
