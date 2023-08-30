import {TeamPromptQuestionResolvers} from '../resolverTypes'

const TeamPromptQuestion: TeamPromptQuestionResolvers = {
  id: ({id}) => `teamPromptQuestion:${id}`
}

export default TeamPromptQuestion
