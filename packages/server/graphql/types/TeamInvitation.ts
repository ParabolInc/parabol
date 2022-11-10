import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import User from './User'

const TeamInvitation = new GraphQLObjectType<any, GQLContext>({
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
    acceptedBy: {
      type: GraphQLID,
      description: 'null if not accepted, else the userId that accepted the invitation'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invitation was created'
    },
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The email of the invitee'
    },
    expiresAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the invitation expires. Changes when team is archived.'
    },
    invitedBy: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person that sent the invitation'
    },
    inviter: {
      type: new GraphQLNonNull(User),
      description: 'The userId of the person that sent the invitation',
      resolve: async ({invitedBy}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(invitedBy)
      }
    },
    // no meeting because we don't trust the TeamInvite owner yet
    meetingId: {
      type: GraphQLID,
      description: 'the meetingId that the invite was generated for'
    },
    // Don't allow trusted resolvers to run on this objects since it's a payload of an untrusted user
    // TODO this should be the job of the Team object to protect from non-team reqs
    // team: {
    //   type: Team,
    //   resolve: resolveTeam
    // },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team invited to'
    },
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: '48-byte hex encoded random string'
      // access to the notification implies access to the token
    }
  })
})

export default TeamInvitation
