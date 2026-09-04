import {createContext, type MutableRefObject, useContext} from 'react'

export interface PhoneComposerControls {
  blur: () => void
  focusNextUnanswered: () => boolean
}

export interface PhoneComposerState {
  focusedPromptId: string | null
  setFocusedPromptId: (promptId: string | null) => void
  answeredCount: number
  promptCount: number
  publishProgress: (answeredCount: number, promptCount: number) => void
  requestBlur: () => void
  focusNextUnanswered: () => boolean
  controlsRef: MutableRefObject<PhoneComposerControls | null>
  isLastPrompt: boolean
  publishIsLastPrompt: (isLastPrompt: boolean) => void
}

export const PhoneComposerStateContext = createContext<PhoneComposerState | null>(null)

const usePhoneComposerState = () => useContext(PhoneComposerStateContext)

export default usePhoneComposerState
