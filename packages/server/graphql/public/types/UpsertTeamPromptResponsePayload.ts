import {ErrorPayload, UpsertTeamPromptResponsePayloadResolvers} from '../../private/resolverTypes'
import {UpsertTeamPromptResponseSuccessSource} from './UpsertTeamPromptResponseSuccess'

export type UpsertTeamPromptResponsePayloadSource =
  | UpsertTeamPromptResponseSuccessSource
  | ErrorPayload

const UpsertTeamPromptResponsePayload: UpsertTeamPromptResponsePayloadResolvers = {
  __resolveType: (source) => {
    if ('error' in source) return 'ErrorPayload'
    return 'UpsertTeamPromptResponseSuccess'
  }
}

export default UpsertTeamPromptResponsePayload
