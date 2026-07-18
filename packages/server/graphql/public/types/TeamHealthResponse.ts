import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {TeamHealthResponseResolvers} from '../resolverTypes'

const TeamHealthResponse: TeamHealthResponseResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamHealthResponse'),
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  isViewerCreator: ({userId}, _args, {authToken}) => {
    return userId === getUserId(authToken)
  }
}

export default TeamHealthResponse
