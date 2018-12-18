import {GraphQLNonNull, GraphQLString, GraphQLID, GraphQLBoolean, GraphQLObjectType} from 'graphql'
import TeamInvitation from './TeamInvitation'
import {resolveUser} from 'server/graphql/resolvers'
import User from 'server/graphql/types/User'
import TeamInvitationErrorEnum from './TeamInvitationErrorEnum'

const VerifiedInvitationPayload = new GraphQLObjectType({
  name: 'VerifiedInvitationPayload',
  fields: () => ({
    errorType: {
      type: TeamInvitationErrorEnum
    },
    inviterName: {
      type: GraphQLString,
      description:
        'The name of the person that sent the invitation, present if errorType is expired'
    },
    inviterEmail: {
      type: GraphQLString,
      description:
        'The email of the person that send the invitation, present if errorType is expired'
    },
    isGoogle: {
      type: GraphQLBoolean,
      description: 'true if the mx record is hosted by google, else falsy'
    },
    teamInvitation: {
      type: TeamInvitation,
      description: 'The valid invitation'
    },
    teamName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'name of the inviting team'
    },
    userId: {
      type: GraphQLID,
      description: 'The userId of the invitee, if already a parabol user'
    },
    user: {
      type: User,
      description: 'The invitee, if already a parabol user, present if errorType is null',
      resolve: resolveUser
    }
  })
})

export default VerifiedInvitationPayload
