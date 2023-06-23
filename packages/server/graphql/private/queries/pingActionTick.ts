import {QueryResolvers} from '../resolverTypes'

const pingActionTick: QueryResolvers['pingActionTick'] = async () => {
  return 'pong!'
}

export default pingActionTick
