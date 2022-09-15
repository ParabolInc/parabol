import {ToggleSummaryEmailSuccessResolvers} from '../resolverTypes'

export type ToggleSummaryEmailSuccessSource = {
  id: string
}

const ToggleSummaryEmailSuccess: ToggleSummaryEmailSuccessResolvers = {
  successField: async ({id}, _args, {dataLoader}) => {
    return true
  }
}

export default ToggleSummaryEmailSuccess
