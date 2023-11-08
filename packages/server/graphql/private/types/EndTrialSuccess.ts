import Organization from '../../../database/types/Organization'
import {EndTrialSuccessResolvers} from '../resolverTypes'

export type EndTrialSuccessSource = {
  organization: Organization
  trialStartDate: Date
}

const EndTrialSuccess: EndTrialSuccessResolvers = {}

export default EndTrialSuccess
