import {GraphQLID, GraphQLNonNull, GraphQLInputObjectType} from 'graphql'
import GraphQLURLType from './GraphQLURLType'

export type IntegrationTokenInputT = {
  providerId: string
  oauthCodeOrPat?: string
  teamId: string
  redirectUri?: string
}

export type IntegrationProviderTokenInputT = Partial<
  Omit<IntegrationTokenInputT, 'providerId' | 'teamId'>
>

const descriptions = {
  oauthCodeOrPat: 'The OAuth2 code to resolve to an access token, or the personal access token',
  teamId: 'The ID of the Parabol team to associate the token with',
  redirectUri: 'The redirect uri used to resolve to an OAuth2 access token'
}

// TODO: use union type instead

const IntegrationTokenInput = new GraphQLInputObjectType({
  name: 'IntegrationTokenInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    providerId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The Integration Provider id to associate with the token, leave null if calling AddIntegrationProvider'
    },
    oauthCodeOrPat: {
      type: GraphQLID,
      description: descriptions.oauthCodeOrPat
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: descriptions.teamId
    },
    redirectUri: {
      type: GraphQLURLType,
      description: descriptions.redirectUri
    }
  })
})

export const IntegrationProviderTokenInput = new GraphQLInputObjectType({
  name: 'IntegrationTokenInput',
  description: 'An Integration Provider configuration',
  fields: () => ({
    oauthCodeOrPat: {
      type: GraphQLID,
      description: descriptions.oauthCodeOrPat
    },
    redirectUri: {
      type: GraphQLURLType,
      description: descriptions.redirectUri
    }
  })
})

export default IntegrationTokenInput
