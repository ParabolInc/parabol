import {StartTrialSuccessResolvers} from '../resolverTypes'

export type StartTrialSuccessSource = {
  success: boolean
}

const StartTrialSuccess: StartTrialSuccessResolvers = {
  success: async (_source, _args, _context) => {
    return true
  }
}

export default StartTrialSuccess
