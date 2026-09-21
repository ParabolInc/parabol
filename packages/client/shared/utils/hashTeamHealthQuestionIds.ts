import {quickHash} from './quickHash'

const hashTeamHealthQuestionIds = async (questionIds: readonly string[]) => {
  const hashes = await Promise.all(questionIds.map((questionId) => quickHash([questionId])))
  return new Map(questionIds.map((questionId, index) => [questionId, hashes[index]!]))
}

export default hashTeamHealthQuestionIds
