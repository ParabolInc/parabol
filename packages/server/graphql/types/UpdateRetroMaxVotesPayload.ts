import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import makeMutationPayload from './makeMutationPayload'

export const UpdateRetroMaxVotesSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateRetroMaxVotesSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'the meeting with the updated max votes',
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const UpdateRetroMaxVotesPayload = makeMutationPayload(
  'UpdateRetroMaxVotesPayload',
  UpdateRetroMaxVotesSuccess
)

export default UpdateRetroMaxVotesPayload
