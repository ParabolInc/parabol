import {JSONContent} from '@tiptap/core'
import getPg from '../getPg'
import {
  getTeamPromptResponsesByIdsQuery,
  IGetTeamPromptResponsesByIdsQueryResult
} from './generated/getTeamPromptResponsesByIdsQuery'

export interface TeamPromptResponse
  extends Omit<IGetTeamPromptResponsesByIdsQueryResult, 'content'> {
  content: JSONContent
}

export const getTeamPromptResponsesByIds = async (
  teamPromptResponseIds: readonly number[]
): Promise<TeamPromptResponse[]> => {
  const teamPromptResponses = await getTeamPromptResponsesByIdsQuery.run(
    {ids: teamPromptResponseIds},
    getPg()
  )
  return teamPromptResponses as TeamPromptResponse[]
}
