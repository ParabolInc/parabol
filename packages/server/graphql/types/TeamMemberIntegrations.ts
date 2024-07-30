import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'

const TeamMemberIntegrations = new GraphQLObjectType<{teamId: string; userId: string}, GQLContext>({
  name: 'TeamMemberIntegrations',
  fields: {}
})

export default TeamMemberIntegrations
