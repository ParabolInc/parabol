import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {isSuperUser} from 'server/utils/authorization'

const TeamInvitation = new GraphQLObjectType({
  name: 'TeamInvitation',
  description: 'An invitation to become a team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique invitation Id'
    },
    acceptedAt: {
      type: GraphQLISO8601Type,
      description: 'null if not accepted, else the datetime the invitation was accepted'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invitation was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email of the invitee'
    },
    invitedBy: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person that sent the invitation'
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team invited to'
    },
    token: {
      type: new GraphQLNonNull(GraphQLString),
      description: '48-byte base64 encoded random string',
      resolve: ({token}, _args, {authToken}) => {
        return isSuperUser(authToken) ? token : null
      }
    }
  })
})

export default TeamInvitation
