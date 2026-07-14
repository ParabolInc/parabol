import type {TeamHealthQuestionPackResolvers} from '../resolverTypes'

const TeamHealthQuestionPack: TeamHealthQuestionPackResolvers = {
  questions: ({id: packId}, _args, {dataLoader}) => {
    return dataLoader.get('teamHealthQuestionsByPackId').load(packId)
  }
}

export default TeamHealthQuestionPack
