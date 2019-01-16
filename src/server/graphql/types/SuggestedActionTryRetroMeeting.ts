import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import Team from './Team'

const SuggestedActionTryRetroMeeting = new GraphQLObjectType({
  name: 'SuggestedActionTryRetroMeeting',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'fk'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team you should run a retro with'
    }
  })
})

export default SuggestedActionTryRetroMeeting
