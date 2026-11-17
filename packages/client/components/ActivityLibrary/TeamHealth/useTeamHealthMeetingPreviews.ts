import {useEffect, useState} from 'react'
import pickLeastAskedTeamHealthQuestionIds from '../../../shared/utils/pickLeastAskedTeamHealthQuestionIds'

interface Question {
  readonly id: string
  readonly category: {readonly id: string}
}

// simulates a new series: each meeting asks the least-asked question per category, then counts as
// history for the next, until every question has come up once
const previewMeetings = async (questions: ReadonlyArray<Question>) => {
  const rotatableQuestions = questions.map(({id, category}) => ({id, categoryId: category.id}))
  const askCountByQuestionId = new Map<string, number>()
  const meetings: string[][] = []
  while (questions.some(({id}) => !askCountByQuestionId.has(id))) {
    const questionIds = await pickLeastAskedTeamHealthQuestionIds(
      rotatableQuestions,
      askCountByQuestionId
    )
    questionIds.forEach((id) =>
      askCountByQuestionId.set(id, (askCountByQuestionId.get(id) ?? 0) + 1)
    )
    meetings.push(questionIds)
  }
  return meetings
}

// the question ids each meeting of a new series would ask; empty until the first draw resolves
const useTeamHealthMeetingPreviews = (questions: ReadonlyArray<Question>) => {
  const [meetings, setMeetings] = useState<ReadonlyArray<ReadonlyArray<string>>>([])
  useEffect(() => {
    let isCurrent = true
    previewMeetings(questions).then((nextMeetings) => {
      if (isCurrent) setMeetings(nextMeetings)
    })
    return () => {
      isCurrent = false
    }
  }, [questions])
  return meetings
}

export default useTeamHealthMeetingPreviews
