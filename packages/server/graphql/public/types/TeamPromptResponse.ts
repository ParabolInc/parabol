import TeamPromptResponseId from '../../../../client/shared/gqlIds/TeamPromptResponseId'
import {TeamPromptResponseResolvers} from '../resolverTypes'

const TeamPromptResponse: TeamPromptResponseResolvers = {
  id: ({id}) => {
    return TeamPromptResponseId.join(id)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  },

  content: ({content}) => {
    return JSON.stringify(content)
  }
}

export default TeamPromptResponse
