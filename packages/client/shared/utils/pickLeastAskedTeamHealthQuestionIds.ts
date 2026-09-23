import {quickHash} from './quickHash'

interface Question {
  // the id the client sees, so the client & the server hash the same string
  readonly id: string
  readonly categoryId: string | number
}

/**
 * Picks one question per category: the one asked the fewest times so far, breaking ties with the
 * lowest hash of its id.
 *
 * The client previews a new series with this and the server starts meetings with it, so both
 * arrive at the same questions without talking to each other. Hashing each question on its own
 * keeps the draw stable when unrelated questions are added or removed.
 */
const pickLeastAskedTeamHealthQuestionIds = async (
  questions: readonly Question[],
  askCountByQuestionId: ReadonlyMap<string, number>
) => {
  const questionIdsByCategoryId = new Map<string | number, string[]>()
  for (const {id, categoryId} of questions) {
    questionIdsByCategoryId.set(categoryId, [
      ...(questionIdsByCategoryId.get(categoryId) ?? []),
      id
    ])
  }
  return Promise.all(
    [...questionIdsByCategoryId.values()].map(async (questionIds) => {
      const minAskCount = Math.min(...questionIds.map((id) => askCountByQuestionId.get(id) ?? 0))
      const tiebreakKeys = await Promise.all(
        questionIds
          .filter((id) => (askCountByQuestionId.get(id) ?? 0) === minAskCount)
          .map(async (id) => `${await quickHash([id])}:${id}`)
      )
      const lowestKey = tiebreakKeys.reduce((lowest, key) => (key < lowest ? key : lowest))
      return lowestKey.slice(lowestKey.indexOf(':') + 1)
    })
  )
}

export default pickLeastAskedTeamHealthQuestionIds
