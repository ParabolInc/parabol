import {useEffect, useState} from 'react'
import previewTeamHealthMeetingQuestionIds from '../../../shared/utils/previewTeamHealthMeetingQuestionIds'

interface Question {
  readonly id: string
  readonly category: {readonly id: string}
}

// the question ids each meeting of a new series would ask; empty until the first draw resolves
const useTeamHealthMeetingPreviews = (questions: ReadonlyArray<Question>) => {
  const [meetings, setMeetings] = useState<ReadonlyArray<ReadonlyArray<string>>>([])
  const questionsKey = questions.map(({id, category}) => `${id}|${category.id}`).join(',')

  useEffect(() => {
    let isCurrent = true
    const rotatableQuestions = questionsKey
      .split(',')
      .filter(Boolean)
      .map((entry) => {
        const [id, categoryId] = entry.split('|')
        return {id: id!, categoryId: categoryId!}
      })
    previewTeamHealthMeetingQuestionIds(rotatableQuestions).then((nextMeetings) => {
      if (isCurrent) setMeetings(nextMeetings)
    })
    return () => {
      isCurrent = false
    }
  }, [questionsKey])

  return meetings
}

export default useTeamHealthMeetingPreviews
