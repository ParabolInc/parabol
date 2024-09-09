import {FixedActivityResolvers} from '../resolverTypes'

const FixedActivity: FixedActivityResolvers = {
  __isTypeOf: ({type}) => type === 'teamPrompt' || type === 'action',
  isRecommended: ({id}) => (id === 'action' ? false : true)
}

export default FixedActivity
