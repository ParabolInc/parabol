import {GraphQLObjectType} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'

const SuggestedActionCreateNewTeam = new GraphQLObjectType({
  name: 'SuggestedActionCreateNewTeam',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields()
  })
})

export default SuggestedActionCreateNewTeam
