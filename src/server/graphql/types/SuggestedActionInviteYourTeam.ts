import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import Team from './Team'

const SuggestedActionInviteYourTeam = new GraphQLObjectType({
  name: 'SuggestedActionInviteYourTeam',
  description: 'a suggestion to invite others to your team',
  interfaces: () => [SuggestedAction],
  fields: () => ({
    ...suggestedActionInterfaceFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId that we suggest you should invite people to'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team you should invite people to'
    }
  })
})

export default SuggestedActionInviteYourTeam
