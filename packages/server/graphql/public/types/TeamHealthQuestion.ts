import {CipherId} from '../../../utils/CipherId'
import type {TeamHealthQuestionResolvers} from '../resolverTypes'

const TeamHealthQuestion: TeamHealthQuestionResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamHealthQuestion'),
  pack: ({packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionPacks').loadNonNull(packId)
  },
  category: ({categoryId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthCategories').loadNonNull(categoryId)
  },
  createdByUser: ({createdBy}, _args, {dataLoader}) => {
    return createdBy ? dataLoader.get('users').loadNonNull(createdBy) : null
  }
}

export default TeamHealthQuestion
