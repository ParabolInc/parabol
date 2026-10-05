import type {JSONContent} from '@tiptap/core'
import {createContext, type MutableRefObject, useContext, useMemo} from 'react'

export interface TeamPromptComposerApi {
  insertAnswerBlocks: (promptId: string, blocks: JSONContent[]) => Promise<boolean>
  getAnswerText: (promptId: string) => string
}

const TeamPromptComposerApiContext =
  createContext<MutableRefObject<TeamPromptComposerApi | null> | null>(null)

export const useTeamPromptComposerApi = (): TeamPromptComposerApi => {
  const apiRef = useContext(TeamPromptComposerApiContext)
  if (!apiRef) throw new Error('useTeamPromptComposerApi must be used within a stand-up meeting')
  return useMemo(() => {
    return {
      insertAnswerBlocks: (promptId, blocks) =>
        apiRef.current?.insertAnswerBlocks(promptId, blocks) ?? Promise.resolve(false),
      getAnswerText: (promptId) => apiRef.current?.getAnswerText(promptId) ?? ''
    }
  }, [apiRef])
}

export default TeamPromptComposerApiContext
