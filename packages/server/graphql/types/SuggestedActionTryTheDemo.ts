import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {TSuggestedActionTypeEnum} from './SuggestedActionTypeEnum'

const SuggestedActionTryTheDemo = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionTryTheDemo',
  description: 'a suggestion to invite others to your team',
  interfaces: () => [SuggestedAction],
  isTypeOf: ({type}: {type: TSuggestedActionTypeEnum}) => type === 'tryTheDemo',

  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionTryTheDemo
