import dns, {MxRecord} from 'dns'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import {InvitationTokenError} from 'parabol-client/types/constEnums'
import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserByEmail} from '../../postgres/queries/getUsersByEmails'
import IUser from '../../postgres/types/IUser'
import getBestInvitationMeeting from '../../utils/getBestInvitationMeeting'
import getSAMLURLFromEmail from '../../utils/getSAMLURLFromEmail'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import VerifiedInvitationPayload from '../types/VerifiedInvitationPayload'

const getIsGoogleProvider = async (user: IUser | null, email: string) => {
  const identities = user?.identities
  if (identities) {
    return !!identities.find((identity) => identity.type === AuthIdentityTypeEnum.GOOGLE)
  }
  const [, domain] = email.split('@') as [string, string]
  let res
  try {
    res = await dns.promises.resolveMx(domain)
  } catch (e) {
    return false
  }
  const [mxRecord] = res as MxRecord[]
  const exchange = (mxRecord && mxRecord.exchange) || ''
  return exchange.toLowerCase().endsWith('google.com')
}

export default {
  type: new GraphQLNonNull(VerifiedInvitationPayload),
  args: {
    token: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The invitation token'
    }
  },
  resolve: rateLimit({perMinute: 60, perHour: 1800})(
    async (_source: unknown, {token}, {dataLoader}: GQLContext) => {
      const pg = getKysely()
      const now = new Date()
      const teamInvitation = await pg
        .selectFrom('TeamInvitation')
        .selectAll()
        .where('token', '=', token)
        .limit(1)
        .executeTakeFirst()

      if (!teamInvitation) return {errorType: InvitationTokenError.NOT_FOUND}
      const {
        email,
        acceptedAt,
        expiresAt,
        invitedBy,
        meetingId: maybeMeetingId,
        teamId
      } = teamInvitation
      const [team, inviter] = await Promise.all([
        dataLoader.get('teams').loadNonNull(teamId),
        dataLoader.get('users').load(invitedBy)
      ])
      const bestMeeting = await getBestInvitationMeeting(teamId, maybeMeetingId, dataLoader)
      const meetingType = bestMeeting?.meetingType ?? null
      const meetingId = bestMeeting?.id ?? null
      const meetingName = bestMeeting?.name ?? null

      // if the inviter is not in our system anymore, their invites should be expired, too
      if (!inviter) {
        return {
          errorType: InvitationTokenError.EXPIRED,
          teamName: team.name
        }
      }

      if (acceptedAt) {
        return {
          errorType: InvitationTokenError.ALREADY_ACCEPTED,
          teamName: team.name,
          meetingName,
          meetingId,
          meetingType,
          inviterName: inviter.preferredName,
          inviterEmail: inviter.email,
          teamInvitation
        }
      }

      if (expiresAt < now) {
        return {
          errorType: InvitationTokenError.EXPIRED,
          teamName: team.name,
          inviterName: inviter.preferredName,
          inviterEmail: inviter.email
        }
      }

      const viewer = await getUserByEmail(email)
      const userId = viewer?.id ?? null
      const ssoURL = await getSAMLURLFromEmail(email, dataLoader, true)
      const isGoogle = await getIsGoogleProvider(viewer, email)
      return {
        ssoURL,
        teamName: team.name,
        meetingType,
        inviterName: inviter.preferredName,
        inviterEmail: inviter.email,
        teamInvitation,
        isGoogle,
        userId
      }
    }
  )
}
