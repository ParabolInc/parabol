import {JSONContent} from '@tiptap/core'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import Reactji from '../../database/types/Reactji'
import {IGetTeamPromptResponsesByIdsQueryResult} from './generated/getTeamPromptResponsesByIdsQuery'

export interface TeamPromptResponse
  extends Omit<IGetTeamPromptResponsesByIdsQueryResult, 'content' | 'reactjis' | 'id'> {
  id: string
  reactjis: Reactji[]
  content: JSONContent
}

export const mapToTeamPromptResponse = (
  results: IGetTeamPromptResponsesByIdsQueryResult[]
): TeamPromptResponse[] => {
  return results.map((teamPromptResponse: any) => {
    return {
      ...teamPromptResponse,
      id: TeamPromptResponseId.join(teamPromptResponse.id)
    } as TeamPromptResponse
  })
}
