import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'
import Team from './Team'
export const UpdateGitHubDimensionFieldSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateGitHubDimensionFieldSuccess',
  fields: () => ({
    teamId: {
      type: GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    },
    team: {
      type: GraphQLNonNull(Team),
      resolve: ({teamId}, _auth, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    meeting: {
      type: GraphQLNonNull(PokerMeeting),
      description: 'The poker meeting the field was updated from',
      resolve: ({meetingId}, _auth, {dataLoader}) => {
        if (!meetingId) return null
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const UpdateGitHubDimensionFieldPayload = makeMutationPayload(
  'UpdateGitHubDimensionFieldPayload',
  UpdateGitHubDimensionFieldSuccess
)

export default UpdateGitHubDimensionFieldPayload
