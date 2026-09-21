import type {JSONContent} from '@tiptap/react'
import {useEffect, useMemo, useRef, useState} from 'react'
import type {TeamPromptComposer_meeting$data} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import isEmptyTipTapDoc from '../../../shared/tiptap/isEmptyTipTapDoc'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import {clearStageDrafts, readDraftAnswer} from './teamPromptDraftStorage'
import {getMemberSharedAt, getSharedResponses} from './teamPromptStages'
import type {DirtyAnswer} from './useTeamPromptAnswersAutosave'

const PREVIEW_LENGTH = 90

type ComposerStage = NonNullable<
  TeamPromptComposer_meeting$data['phases'][number]['stages']
>[number]

interface Options {
  prompts: readonly {id: string}[]
  stage: ComposerStage | undefined
  isEnded: boolean
  isExpanded: boolean
  seedDirty: (entries: readonly DirtyAnswer[]) => void
}

const useTeamPromptComposerState = (options: Options) => {
  const {prompts, stage, isEnded, isExpanded, seedDirty} = options
  const responses = stage?.responses ?? []

  const savedDocs = useMemo(() => {
    const map = new Map<string, JSONContent | null>()
    prompts.forEach((prompt) => {
      const saved = responses.find((response) => response.promptId === prompt.id)
      map.set(prompt.id, saved ? JSON.parse(saved.content) : null)
    })
    return map
  }, [stage?.id, isExpanded])

  const initialContentByPrompt = useMemo(() => {
    const map = new Map<string, JSONContent | null>()
    prompts.forEach((prompt) => {
      const draft = stage ? readDraftAnswer(stage.id, prompt.id) : null
      map.set(prompt.id, draft ?? savedDocs.get(prompt.id) ?? null)
    })
    return map
  }, [savedDocs])

  const [answeredPromptIds, setAnsweredPromptIds] = useState<Set<string>>(
    () =>
      new Set(
        prompts
          .filter((prompt) => {
            const doc = initialContentByPrompt.get(prompt.id)
            return !!doc && !isEmptyTipTapDoc(doc)
          })
          .map((prompt) => prompt.id)
      )
  )

  const hasSeededRef = useRef(false)
  useEffect(() => {
    if (!stage || hasSeededRef.current) return
    hasSeededRef.current = true
    const entries = prompts.reduce<DirtyAnswer[]>((acc, prompt) => {
      const draft = readDraftAnswer(stage.id, prompt.id)
      if (!draft) return acc
      if (JSON.stringify(draft) === JSON.stringify(savedDocs.get(prompt.id) ?? null)) return acc
      acc.push({promptId: prompt.id, doc: draft})
      return acc
    }, [])
    seedDirty(entries)
  }, [stage?.id])

  useEffect(() => {
    if (!stage || !isEnded) return
    clearStageDrafts(stage.id)
  }, [stage?.id, isEnded])

  const savedText = prompts
    .map((prompt) => responses.find((response) => response.promptId === prompt.id))
    .find((response) => !!response?.plaintextContent.trim())?.plaintextContent
  const preview = (savedText ?? '').replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH)
  const sharedAt = getMemberSharedAt(responses)
  const lastAnswerAt = sharedAt
    ? lastAnswerUpdatedAt(getSharedResponses(responses), sharedAt)
    : null

  return {
    initialContentByPrompt,
    answeredPromptIds,
    setAnsweredPromptIds,
    preview,
    sharedAt,
    lastAnswerAt
  }
}

export default useTeamPromptComposerState
