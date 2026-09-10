import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import getTeamHealthDisplayComment from '../../../utils/getTeamHealthDisplayComment'
import type {TeamHealthResponseResolvers} from '../resolverTypes'

const TeamHealthResponse: TeamHealthResponseResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamHealthResponse'),
  score: ({userId, score}, _args, {authToken}) => {
    return userId === getUserId(authToken) ? score : null
  },
  question: ({questionId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestions').loadNonNull(questionId)
  },
  isViewerCreator: ({userId}, _args, {authToken}) => {
    return userId === getUserId(authToken)
  },
  commentAuthor: ({userId, comment, isAnonymous}, _args, {dataLoader}) => {
    return comment && !isAnonymous ? dataLoader.get('users').loadNonNull(userId) : null
  },
  // only the author may read their own raw (un-paraphrased) comment
  comment: ({userId, comment}, _args, {authToken}) => {
    return userId === getUserId(authToken) ? comment : null
  },
  commentParaphrased: (response) => getTeamHealthDisplayComment(response)
}

export default TeamHealthResponse
