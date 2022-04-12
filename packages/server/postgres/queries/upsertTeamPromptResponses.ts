import {DeepNonNullable} from '../../../client/types/generics'
import getPg from '../getPg'
import {
  IUpsertTeamPromptResponsesQueryParams,
  upsertTeamPromptResponsesQuery
} from './generated/upsertTeamPromptResponsesQuery'

export type InputTeamPromptResponses = DeepNonNullable<
  IUpsertTeamPromptResponsesQueryParams['responses']
>
export type InputTeamPromptResponse = IUpsertTeamPromptResponsesQueryParams['responses'][0]

export const upsertTeamPromptResponse = async (
  response: InputTeamPromptResponse
): Promise<number> => {
  const results = await upsertTeamPromptResponsesQuery.run({responses: [response]}, getPg())
  return results[0]!.id
}

export const upsertTeamPromptResponses = async (
  responses: InputTeamPromptResponses
): Promise<number[]> => {
  const results = await upsertTeamPromptResponsesQuery.run({responses}, getPg())
  return results.map((result) => result.id)
}
