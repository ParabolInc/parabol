import dns from 'dns'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import rateLimit from 'server/graphql/rateLimit'
import VerifiedInvitationPayload from 'server/graphql/types/VerifiedInvitationPayload'
// import {IUser} from 'universal/types/graphql'
import {TEAM_INVITATION_LIFESPAN} from 'server/utils/serverConstants'
import getRethink from 'server/database/rethinkDriver'

const getIsGoogleProvider = (user: any, email: string) => {
  if (user && user.identities) {
    return !!user.identities.find((identity) => identity.provider === 'google-oauth2')
  }
  const [, domain] = email.split('@')
  const [mxRecord] = (dns as any).promises.resolveMx(domain)
  const {exchange} = mxRecord
  return exchange.toLowerCase().endsWith('google.com')
}

export default {
  type: VerifiedInvitationPayload,
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token'
    }
  },
  resolve: rateLimit({perMinute: 10, perHour: 100})(async (_source, {token}) => {
    const r = getRethink()
    const teamInvitation = await r
      .table('TeamInvitation')
      .getAll(token, {index: 'token'})
      .nth(0)
      .default(null)
    if (!teamInvitation) return {errorType: 'notFound'}
    const {email, acceptedAt, createdAt, invitedBy, teamId} = teamInvitation
    if (acceptedAt) {
      return {
        errorType: 'accepted',
        teamInvitation
      }
    }
    const expirationThresh = new Date(Date.now() - TEAM_INVITATION_LIFESPAN)
    const {team, inviter} = await r({
      team: r.table('Team').get(teamId),
      inviter: r.table('User').get(invitedBy)
    })
    if (createdAt < expirationThresh) {
      return {
        errorType: 'expired',
        teamName: team.name,
        inviterName: inviter.preferredName,
        inviterEmail: inviter.email
      }
    }

    const viewer = await r
      .table('User')
      .getAll(email, {index: 'email'})
      .nth(0)
      .default(null)
    const userId = viewer ? viewer.id : null
    const isGoogle = getIsGoogleProvider(viewer, email)
    return {
      inviterName: inviter.preferredName,
      inviterEmail: inviter.email,
      isGoogle,
      teamInvitation,
      teamName: team.name,
      userId
    }
  })
}
