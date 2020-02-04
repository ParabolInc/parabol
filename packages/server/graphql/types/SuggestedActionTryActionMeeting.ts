import {GraphQLNonNull, GraphQLObjectType, GraphQLID} from 'graphql'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import Team from './Team'
import {resolveTeam} from '../resolvers'
import {GQLContext} from '../graphql'

const SuggestedActionTryActionMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionTryActionMeeting',
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
      description: 'The team you should run an action meeting with',
      resolve: resolveTeam
    }
  })
})

export default SuggestedActionTryActionMeeting
