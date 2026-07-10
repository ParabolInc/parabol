import type {TeamHealthResponseResolvers} from '../resolverTypes'

const TeamHealthResponse: TeamHealthResponseResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default TeamHealthResponse
