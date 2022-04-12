import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'
import Team from './Team'

export const UpdateGitLabDimensionFieldSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateGitLabDimensionFieldSuccess',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}: {teamId: string}, _auth, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
      description: 'The poker meeting the field was updated from',
      resolve: ({meetingId}: {meetingId: string}, _auth, {dataLoader}) => {
        if (!meetingId) return null
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const UpdateGitLabDimensionFieldPayload = makeMutationPayload(
  'UpdateGitLabDimensionFieldPayload',
  UpdateGitLabDimensionFieldSuccess
)

export default UpdateGitLabDimensionFieldPayload
