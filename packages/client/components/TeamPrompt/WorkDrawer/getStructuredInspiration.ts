import type {WorkDrawerConsume} from './WorkDrawerConsumeContext'

const getStructuredInspiration = (consume: WorkDrawerConsume) =>
  consume.mode === 'teamPrompt' && consume.composer && consume.prompts.length > 0
    ? {composer: consume.composer, prompts: consume.prompts}
    : null

export default getStructuredInspiration
