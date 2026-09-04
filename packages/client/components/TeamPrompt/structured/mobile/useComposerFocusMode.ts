import type {Editor} from '@tiptap/core'
import {useCallback, useMemo, useState} from 'react'
import nextUnansweredPromptId from './nextUnansweredPromptId'

interface Options {
  prompts: readonly {id: string}[]
  editorRefs: Map<string, React.MutableRefObject<Editor | null>>
  answeredPromptIds: ReadonlySet<string>
  isPhone: boolean
}

const useComposerFocusMode = (options: Options) => {
  const {prompts, editorRefs, answeredPromptIds, isPhone} = options
  const [focusedPromptId, setFocusedPromptId] = useState<string | null>(null)

  const onEditorFocusChange = useCallback(
    (promptId: string, isFocused: boolean) => {
      if (!isPhone) return
      setFocusedPromptId((current) => {
        if (isFocused) return promptId
        return current === promptId ? null : current
      })
    },
    [isPhone]
  )

  const focusPrompt = useCallback(
    (promptId: string) => {
      setFocusedPromptId(promptId)
      window.requestAnimationFrame(() => editorRefs.get(promptId)?.current?.commands.focus('end'))
    },
    [editorRefs]
  )

  const blur = useCallback(() => {
    if (focusedPromptId) editorRefs.get(focusedPromptId)?.current?.commands.blur()
    setFocusedPromptId(null)
  }, [editorRefs, focusedPromptId])

  const focusNextUnanswered = useCallback(() => {
    const nextPromptId = nextUnansweredPromptId(prompts, answeredPromptIds, focusedPromptId)
    if (!nextPromptId) return false
    focusPrompt(nextPromptId)
    return true
  }, [prompts, answeredPromptIds, focusedPromptId, focusPrompt])

  const isLastPrompt = useMemo(
    () => nextUnansweredPromptId(prompts, answeredPromptIds, focusedPromptId) === null,
    [prompts, answeredPromptIds, focusedPromptId]
  )

  return {
    focusedPromptId,
    onEditorFocusChange,
    focusPrompt,
    focusNextUnanswered,
    blur,
    isLastPrompt
  }
}

export default useComposerFocusMode
