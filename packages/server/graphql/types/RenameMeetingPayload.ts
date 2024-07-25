import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import NewMeeting from './NewMeeting'
import makeMutationPayload from './makeMutationPayload'

export const RenameMeetingSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RenameMeetingSuccess',
  fields: () => ({
    meeting: {
      type: new GraphQLNonNull(NewMeeting),
      description: 'the renamed meeting',
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    }
  })
})

const RenameMeetingPayload = makeMutationPayload('RenameMeetingPayload', RenameMeetingSuccess)

export default RenameMeetingPayload
