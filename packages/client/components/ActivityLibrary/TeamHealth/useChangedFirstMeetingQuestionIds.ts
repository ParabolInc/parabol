import {useEffect, useRef, useState} from 'react'

const HIGHLIGHT_MS = 4000
const NO_IDS: ReadonlySet<string> = new Set()

const useChangedFirstMeetingQuestionIds = (
  isEditing: boolean,
  questionIds: ReadonlyArray<string>
) => {
  const [changedIds, setChangedIds] = useState(NO_IDS)
  const idsBeforeEditingRef = useRef<ReadonlyArray<string> | null>(null)
  const questionIdsRef = useRef(questionIds)
  questionIdsRef.current = questionIds

  useEffect(() => {
    if (isEditing) {
      idsBeforeEditingRef.current = questionIdsRef.current
      setChangedIds(NO_IDS)
      return
    }
    const idsBeforeEditing = idsBeforeEditingRef.current
    idsBeforeEditingRef.current = null
    if (!idsBeforeEditing) return
    const newIds = questionIdsRef.current.filter((id) => !idsBeforeEditing.includes(id))
    if (newIds.length === 0) return
    setChangedIds(new Set(newIds))
    const timeout = window.setTimeout(() => setChangedIds(NO_IDS), HIGHLIGHT_MS)
    return () => window.clearTimeout(timeout)
  }, [isEditing])

  return changedIds
}

export default useChangedFirstMeetingQuestionIds
