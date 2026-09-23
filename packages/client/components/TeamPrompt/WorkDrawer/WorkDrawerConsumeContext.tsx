import {createContext, useContext} from 'react'
import type {TeamPromptComposerApi} from '../structured/TeamPromptComposerApiContext'

export interface WorkDrawerPrompt {
  id: string
  question: string
  groupColor: string
}

// Tells InspirationItemsPanel how generated items are consumed, which differs by meeting type:
// team prompt routes an item into the composer's answer for its prompt; retro adds each item as a reflection card.
export type WorkDrawerConsume =
  | {
      mode: 'teamPrompt'
      composer: TeamPromptComposerApi
      prompts: readonly WorkDrawerPrompt[]
    }
  | {
      mode: 'retro'
      // The sort order to give a new reflection so it lands on top of the prompt's stack.
      getNextReflectionSortOrder: (promptId: string | null) => number
      // The reflect prompt (column) a generated item will be added to, for the card footer.
      getReflectPrompt: (promptId: string | null) => {question: string; groupColor: string} | null
      // True if a reflection with this plaintext already exists in the prompt's stack, so the
      // card can show "Added" (persists across refresh, unlike local state).
      isReflectionAdded: (promptId: string | null, plaintext: string) => boolean
    }

const WorkDrawerConsumeContext = createContext<WorkDrawerConsume | null>(null)

export const useWorkDrawerConsume = () => {
  const consume = useContext(WorkDrawerConsumeContext)
  if (!consume) throw new Error('useWorkDrawerConsume must be used within a work drawer')
  return consume
}

export default WorkDrawerConsumeContext
