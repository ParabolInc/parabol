import {getUserId} from '../../../utils/authorization'
import type {TeamHealthResponseResolvers} from '../resolverTypes'

const TeamHealthResponse: TeamHealthResponseResolvers = {
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  isViewerCreator: ({userId}, _args, {authToken}) => {
    return userId === getUserId(authToken)
  }
}

export default TeamHealthResponse
