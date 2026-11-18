import type {DismissSuggestedActionPayloadResolvers} from '../resolverTypes'

export type DismissSuggestedActionPayloadSource = {userId: string; removedSuggestedActionId: string}

const DismissSuggestedActionPayload: DismissSuggestedActionPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default DismissSuggestedActionPayload
