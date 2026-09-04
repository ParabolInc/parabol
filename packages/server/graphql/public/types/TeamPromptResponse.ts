import TeamPromptResponseId from '../../../../client/shared/gqlIds/TeamPromptResponseId'
import type {TeamPromptResponse as TeamPromptResponseDB} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {EMPTY_TIPTAP_DOC} from '../mutations/helpers/buildTeamPromptResponseContent'
import type {TeamPromptResponseResolvers} from '../resolverTypes'

const isContentVisible = (
  response: Pick<TeamPromptResponseDB, 'isShared' | 'userId'>,
  authToken: GQLContext['authToken']
) => response.isShared || response.userId === getUserId(authToken)

const TeamPromptResponse: TeamPromptResponseResolvers = {
  id: ({id}) => {
    return TeamPromptResponseId.join(id)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  },

  content: (response, _args, {authToken}) => {
    return JSON.stringify(
      isContentVisible(response, authToken) ? response.content : EMPTY_TIPTAP_DOC
    )
  },

  plaintextContent: (response, _args, {authToken}) => {
    return isContentVisible(response, authToken) ? response.plaintextContent : ''
  },

  answers: async (response, _args, {authToken, dataLoader}) => {
    if (!isContentVisible(response, authToken)) return []
    return dataLoader.get('teamPromptResponseAnswersByResponseId').load(response.id)
  },

  answeredPromptIds: async ({id}, _args, {dataLoader}) => {
    const answers = await dataLoader.get('teamPromptResponseAnswersByResponseId').load(id)
    return answers.map(({promptId}) => promptId)
  }
}

export default TeamPromptResponse
