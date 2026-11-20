import type {MarkReportsViewedPayloadResolvers} from '../resolverTypes'

export type MarkReportsViewedPayloadSource = {
  viewerId: string
}

const MarkReportsViewedPayload: MarkReportsViewedPayloadResolvers = {
  user: async ({viewerId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default MarkReportsViewedPayload
