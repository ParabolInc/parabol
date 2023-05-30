import {FixedActivityResolvers} from '../resolverTypes'

const FixedActivity: FixedActivityResolvers = {
  __isTypeOf: ({type}) => type === 'teamPrompt' || type === 'action'
}

export default FixedActivity
