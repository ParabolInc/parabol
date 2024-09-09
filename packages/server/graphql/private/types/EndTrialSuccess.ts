import {EndTrialSuccessResolvers} from '../resolverTypes'

export type EndTrialSuccessSource = {
  orgId: string
  trialStartDate: Date
}

const EndTrialSuccess: EndTrialSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default EndTrialSuccess
