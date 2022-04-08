import getPg from '../getPg'
import {
  IUpdateTeamPromptResponseContentByIdQueryParams,
  updateTeamPromptResponseContentByIdQuery
} from './generated/updateTeamPromptResponseContentByIdQuery'

export const updateTeamPromptResponseContentById = (
  params: IUpdateTeamPromptResponseContentByIdQueryParams
) => {
  return updateTeamPromptResponseContentByIdQuery.run(params, getPg())
}
