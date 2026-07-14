import {TeamPromptEditablePromptModal} from 'parabol-client'

const noop = () => {}

export const Open = () => (
  <TeamPromptEditablePromptModal
    isOpen={true}
    initialPrompt='What are you working on today? Stuck on anything?'
    onCloseModal={noop}
    onSubmitUpdatePrompt={noop}
    onCompleted={noop}
  />
)

export const WithError = () => (
  <TeamPromptEditablePromptModal
    isOpen={true}
    initialPrompt='x'
    error='Prompts should be at least two characters long'
    onCloseModal={noop}
    onSubmitUpdatePrompt={noop}
    onCompleted={noop}
  />
)
