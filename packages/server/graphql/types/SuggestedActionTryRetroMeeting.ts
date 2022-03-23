import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {TSuggestedActionTypeEnum} from './SuggestedActionTypeEnum'
import Team from './Team'

const SuggestedActionTryRetroMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionTryRetroMeeting',
  description: 'a suggestion to try a retro with your team',
  interfaces: () => [SuggestedAction],
  isTypeOf: ({type}: {type: TSuggestedActionTypeEnum}) => type === 'tryRetroMeeting',
  fields: () => ({
    ...suggestedActionInterfaceFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'fk'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team you should run a retro with',
      resolve: resolveTeam
    }
  })
})

export default SuggestedActionTryRetroMeeting
