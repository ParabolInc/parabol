import {GraphQLObjectType} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {GQLContext} from '../graphql'

const SuggestedActionCreateNewTeam = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionCreateNewTeam',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionCreateNewTeam
