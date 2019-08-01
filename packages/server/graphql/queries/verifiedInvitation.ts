import dns, {MxRecord} from 'dns'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import rateLimit from '../rateLimit'
import VerifiedInvitationPayload from '../types/VerifiedInvitationPayload'
import getRethink from '../../database/rethinkDriver'
import promisify from 'es6-promisify'

const resolveMx = promisify(dns.resolveMx, dns)

const getIsGoogleProvider = async (user: any, email: string) => {
  if (user && user.identities) {
    return !!user.identities.find((identity) => identity.provider === 'google-oauth2')
  }
  const [, domain] = email.split('@')
  let res
  try {
    res = await resolveMx(domain)
  } catch (e) {
    return false
  }
  const [mxRecord] = res as MxRecord[]
  const exchange = (mxRecord && mxRecord.exchange) || ''
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
    const now = new Date()
    const teamInvitation = await r
      .table('TeamInvitation')
      .getAll(token, {index: 'token'})
      .nth(0)
      .default(null)
    if (!teamInvitation) return {errorType: 'notFound'}
    const {email, acceptedAt, expiresAt, invitedBy, teamId} = teamInvitation
    const {team, inviter} = await r({
      team: r.table('Team').get(teamId),
      inviter: r.table('User').get(invitedBy)
    })
    const {meetingId} = team
    const meeting = meetingId ? await r.table('NewMeeting').get(meetingId) : null
    const meetingType = meeting ? meeting.meetingType : null
    if (acceptedAt) {
      return {
        errorType: 'accepted',
        teamName: team.name,
        meetingType,
        inviterName: inviter.preferredName,
        inviterEmail: inviter.email,
        teamInvitation
      }
    }

    if (expiresAt < now) {
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
    const isGoogle = await getIsGoogleProvider(viewer, email)
    return {
      teamName: team.name,
      meetingType,
      inviterName: inviter.preferredName,
      inviterEmail: inviter.email,
      teamInvitation,
      isGoogle,
      userId
    }
  })
}
