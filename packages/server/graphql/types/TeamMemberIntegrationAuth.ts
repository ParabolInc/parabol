import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import IntegrationProviderId from 'parabol-client/shared/gqlIds/IntegrationProviderId'
import TeamMemberIntegrationAuthId from 'parabol-client/shared/gqlIds/TeamMemberIntegrationAuthId'
import {IGetTeamMemberIntegrationAuthQueryResult} from '../../postgres/queries/generated/getTeamMemberIntegrationAuthQuery'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProvider from './IntegrationProvider'
import IntegrationProviderServiceEnum from './IntegrationProviderServiceEnum'

export const teamMemberIntegrationAuthFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: "The token's unique identifier",
    resolve: ({service, teamId, userId}: IGetTeamMemberIntegrationAuthQueryResult) =>
      TeamMemberIntegrationAuthId.join(service, teamId, userId)
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The team that the token is linked to'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the token was created'
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The timestamp the token was updated at'
  },
  providerId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The GQL GUID of the DB providerId foreign key',
    resolve: ({providerId}: IGetTeamMemberIntegrationAuthQueryResult) =>
      IntegrationProviderId.join(providerId)
  },
  service: {
    type: new GraphQLNonNull(IntegrationProviderServiceEnum),
    description: 'The service this token is associated with, denormalized from the provider'
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'true if the token configuration should be used'
  },
  provider: {
    description: 'The provider to connect to',
    type: new GraphQLNonNull(IntegrationProvider),
    resolve: async (
      {providerId}: IGetTeamMemberIntegrationAuthQueryResult,
      _args: unknown,
      {dataLoader}: GQLContext
    ) => {
      return dataLoader.get('integrationProviders').load(providerId)
    }
  }
})

const TeamMemberIntegrationAuth = new GraphQLInterfaceType({
  name: 'TeamMemberIntegrationAuth',
  description: 'The auth credentials for a token, specific to a team member',
  fields: teamMemberIntegrationAuthFields
})

export default TeamMemberIntegrationAuth
