import {QueryResolvers} from '../resolverTypes'

const pingActionTick: QueryResolvers['pingActionTick'] = async (_source, _args, {authToken}) => {
  return 'pong!'
}

export default pingActionTick
