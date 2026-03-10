import type {SetCompanyTeamLimitAtSuccessResolvers} from '../resolverTypes'

export type SetCompanyTeamLimitAtSuccessSource = {
  companyClusterId: number
}

const SetCompanyTeamLimitAtSuccess: SetCompanyTeamLimitAtSuccessResolvers = {
  companyCluster: ({companyClusterId}) => ({id: companyClusterId})
}

export default SetCompanyTeamLimitAtSuccess
