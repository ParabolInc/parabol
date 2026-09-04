import {useEffect} from 'react'
import usePhoneComposerState from './usePhoneComposerState'

interface Options {
  focusedPromptId: string | null
  blur: () => void
  focusNextUnanswered: () => boolean
  answeredCount: number
  promptCount: number
  isLastPrompt: boolean
  share: () => void
  openInspiration: () => void
  isShared: boolean
  isDirty: boolean
  submitting: boolean
}

const usePhoneComposerBridge = (options: Options) => {
  const {
    focusedPromptId,
    blur,
    focusNextUnanswered,
    answeredCount,
    promptCount,
    isLastPrompt,
    share,
    openInspiration,
    isShared,
    isDirty,
    submitting
  } = options
  const phoneState = usePhoneComposerState()
  const {publishProgress, publishIsLastPrompt, publishShareState, setFocusedPromptId, controlsRef} =
    phoneState ?? {}

  useEffect(() => {
    publishProgress?.(answeredCount, promptCount)
  }, [publishProgress, answeredCount, promptCount])

  useEffect(() => {
    publishIsLastPrompt?.(isLastPrompt)
  }, [publishIsLastPrompt, isLastPrompt])

  useEffect(() => {
    publishShareState?.(isShared, isDirty, submitting)
  }, [publishShareState, isShared, isDirty, submitting])

  useEffect(() => {
    setFocusedPromptId?.(focusedPromptId)
  }, [setFocusedPromptId, focusedPromptId])

  useEffect(() => {
    if (!controlsRef) return
    controlsRef.current = {blur, focusNextUnanswered, share, openInspiration}
    return () => {
      controlsRef.current = null
    }
  }, [controlsRef, blur, focusNextUnanswered, share, openInspiration])
}

export default usePhoneComposerBridge
