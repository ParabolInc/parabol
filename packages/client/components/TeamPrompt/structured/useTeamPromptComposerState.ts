import type {JSONContent} from '@tiptap/react'
import {useEffect, useMemo, useRef, useState} from 'react'
import type {TeamPromptComposer_meeting$data} from '~/__generated__/TeamPromptComposer_meeting.graphql'
import lastAnswerUpdatedAt from './lastAnswerUpdatedAt'
import {clearStageDrafts, isDocEmpty, readDraftAnswer} from './teamPromptDraftStorage'
import type {DirtyAnswer} from './useTeamPromptAnswersAutosave'

const PREVIEW_LENGTH = 90

type ComposerStage = NonNullable<
  TeamPromptComposer_meeting$data['phases'][number]['stages']
>[number]

interface Options {
  prompts: readonly {id: string}[]
  stage: ComposerStage | undefined
  isEnded: boolean
  seedDirty: (entries: readonly DirtyAnswer[]) => void
}

const useTeamPromptComposerState = (options: Options) => {
  const {prompts, stage, isEnded, seedDirty} = options
  const response = stage?.response ?? null

  const savedDocs = useMemo(() => {
    const map = new Map<string, JSONContent | null>()
    prompts.forEach((prompt) => {
      const saved = response?.answers.find((answer) => answer.promptId === prompt.id)
      map.set(prompt.id, saved ? JSON.parse(saved.content) : null)
    })
    return map
  }, [stage?.id])

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
          .filter((prompt) => !isDocEmpty(initialContentByPrompt.get(prompt.id) ?? null))
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

  const savedTextByPrompt = useMemo(
    () =>
      new Map(
        prompts.map((prompt) => [
          prompt.id,
          response?.answers.find((answer) => answer.promptId === prompt.id)?.plaintextContent ?? ''
        ])
      ),
    [response?.answers, prompts]
  )

  const savedText = prompts
    .map((prompt) => response?.answers.find((answer) => answer.promptId === prompt.id))
    .find((answer) => !!answer?.plaintextContent.trim())?.plaintextContent
  const preview = (savedText ?? '').replace(/\s+/g, ' ').trim().slice(0, PREVIEW_LENGTH)
  const sharedAt = response?.sharedAt ?? null
  const lastAnswerAt = response && sharedAt ? lastAnswerUpdatedAt(response.answers, sharedAt) : null

  return {
    initialContentByPrompt,
    answeredPromptIds,
    setAnsweredPromptIds,
    preview,
    savedTextByPrompt,
    sharedAt,
    lastAnswerAt
  }
}

export default useTeamPromptComposerState
