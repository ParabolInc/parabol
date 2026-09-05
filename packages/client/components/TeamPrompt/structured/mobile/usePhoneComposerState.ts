import {createContext, type MutableRefObject, useContext} from 'react'

export interface PhoneComposerControls {
  blur: () => void
  focusNextUnanswered: () => boolean
  share: () => void
  openInspiration: () => void
}

export interface PhoneComposerState {
  focusedPromptId: string | null
  setFocusedPromptId: (promptId: string | null) => void
  keyboardBottom: number
  answeredCount: number
  promptCount: number
  publishProgress: (answeredCount: number, promptCount: number) => void
  requestBlur: () => void
  focusNextUnanswered: () => boolean
  controlsRef: MutableRefObject<PhoneComposerControls | null>
  isLastPrompt: boolean
  publishIsLastPrompt: (isLastPrompt: boolean) => void
  share: () => void
  openInspiration: () => void
  isShared: boolean
  isDirty: boolean
  submitting: boolean
  publishShareState: (isShared: boolean, isDirty: boolean, submitting: boolean) => void
}

export const PhoneComposerStateContext = createContext<PhoneComposerState | null>(null)

const usePhoneComposerState = () => useContext(PhoneComposerStateContext)

export default usePhoneComposerState
