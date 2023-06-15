import {FixedActivityResolvers} from '../resolverTypes'

const FixedActivity: FixedActivityResolvers = {
  __isTypeOf: ({type}) => type === 'teamPrompt' || type === 'action',
  isRecommended: () => true
}

export default FixedActivity
