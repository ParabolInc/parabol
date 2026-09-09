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
  },
  // only the author may read their own raw (un-paraphrased) comment
  comment: ({userId, comment}, _args, {authToken}) => {
    return userId === getUserId(authToken) ? comment : null
  },
  // the empty string is the "waiting on its paraphrase" sentinel, which readers see as no comment
  commentParaphrased: ({commentParaphrased}) => commentParaphrased || null
}

export default TeamHealthResponse
