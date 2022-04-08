import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting} from '../resolvers'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'
import TeamPromptResponse from './TeamPromptResponse'

export const UpdatePromptResponseSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatePromptResponseSuccess',
  fields: () => ({
    promptResponseId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    meeting: {
      type: new GraphQLNonNull(NewMeeting),
      resolve: resolveNewMeeting
    },
    promptResponse: {
      type: new GraphQLNonNull(TeamPromptResponse),
      resolve: makeResolve('promptResponseId', 'promptResponse', 'teamPromptResponses')
    }
  })
})

const UpdatePromptResponsePayload = makeMutationPayload(
  'UpdatePromptResponsePayload',
  UpdatePromptResponseSuccess
)

export default UpdatePromptResponsePayload
