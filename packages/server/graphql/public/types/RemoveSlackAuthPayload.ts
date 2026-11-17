import type {RemoveSlackAuthPayloadResolvers} from '../resolverTypes'

export type RemoveSlackAuthPayloadSource = {
  authId: string | undefined
  teamId: string
  userId: string
}

const RemoveSlackAuthPayload: RemoveSlackAuthPayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default RemoveSlackAuthPayload
