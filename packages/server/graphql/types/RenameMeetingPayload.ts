import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'

export const RenameMeetingSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RenameMeetingSuccess',
  fields: () => ({
    meeting: {
      type: GraphQLNonNull(NewMeeting),
      description: 'the renamed meeting',
      resolve: async ({meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const RenameMeetingPayload = makeMutationPayload('RenameMeetingPayload', RenameMeetingSuccess)

export default RenameMeetingPayload
