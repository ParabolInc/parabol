import {TeamPromptResponseResolvers} from '../resolverTypes'

const TeamPromptResponse: TeamPromptResponseResolvers = {
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  },

  content: ({content}) => {
    return JSON.stringify(content)
  }
}

export default TeamPromptResponse
