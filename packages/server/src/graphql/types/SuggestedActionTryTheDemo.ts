import {GraphQLObjectType} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {GQLContext} from '../graphql'

const SuggestedActionTryTheDemo = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionTryTheDemo',
  description: 'a suggestion to invite others to your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionTryTheDemo
