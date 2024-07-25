import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import PokerMeeting from './PokerMeeting'
import Team from './Team'
import makeMutationPayload from './makeMutationPayload'
export const UpdateGitHubDimensionFieldSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateGitHubDimensionFieldSuccess',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _auth, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    meeting: {
      type: new GraphQLNonNull(PokerMeeting),
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
