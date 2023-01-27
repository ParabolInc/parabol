import {NotifyTeamsLimitExceededResolvers} from '../resolverTypes'

const NotifyTeamsLimitExceeded: NotifyTeamsLimitExceededResolvers = {
  __isTypeOf: ({type}) => type === 'TEAMS_LIMIT_EXCEEDED',
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').load(orgId)
  }
}

export default NotifyTeamsLimitExceeded
