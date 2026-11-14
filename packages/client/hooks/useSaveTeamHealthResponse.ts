import {useEffect, useRef} from 'react'
import useSetTeamHealthResponseMutation from '../mutations/useSetTeamHealthResponseMutation'

interface Answer {
  score: number | null
  comment: string
  isAnonymous: boolean
}

// Blurring the comment box to click a score fires two saves a beat apart, each carrying the whole
// answer — and the blur still holds the score from before the click, so whichever lands last wins.
// Coalescing them into one write settles that, and spares the server a second paraphrase job
const SAVE_DEBOUNCE_MS = 300

/**
 * Saves a team health answer, coalescing the burst of saves a single edit can produce.
 */
const useSaveTeamHealthResponse = (meetingId: string, stageId: string) => {
  const [execute] = useSetTeamHealthResponseMutation()
  const pendingRef = useRef<Answer | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flush = () => {
    clearTimeout(timeoutRef.current)
    const answer = pendingRef.current
    if (!answer) return
    pendingRef.current = null
    execute({
      variables: {meetingId, stageId, ...answer, comment: answer.comment || null}
    })
  }
  // the card unmounts on every stage change, so an unsent answer has to go out with it
  useEffect(() => flush, [])
  return (answer: Answer) => {
    pendingRef.current = answer
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS)
  }
}

export default useSaveTeamHealthResponse
