import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'

export const FlagReadyToAdvanceSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'FlagReadyToAdvanceSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(NewMeeting),
      description: 'the meeting with the updated readyCount',
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const FlagReadyToAdvancePayload = makeMutationPayload(
  'FlagReadyToAdvancePayload',
  FlagReadyToAdvanceSuccess
)

export default FlagReadyToAdvancePayload
