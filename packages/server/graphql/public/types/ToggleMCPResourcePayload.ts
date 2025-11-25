import type {ToggleMCPResourcePayloadResolvers} from '../resolverTypes'

const ToggleMCPResourcePayload: ToggleMCPResourcePayloadResolvers = {
  __isTypeOf: ({orgId}) => !!orgId
}

export default ToggleMCPResourcePayload
