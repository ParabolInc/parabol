import {NotifyTeamsLimitExceededResolvers} from '../resolverTypes'

const NotifyTeamsLimitExceeded: NotifyTeamsLimitExceededResolvers = {
  __isTypeOf: ({type}) => type === 'TEAMS_LIMIT_EXCEEDED'
}

export default NotifyTeamsLimitExceeded
