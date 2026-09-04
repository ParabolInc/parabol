import type {JSONContent} from '@tiptap/core'
import {createContext, type MutableRefObject, useContext, useMemo} from 'react'

export interface InsertHandle {
  id: string
  promptId: string
}

export interface TeamPromptComposerApi {
  insertAnswerBlocks: (promptId: string, blocks: JSONContent[]) => Promise<InsertHandle | null>
  undoInsert: (handle: InsertHandle) => void
  forgetInsert: (handle: InsertHandle) => void
  getAnswerText: (promptId: string) => string
}

const TeamPromptComposerApiContext =
  createContext<MutableRefObject<TeamPromptComposerApi | null> | null>(null)

// The composer registers itself in an effect, so the api is read at call time, not at render time
export const useTeamPromptComposerApi = (): TeamPromptComposerApi | null => {
  const apiRef = useContext(TeamPromptComposerApiContext)
  return useMemo(() => {
    if (!apiRef) return null
    return {
      insertAnswerBlocks: (promptId, blocks) =>
        apiRef.current?.insertAnswerBlocks(promptId, blocks) ?? Promise.resolve(null),
      undoInsert: (handle) => apiRef.current?.undoInsert(handle),
      forgetInsert: (handle) => apiRef.current?.forgetInsert(handle),
      getAnswerText: (promptId) => apiRef.current?.getAnswerText(promptId) ?? ''
    }
  }, [apiRef])
}

export default TeamPromptComposerApiContext
