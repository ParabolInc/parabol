import {requireSU} from '../../../utils/authorization'
import {QueryResolvers} from '../resolverTypes'

const pingActionTick: QueryResolvers['pingActionTick'] = async (_source, _args, {authToken}) => {
  requireSU(authToken)
  return 'pong!'
}

export default pingActionTick
