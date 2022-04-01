import getPg from '../getPg'
import {
  IUpdateTeamPromptResponseContentByIdQueryParams,
  updateTeamPromptResponseContentByIdQuery
} from './generated/updateTeamPromptResponseContentByIdQuery'

export const updateTeamPromptResponseContentById = async (
  params: IUpdateTeamPromptResponseContentByIdQueryParams
) => {
  await updateTeamPromptResponseContentByIdQuery.run(params, getPg())
}
