import {GraphQLObjectType} from 'graphql'
import {resolveTeam} from 'server/graphql/resolvers'
import Team from 'server/graphql/types/Team'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const KillMeetingPayload = new GraphQLObjectType({
  name: 'KillMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
})

export default KillMeetingPayload
