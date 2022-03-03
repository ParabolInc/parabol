import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {TSuggestedActionTypeEnum} from './SuggestedActionTypeEnum'
import Team from './Team'

const SuggestedActionTryActionMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionTryActionMeeting',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  isTypeOf: ({type}: {type: TSuggestedActionTypeEnum}) => type === 'tryActionMeeting',
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
