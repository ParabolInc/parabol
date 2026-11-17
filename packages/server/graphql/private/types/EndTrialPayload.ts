import type {EndTrialPayloadResolvers} from '../resolverTypes'

export type EndTrialPayloadSource = {
  orgId: string
  trialStartDate: Date
}

const EndTrialPayload: EndTrialPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default EndTrialPayload
