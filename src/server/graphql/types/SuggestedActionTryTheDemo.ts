import {GraphQLObjectType} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'

const SuggestedActionTryTheDemo = new GraphQLObjectType({
  name: 'SuggestedActionTryTheDemo',
  description: 'a suggestion to invite others to your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionTryTheDemo
