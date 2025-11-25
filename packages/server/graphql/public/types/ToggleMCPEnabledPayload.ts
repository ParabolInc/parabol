import type {ToggleMCPEnabledPayloadResolvers} from '../resolverTypes'

const ToggleMCPEnabledPayload: ToggleMCPEnabledPayloadResolvers = {
  __isTypeOf: ({orgId}) => !!orgId
}

export default ToggleMCPEnabledPayload
