import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment findIntegrationService_cloudProvider on IntegrationService {
    service
    cloudProvider {
      id
      ... on IntegrationProviderOAuth2 {
        clientId
        serverBaseUrl
        tenantId
      }
    }
  }
`

graphql`
  fragment findIntegrationService_auth on IntegrationService {
    service
    auth {
      providerId
    }
  }
`

graphql`
  fragment findIntegrationService_isAvailable on IntegrationService {
    service
    isAvailable
  }
`
