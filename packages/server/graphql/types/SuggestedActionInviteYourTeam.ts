import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTeam} from '../resolvers'
import SuggestedAction, {suggestedActionInterfaceFields} from './SuggestedAction'
import {TSuggestedActionTypeEnum} from './SuggestedActionTypeEnum'
import Team from './Team'

const SuggestedActionInviteYourTeam = new GraphQLObjectType<any, GQLContext>({
  name: 'SuggestedActionInviteYourTeam',
  description: 'a suggestion to invite others to your team',
  interfaces: () => [SuggestedAction],
  isTypeOf: ({type}: {type: TSuggestedActionTypeEnum}) => type === 'inviteYourTeam',
  fields: () => ({
    ...suggestedActionInterfaceFields(),
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The teamId that we suggest you should invite people to'
    },
    team: {
      type: new GraphQLNonNull(Team),
      description: 'The team you should invite people to',
      resolve: resolveTeam
    }
  })
})

export default SuggestedActionInviteYourTeam
