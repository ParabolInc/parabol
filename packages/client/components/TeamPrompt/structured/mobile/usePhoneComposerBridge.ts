import {useEffect} from 'react'
import usePhoneComposerState from './usePhoneComposerState'

interface Options {
  focusedPromptId: string | null
  blur: () => void
  focusNextUnanswered: () => boolean
  answeredCount: number
  promptCount: number
  isLastPrompt: boolean
}

const usePhoneComposerBridge = (options: Options) => {
  const {focusedPromptId, blur, focusNextUnanswered, answeredCount, promptCount, isLastPrompt} =
    options
  const phoneState = usePhoneComposerState()
  const {publishProgress, publishIsLastPrompt, setFocusedPromptId, controlsRef} = phoneState ?? {}

  useEffect(() => {
    publishProgress?.(answeredCount, promptCount)
  }, [publishProgress, answeredCount, promptCount])

  useEffect(() => {
    publishIsLastPrompt?.(isLastPrompt)
  }, [publishIsLastPrompt, isLastPrompt])

  useEffect(() => {
    setFocusedPromptId?.(focusedPromptId)
  }, [setFocusedPromptId, focusedPromptId])

  useEffect(() => {
    if (!controlsRef) return
    controlsRef.current = {blur, focusNextUnanswered}
    return () => {
      controlsRef.current = null
    }
  }, [controlsRef, blur, focusNextUnanswered])
}

export default usePhoneComposerBridge
