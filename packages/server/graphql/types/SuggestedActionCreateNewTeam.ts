import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {TSuggestedActionTypeEnum} from './SuggestedActionTypeEnum'

const SuggestedActionCreateNewTeam = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionCreateNewTeam',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  isTypeOf: ({type}: {type: TSuggestedActionTypeEnum}) => type === 'createNewTeam',
  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionCreateNewTeam
