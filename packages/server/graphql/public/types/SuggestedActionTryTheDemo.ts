import {SuggestedActionTryTheDemoResolvers} from '../resolverTypes'

const SuggestedActionTryTheDemo: SuggestedActionTryTheDemoResolvers = {
  __isTypeOf: ({type}) => type === 'tryTheDemo'
}

export default SuggestedActionTryTheDemo
