import {GraphQLID, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import StandardMutationError from './StandardMutationError'
import Team from './Team'
import User from './User'

const PushInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'PushInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    user: {
      type: User,
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    },
    meetingId: {
      type: GraphQLID
    },
    team: {
      type: Team,
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    }
  })
})

export default PushInvitationPayload
