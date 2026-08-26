import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import isValid from '../../../isValid'
import {canRevealTeamHealth} from '../../../public/types/helpers/canRevealTeamHealth'
import {getSummaryTable} from './getSummaryTable'

const headers = ['Question', 'Average', 'Responses', 'Comments'] as const

// Aggregate every response by question so no answer can be traced to an individual,
// matching the anonymity guarantee of the team health meeting itself.
const getRowData = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await dataLoader.get('teamHealthResponsesByMeetingId').load(meetingId)
  const questionIds = [...new Set(responses.map(({questionId}) => questionId))]
  const questions = (await dataLoader.get('teamHealthQuestions').loadMany(questionIds)).filter(
    isValid
  )
  const questionById = new Map(questions.map((question) => [String(question.id), question]))

  const grouped = new Map<string, {question: string; scores: number[]; comments: string[]}>()
  for (const response of responses) {
    const questionId = String(response.questionId)
    const question = questionById.get(questionId)
    if (!question) continue
    let entry = grouped.get(questionId)
    if (!entry) {
      entry = {question: question.question, scores: [], comments: []}
      grouped.set(questionId, entry)
    }
    if (response.score !== null && response.score !== undefined) entry.scores.push(response.score)
    // only the anonymity-preserving paraphrase is publishable here. A raw comment is the author's
    // own words on a page the whole team reads, which is exactly how a writing style identifies
    // someone — if the paraphrase is missing the comment simply doesn't go out
    if (response.commentParaphrased) entry.comments.push(response.commentParaphrased)
  }

  return [...grouped.values()].map((entry) => {
    const average = entry.scores.length
      ? (entry.scores.reduce((sum, score) => sum + score, 0) / entry.scores.length).toFixed(1)
      : ''
    return {
      Question: entry.question,
      Average: average,
      Responses: String(entry.scores.length),
      Comments: entry.comments.join('\n')
    } as Record<(typeof headers)[number], string>
  })
}

export const getTeamHealthSummaryTable = async (
  meetingId: string,
  dataLoader: DataLoaderInstance
) => {
  if (!(await canRevealTeamHealth(meetingId, dataLoader))) return null
  const rowData = await getRowData(meetingId, dataLoader)
  return getSummaryTable(headers, rowData)
}
