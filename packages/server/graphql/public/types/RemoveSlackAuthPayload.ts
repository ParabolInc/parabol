import type {RemoveSlackAuthPayloadResolvers} from '../resolverTypes'

export type RemoveSlackAuthPayloadSource =
  | {authId: string | undefined; teamId: string; userId: string}
  | {error: {message: string}}

const RemoveSlackAuthPayload: RemoveSlackAuthPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default RemoveSlackAuthPayload
