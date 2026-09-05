import type {FixedActivityResolvers} from '../resolverTypes'

const FixedActivity: FixedActivityResolvers = {
  __isTypeOf: ({type}) => type === 'action'
}

export default FixedActivity
