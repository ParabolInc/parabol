import type {JSONContent} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useUpsertTeamPromptAnswersMutation from '../../../mutations/useUpsertTeamPromptAnswersMutation'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import autosaveCompletion from './autosaveCompletion'
import {clearDraftAnswers, writeDraftAnswer} from './teamPromptDraftStorage'

const AUTOSAVE_DEBOUNCE_MS = 800
const IN_FLIGHT_CEILING_MS = 10000
const TRANSPORT_ERROR = 'Could not save your update — try again'

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
  const inFlightRef = useRef(false)
  const inFlightSinceRef = useRef<number | null>(null)
  const sendCounterRef = useRef(0)
  const shareSendIdRef = useRef(0)
  const latestSendIdRef = useRef(0)
  const [dirtyPromptIds, setDirtyPromptIds] = useState<Set<string>>(new Set())

  const send = useCallback(
    (share: boolean, onShared?: () => void) => {
      const sentDocs = new Map(pendingRef.current)
      const answers = [...sentDocs.entries()].map(([promptId, doc]) => ({
        promptId,
        content: JSON.stringify(doc)
      }))
      if (!share && answers.length === 0) return
      const sendId = ++sendCounterRef.current
      if (share) shareSendIdRef.current = sendId
      latestSendIdRef.current = sendId
      inFlightRef.current = true
      inFlightSinceRef.current = Date.now()
      const evictSentAnswers = () => {
        const evictedPromptIds = [...sentDocs.entries()]
          .filter(([promptId, doc]) => pendingRef.current.get(promptId) === doc)
          .map(([promptId]) => promptId)
        evictedPromptIds.forEach((promptId) => pendingRef.current.delete(promptId))
        setDirtyPromptIds((prev) => {
          const next = new Set(prev)
          evictedPromptIds.forEach((promptId) => next.delete(promptId))
          return next
        })
        clearDraftAnswers(stageId, evictedPromptIds)
      }
      execute({
        variables: {meetingId, answers, share},
        onError: () => {
          if (sendId === latestSendIdRef.current) {
            inFlightRef.current = false
            inFlightSinceRef.current = null
          }
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'standupAnswers:transport',
            message: TRANSPORT_ERROR,
            autoDismiss: 5
          })
        },
        onCompleted: (_res, errors) => {
          if (sendId === latestSendIdRef.current) {
            inFlightRef.current = false
            inFlightSinceRef.current = null
          }
          const message = errors?.[0]?.message
          const completion = autosaveCompletion(message, !share && sendId < shareSendIdRef.current)
          if (completion === 'ignore') return
          if (completion === 'evict') {
            evictSentAnswers()
            return
          }
          if (completion === 'snackbar' && message) {
            atmosphere.eventEmitter.emit('addSnackbar', {
              key: `standupAnswers:${message}`,
              message,
              autoDismiss: 5
            })
            return
          }
          evictSentAnswers()
          if (share) {
            SendClientSideEvent(atmosphere, 'Standup Response Shared', {
              teamId,
              meetingId,
              answerCount: answers.length
            })
            onShared?.()
          }
        }
      })
    },
    [execute, meetingId, teamId, stageId, atmosphere]
  )

  const armAutosave = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(function autosave() {
      if (inFlightRef.current) {
        const inFlightSince = inFlightSinceRef.current
        if (inFlightSince !== null && Date.now() - inFlightSince >= IN_FLIGHT_CEILING_MS) {
          inFlightRef.current = false
          inFlightSinceRef.current = null
          send(false)
          return
        }
        timerRef.current = window.setTimeout(autosave, AUTOSAVE_DEBOUNCE_MS)
        return
      }
      send(false)
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [send])

  const queueAnswer = useCallback(
    (promptId: string, doc: JSONContent) => {
      writeDraftAnswer(stageId, promptId, doc)
      pendingRef.current.set(promptId, doc)
      setDirtyPromptIds((prev) => new Set(prev).add(promptId))
      if (isShared) return
      armAutosave()
    },
    [stageId, isShared, armAutosave]
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

  const share = useCallback(
    (onShared?: () => void) => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      send(true, onShared)
    },
    [send]
  )

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    []
  )

  return {queueAnswer, seedDirty, share, submitting, dirtyPromptIds}
}

export default useTeamPromptAnswersAutosave
