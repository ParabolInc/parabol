import {GraphQLObjectType} from 'graphql'
import {resolveTeam} from '../resolvers'
import Team from './Team'

const UpdateMeetingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateMeetingPayload',
  fields: () => ({
    team: {
      type: Team,
      resolve: resolveTeam
    }
  })
})

export default UpdateMeetingPayload
