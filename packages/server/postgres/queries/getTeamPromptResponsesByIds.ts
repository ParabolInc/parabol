import {JSONContent} from '@tiptap/core'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {MaybeReadonly} from 'parabol-client/types/generics'
import Reactji from '../../database/types/Reactji'
import getPg from '../getPg'
import {
  getTeamPromptResponsesByIdsQuery,
  IGetTeamPromptResponsesByIdsQueryResult
} from './generated/getTeamPromptResponsesByIdsQuery'

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
      id: TeamPromptResponseId.join(teamPromptResponse.id),
      reactjis: teamPromptResponse.reactjis.map(
        (reactji: {shortname: string; userid: string}) =>
          new Reactji({id: reactji.shortname, userId: reactji.userid})
      ),
    } as TeamPromptResponse
  })
}

export const getTeamPromptResponsesByIds = async (
  teamPromptResponseIds: MaybeReadonly<string[]>
): Promise<TeamPromptResponse[]> => {
  const teamPromptResponses = await getTeamPromptResponsesByIdsQuery.run(
    {ids: teamPromptResponseIds.map((id) => TeamPromptResponseId.split(id))},
    getPg()
  )
  return mapToTeamPromptResponse(teamPromptResponses)
}
