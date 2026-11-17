import {
  canShowRespondentDetails,
  MIN_RESPONDENTS_FOR_SUMMARY
} from '../../../../client/shared/utils/teamHealthAnonymity'
import type {PriorTeamHealthCycle} from '../../../dataloader/customLoaderMakers'
import type {TeamHealthCategory, TeamHealthResponse} from '../../../postgres/types'
import averageTeamHealthScore from '../../../utils/averageTeamHealthScore'
import getTeamHealthDisplayComment from '../../../utils/getTeamHealthDisplayComment'
import type {TeamHealthCategorySummaryInput} from '../../../utils/OpenAIServerManager'

const ANSWERS = [1, 2, 3, 4, 5]

interface Input {
  category: Pick<TeamHealthCategory, 'id' | 'name'>
  question: string
  // this check's answers to the category's question
  responses: Pick<TeamHealthResponse, 'score' | 'comment' | 'commentParaphrased' | 'isAnonymous'>[]
  // newest first
  priorCycles: Pick<
    PriorTeamHealthCycle,
    'scoreByCategoryId' | 'commentsByCategoryId' | 'questionByCategoryId'
  >[]
}

/**
 * What the model reads to summarize one category of a revealed check: only what the result card
 * already shows the team, so nothing that says who answered. Each comment is read the way
 * getTeamHealthDisplayComment shows it, and the spread only goes in once enough people answered
 * for the card to draw it. Null when too few people answered to write about them as a group.
 */
const getTeamHealthCategorySummaryInput = (input: Input): TeamHealthCategorySummaryInput | null => {
  const {category, question, responses, priorCycles} = input
  const scores = responses.flatMap(({score}) => (score === null ? [] : [score]))
  const average = averageTeamHealthScore(scores)
  if (average === null || scores.length < MIN_RESPONDENTS_FOR_SUMMARY) return null
  const comments = responses.flatMap((response) => {
    const comment = getTeamHealthDisplayComment(response)
    return comment ? [comment] : []
  })
  // the last cycle that scored this category, the same one the result card compares against. Its
  // question goes in too, since the question rotates and a new one can move the answers by itself
  const [previous = null] = priorCycles.flatMap((cycle) => {
    const previousAverage = cycle.scoreByCategoryId.get(category.id)
    const previousQuestion = cycle.questionByCategoryId.get(category.id)
    if (previousAverage === undefined || previousQuestion === undefined) return []
    return [
      {
        question: previousQuestion,
        average: previousAverage,
        comments: cycle.commentsByCategoryId.get(category.id) ?? []
      }
    ]
  })
  return {
    category: category.name,
    question,
    current: {
      average,
      respondentCount: scores.length,
      answerCounts: canShowRespondentDetails(scores.length)
        ? ANSWERS.map((answer) => scores.filter((score) => score === answer).length)
        : null,
      comments
    },
    previous
  }
}

export default getTeamHealthCategorySummaryInput
