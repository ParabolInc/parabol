import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting} from '../resolvers'
import makeMutationPayload from './makeMutationPayload'
import NewMeeting from './NewMeeting'
import StandardMutationError from './StandardMutationError'
import TeamPromptResponse from './TeamPromptResponse'

export const UpdatePromptResponseSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdatePromptResponseSuccess',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    promptResponse: {
      type: TeamPromptResponse,
      resolve: makeResolve('promptResponseId', 'promptResponse', 'teamPromptResponses')
    }
  })
})

const UpdatePromptResponsePayload = makeMutationPayload(
  'UpdatePromptResponsePayload',
  UpdatePromptResponseSuccess
)

export default UpdatePromptResponsePayload
