import {GraphQLID, GraphQLBoolean, GraphQLObjectType} from 'graphql'
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
    isGoogle: {
      type: GraphQLBoolean,
      description: 'true if the mx record is hosted by google, else false'
    },
    teamInvitation: {
      type: TeamInvitation,
      description: 'The valid invitation'
    },
    userId: {
      type: GraphQLID,
      description: 'The userId of the invitee, if already a parabol user'
    },
    user: {
      type: User,
      description: 'The invitee, if already a parabol user',
      resolve: resolveUser
    }
  })
})

export default VerifiedInvitationPayload
