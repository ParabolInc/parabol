import {StartTrialSuccessResolvers} from '../resolverTypes'

export type StartTrialSuccessSource = {
  orgId: string
}

const StartTrialSuccess: StartTrialSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default StartTrialSuccess
