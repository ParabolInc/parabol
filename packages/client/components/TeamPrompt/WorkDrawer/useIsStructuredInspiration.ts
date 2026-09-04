import {useWorkDrawerConsume, type WorkDrawerConsume} from './WorkDrawerConsumeContext'

export const getStructuredInspiration = (consume: WorkDrawerConsume) =>
  consume.mode === 'teamPrompt' && consume.composer && consume.prompts.length > 0
    ? {composer: consume.composer, prompts: consume.prompts}
    : null

const useIsStructuredInspiration = () => !!getStructuredInspiration(useWorkDrawerConsume())

export default useIsStructuredInspiration
