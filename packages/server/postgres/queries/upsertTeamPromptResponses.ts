import {DeepNonNullable} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IUpsertTeamPromptResponsesQueryParams,
  upsertTeamPromptResponsesQuery
} from './generated/upsertTeamPromptResponsesQuery'

export type InputTeamPromptResponses = DeepNonNullable<IUpsertTeamPromptResponsesQueryParams['responses']>

export const upsertTeamPromptResponses = async (
  responses: InputTeamPromptResponses
) => {
  return upsertTeamPromptResponsesQuery.run({responses}, getPg())
}
