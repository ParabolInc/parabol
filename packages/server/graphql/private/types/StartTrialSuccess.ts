import Organization from '../../../database/types/Organization'
import {StartTrialSuccessResolvers} from '../resolverTypes'

export type StartTrialSuccessSource = {
  organization: Organization
}

const StartTrialSuccess: StartTrialSuccessResolvers = {}

export default StartTrialSuccess
