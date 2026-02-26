import type {DismissSuggestedActionPayloadResolvers} from '../resolverTypes'

export type DismissSuggestedActionPayloadSource =
  | {userId: string; removedSuggestedActionId: string}
  | {error: {message: string}}

const DismissSuggestedActionPayload: DismissSuggestedActionPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default DismissSuggestedActionPayload
