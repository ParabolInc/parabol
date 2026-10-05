import type {JSONContent} from '@tiptap/react'
import {useCallback, useEffect, useRef, useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useShareTeamPromptResponsesMutation from '../../../mutations/useShareTeamPromptResponsesMutation'
import useUpsertTeamPromptResponseMutation from '../../../mutations/useUpsertTeamPromptResponseMutation'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
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
  const [upsertResponse] = useUpsertTeamPromptResponseMutation()
  const [shareResponses] = useShareTeamPromptResponsesMutation()
  const pendingRef = useRef(new Map<string, JSONContent>())
  const timerRef = useRef<number | null>(null)
  const inFlightCountRef = useRef(0)
  const inFlightSinceRef = useRef<number | null>(null)
  const [dirtyPromptIds, setDirtyPromptIds] = useState<Set<string>>(new Set())
  const [isSharing, setIsSharing] = useState(false)

  const reportError = useCallback(
    (message: string) => {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: `standupAnswers:${message}`,
        message,
        autoDismiss: 5
      })
    },
    [atmosphere]
  )

  const saveAnswer = useCallback(
    (promptId: string, doc: JSONContent) =>
      new Promise<boolean>((resolve) => {
        inFlightCountRef.current += 1
        inFlightSinceRef.current ??= Date.now()
        const settle = (isSaved: boolean) => {
          inFlightCountRef.current = Math.max(0, inFlightCountRef.current - 1)
          if (inFlightCountRef.current === 0) inFlightSinceRef.current = null
          resolve(isSaved)
        }
        upsertResponse({
          variables: {meetingId, promptId, content: JSON.stringify(doc)},
          onError: () => {
            reportError(TRANSPORT_ERROR)
            settle(false)
          },
          onCompleted: (_res, errors) => {
            const message = errors?.[0]?.message
            if (message) {
              reportError(message)
              settle(false)
              return
            }
            if (pendingRef.current.get(promptId) === doc) {
              pendingRef.current.delete(promptId)
              setDirtyPromptIds((prev) => {
                const next = new Set(prev)
                next.delete(promptId)
                return next
              })
              clearDraftAnswers(stageId, [promptId])
            }
            settle(true)
          }
        })
      }),
    [upsertResponse, meetingId, stageId, reportError]
  )

  const flush = useCallback(async () => {
    const results = await Promise.all(
      [...pendingRef.current.entries()].map(([promptId, doc]) => saveAnswer(promptId, doc))
    )
    return results.every(Boolean)
  }, [saveAnswer])

  const armAutosave = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(function autosave() {
      const inFlightSince = inFlightSinceRef.current
      if (inFlightSince !== null && Date.now() - inFlightSince < IN_FLIGHT_CEILING_MS) {
        timerRef.current = window.setTimeout(autosave, AUTOSAVE_DEBOUNCE_MS)
        return
      }
      inFlightCountRef.current = 0
      inFlightSinceRef.current = null
      flush()
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [flush])

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
    async (onShared?: () => void) => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      setIsSharing(true)
      const isSaved = await flush()
      if (!isSaved) {
        setIsSharing(false)
        return
      }
      shareResponses({
        variables: {meetingId},
        onError: () => {
          setIsSharing(false)
          reportError(TRANSPORT_ERROR)
        },
        onCompleted: (res, errors) => {
          setIsSharing(false)
          const message = errors?.[0]?.message
          if (message) {
            reportError(message)
            return
          }
          SendClientSideEvent(atmosphere, 'Standup Response Shared', {
            teamId,
            meetingId,
            answerCount: res.shareTeamPromptResponses.responses.filter(({sharedAt}) => !!sharedAt)
              .length
          })
          onShared?.()
        }
      })
    },
    [flush, shareResponses, meetingId, teamId, atmosphere, reportError]
  )

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    },
    []
  )

  return {queueAnswer, seedDirty, share, submitting: isSharing, dirtyPromptIds}
}

export default useTeamPromptAnswersAutosave
