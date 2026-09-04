import {useEffect} from 'react'
import usePhoneComposerState from './usePhoneComposerState'

interface Options {
  focusedPromptId: string | null
  blur: () => void
  focusNextUnanswered: () => boolean
  answeredCount: number
  promptCount: number
}

const usePhoneComposerBridge = (options: Options) => {
  const {focusedPromptId, blur, focusNextUnanswered, answeredCount, promptCount} = options
  const phoneState = usePhoneComposerState()
  const {publishProgress, setFocusedPromptId, controlsRef} = phoneState ?? {}

  useEffect(() => {
    publishProgress?.(answeredCount, promptCount)
  }, [publishProgress, answeredCount, promptCount])

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
