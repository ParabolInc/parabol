import type {StartTrialPayloadResolvers} from '../resolverTypes'

export type StartTrialPayloadSource = {
  orgId: string
}

const StartTrialPayload: StartTrialPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default StartTrialPayload
