import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import PokerMeeting from './PokerMeeting'
import Team from './Team'

export const UpdateAzureDevOpsDimensionFieldSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateAzureDevOpsDimensionFieldSuccess',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: GraphQLID
    },
    team: {
      type: new GraphQLNonNull(Team),
      resolve: ({teamId}, _auth, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    meeting: {
      type: PokerMeeting,
      description: 'The poker meeting the field was updated from',
      resolve: ({meetingId}, _auth, {dataLoader}) => {
        if (!meetingId) return null
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const UpdateAzureDevOpsDimensionFieldPayload = makeMutationPayload(
  'UpdateAzureDevOpsDimensionFieldPayload',
  UpdateAzureDevOpsDimensionFieldSuccess
)

export default UpdateAzureDevOpsDimensionFieldPayload
