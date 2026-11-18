import type {InvalidateSessionsPayloadResolvers} from '../resolverTypes'

export type InvalidateSessionsPayloadSource = {
  userId: string
}

const InvalidateSessionsPayload: InvalidateSessionsPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default InvalidateSessionsPayload
