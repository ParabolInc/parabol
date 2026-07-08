import {createContext, useContext} from 'react'

export interface ViewerResponse {
  id: string
  content: string
  plaintextContent: string
}

// Tells InspirationItemsPanel how generated items are consumed, which differs by meeting type:
// team prompt merges an item into the viewer's response; retro adds each item as a reflection card.
export type WorkDrawerConsume =
  | {mode: 'teamPrompt'; viewerResponse: ViewerResponse | null}
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

const WorkDrawerConsumeContext = createContext<WorkDrawerConsume>({
  mode: 'teamPrompt',
  viewerResponse: null
})

export const useWorkDrawerConsume = () => useContext(WorkDrawerConsumeContext)

export default WorkDrawerConsumeContext
