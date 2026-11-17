import {CipherId} from '../../../utils/CipherId'
import type {TeamHealthQuestionPackResolvers} from '../resolverTypes'

const TeamHealthQuestionPack: TeamHealthQuestionPackResolvers = {
  id: ({id}) => CipherId.toClient(id, 'teamHealthQuestionPack'),
  questions: ({id: packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionsByPackId').load(packId)
  }
}

export default TeamHealthQuestionPack
