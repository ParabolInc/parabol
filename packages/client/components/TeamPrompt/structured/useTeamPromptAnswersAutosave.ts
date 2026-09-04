import type {JSONContent} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useUpsertTeamPromptAnswersMutation from '../../../mutations/useUpsertTeamPromptAnswersMutation'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import {clearDraftAnswers, writeDraftAnswer} from './teamPromptDraftStorage'

const AUTOSAVE_DEBOUNCE_MS = 800
const BENIGN_ERROR = 'Nothing to save'

export interface DirtyAnswer {
  promptId: string
  doc: JSONContent
}

interface Options {
  meetingId: string
  teamId: string
  stageId: string
  isShared: boolean
}

const useTeamPromptAnswersAutosave = (options: Options) => {
  const {meetingId, teamId, stageId, isShared} = options
  const atmosphere = useAtmosphere()
  const [execute, submitting] = useUpsertTeamPromptAnswersMutation()
  const pendingRef = useRef(new Map<string, JSONContent>())
  const timerRef = useRef<number | null>(null)
  const [dirtyPromptIds, setDirtyPromptIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(
    (share: boolean) => {
      const answers = [...pendingRef.current.entries()].map(([promptId, doc]) => ({
        promptId,
        content: JSON.stringify(doc)
      }))
      if (!share && answers.length === 0) return
      const sentPromptIds = answers.map(({promptId}) => promptId)
      execute({
        variables: {meetingId, answers, share},
        onCompleted: (_res, errors) => {
          const message = errors?.[0]?.message
          if (message === BENIGN_ERROR) {
            setError(null)
            return
          }
          if (message) {
            setError(message)
            atmosphere.eventEmitter.emit('addSnackbar', {
              key: `standupAnswers:${message}`,
              message,
              autoDismiss: 5
            })
            return
          }
          setError(null)
          sentPromptIds.forEach((promptId) => pendingRef.current.delete(promptId))
          setDirtyPromptIds((prev) => {
            const next = new Set(prev)
            sentPromptIds.forEach((promptId) => next.delete(promptId))
            return next
          })
          clearDraftAnswers(stageId, sentPromptIds)
          if (share) {
            SendClientSideEvent(atmosphere, 'Standup Response Shared', {
              teamId,
              meetingId,
              answerCount: answers.length
            })
          }
        }
      })
    },
    [execute, meetingId, teamId, stageId, atmosphere]
  )

  const queueAnswer = useCallback(
    (promptId: string, doc: JSONContent) => {
      writeDraftAnswer(stageId, promptId, doc)
      pendingRef.current.set(promptId, doc)
      setDirtyPromptIds((prev) => new Set(prev).add(promptId))
      if (isShared) return
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => send(false), AUTOSAVE_DEBOUNCE_MS)
    },
    [stageId, isShared, send]
  )

  const seedDirty = useCallback((entries: readonly DirtyAnswer[]) => {
    if (entries.length === 0) return
    entries.forEach(({promptId, doc}) => pendingRef.current.set(promptId, doc))
    setDirtyPromptIds((prev) => {
      const next = new Set(prev)
      entries.forEach(({promptId}) => next.add(promptId))
      return next
    })
  }, [])

  const share = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    send(true)
  }, [send])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    []
  )

  return {queueAnswer, seedDirty, share, submitting, dirtyPromptIds, error}
}

export default useTeamPromptAnswersAutosave
