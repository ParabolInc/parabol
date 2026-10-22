import crypto from 'crypto'
import type {GraphQLErrorExtensions} from 'graphql'
import ms from 'ms'
import util from 'util'
import {
  isValidInviteeEmail,
  normalizeInviteeEmail
} from '../../../../client/shared/teamInviteeEmail'
import {SubscriptionChannel, Threshold} from '../../../../client/types/constEnums'
import {EMAIL_CORS_OPTIONS} from '../../../../client/types/cors'
import makeAppURL from '../../../../client/utils/makeAppURL'
import plural from '../../../../client/utils/plural'
import appOrigin from '../../../appOrigin'
import getMailManager from '../../../email/getMailManager'
import teamInviteEmailCreator from '../../../email/teamInviteEmailCreator'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import getBestInvitationMeeting from '../../../utils/getBestInvitationMeeting'
import publish from '../../../utils/publish'
import type {GQLContext} from '../../graphql'
import {isEmailOnApprovedList} from '../../public/mutations/helpers/getIsEmailApprovedByOrg'
import type {TeamInvitee} from '../../public/resolverTypes'

const randomBytes = util.promisify(crypto.randomBytes)

// A team where no one has accepted any of its first 100 invitations is probably not a real team
const MAX_UNACCEPTED_INVITATIONS = 100
// Long enough to swallow double-submits and impatient retries, short enough to resend a lost email today
const REINVITE_COOLDOWN = ms('10m')
const BLOCKED_DOMAINS = ['tempmail.cn', 'qq.com']

export type InviteToTeamOutcome = {
  invitees: TeamInvitee[]
  removedSuggestedActionId: string | undefined
}

export type InviteToTeamRefusal = {
  refusal: {code: NonNullable<GraphQLErrorExtensions['code']>; message: string}
}

const getBlockedDomain = (email: string) => {
  const domain = email.slice(email.indexOf('@') + 1)
  return BLOCKED_DOMAINS.find(
    (blockedDomain) => domain === blockedDomain || domain.endsWith(`.${blockedDomain}`)
  )
}

const formatInvitedAgo = (invitedAt: Date, now: number) => {
  const minutes = Math.floor((now - invitedAt.getTime()) / ms('1m'))
  return minutes < 1 ? 'just now' : `${minutes} ${plural(minutes, 'minute')} ago`
}

const formatApprovedList = (approvedDomains: string[]) => {
  const shown = approvedDomains.slice(0, 3)
  const hiddenCount = approvedDomains.length - shown.length
  if (hiddenCount > 0) {
    return `${shown.join(', ')}, or ${hiddenCount} other ${plural(hiddenCount, 'domain')}`
  }
  if (shown.length === 1) return shown[0]!
  return `${shown.slice(0, -1).join(', ')} or ${shown.at(-1)}`
}

const refuse = (email: string, status: TeamInvitee['status'], message: string): TeamInvitee => ({
  email,
  status,
  message,
  suggestedEmail: null
})

const inviteToTeamHelper = async (
  invitees: string[],
  teamId: string,
  meetingId: string | null | undefined,
  context: GQLContext
): Promise<InviteToTeamOutcome | InviteToTeamRefusal> => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const now = Date.now()
  const emails = Array.from(new Set(invitees.map(normalizeInviteeEmail)))
  const validEmails = emails.filter(isValidInviteeEmail)
  if (validEmails.length === 0) {
    return {
      invitees: emails.map((email) => refuse(email, 'invalid', 'Not a valid email address.')),
      removedSuggestedActionId: undefined
    }
  }

  const [
    {team, organization, approvedDomains},
    inviter,
    invitationCounts,
    users,
    teamMembers,
    recentInvitations,
    bestMeeting
  ] = await Promise.all([
    dataLoader
      .get('teams')
      .loadNonNull(teamId)
      .then(async (team) => {
        const [organization, approvedDomains] = await Promise.all([
          dataLoader.get('organizations').loadNonNull(team.orgId),
          dataLoader.get('organizationApprovedDomainsByOrgId').load(team.orgId)
        ])
        return {team, organization, approvedDomains}
      }),
    dataLoader.get('users').loadNonNull(viewerId),
    pg
      .selectFrom('TeamInvitation')
      .select(({fn}) => [
        fn.countAll<string>().as('total'),
        fn.count<string>('acceptedAt').as('accepted')
      ])
      .where('teamId', '=', teamId)
      .executeTakeFirstOrThrow(),
    getUsersByEmails(validEmails),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    pg
      .selectFrom('TeamInvitation')
      .select(({fn}) => ['email', fn.max('createdAt').as('lastInvitedAt')])
      .where('teamId', '=', teamId)
      .where('email', 'in', validEmails)
      .where('isMassInvite', '=', false)
      .where('acceptedAt', 'is', null)
      .where('createdAt', '>', new Date(now - REINVITE_COOLDOWN))
      .groupBy('email')
      .execute(),
    getBestInvitationMeeting(teamId, meetingId, dataLoader)
  ])
  const {orgId, name: teamName, isOnboardTeam, createdAt: teamCreatedAt} = team
  const {tier, name: orgName} = organization
  const userByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]))
  const memberUserIds = new Set(teamMembers.map(({userId}) => userId))
  const lastInvitedAtByEmail = new Map(
    recentInvitations.map(({email, lastInvitedAt}) => [email.toLowerCase(), lastInvitedAt])
  )
  // People already in the org skip the approved domains check when they accept, so they skip it here, too
  const offListUsers = approvedDomains.length
    ? users.filter(({email}) => !isEmailOnApprovedList(email, approvedDomains))
    : []
  const offListOrgUsers = await Promise.all(
    offListUsers.map(({id: userId}) =>
      dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
    )
  )
  const offListOrgMemberEmails = new Set(
    offListUsers.filter((_user, idx) => offListOrgUsers[idx]).map(({email}) => email.toLowerCase())
  )

  const getRefusal = (email: string) => {
    if (!isValidInviteeEmail(email)) return refuse(email, 'invalid', 'Not a valid email address.')
    const user = userByEmail.get(email)
    if (user && memberUserIds.has(user.id)) {
      return refuse(email, 'alreadyOnTeam', `Already on ${teamName}.`)
    }
    const blockedDomain = getBlockedDomain(email)
    if (blockedDomain) {
      return refuse(
        email,
        'blockedDomain',
        `Parabol can't send invitations to ${blockedDomain} addresses. Share the invite link instead.`
      )
    }
    const lastInvitedAt = lastInvitedAtByEmail.get(email)
    if (lastInvitedAt) {
      return refuse(
        email,
        'alreadyInvited',
        `Invited ${formatInvitedAgo(lastInvitedAt, now)}. If it hasn't arrived, ask them to check their spam folder or share the invite link.`
      )
    }
    if (
      approvedDomains.length &&
      !isEmailOnApprovedList(email, approvedDomains) &&
      !offListOrgMemberEmails.has(email)
    ) {
      return refuse(
        email,
        'notApproved',
        `${orgName} only accepts ${formatApprovedList(approvedDomains)} addresses. Ask your account admin or support@parabol.co to approve more.`
      )
    }
    return null
  }

  const results = new Map<string, TeamInvitee>()
  const candidates: string[] = []
  emails.forEach((email) => {
    const refusal = getRefusal(email)
    if (refusal) {
      results.set(email, refusal)
    } else {
      candidates.push(email)
    }
  })

  const total = Number(invitationCounts.total)
  const accepted = Number(invitationCounts.accepted)
  if (accepted === 0 && total + candidates.length > MAX_UNACCEPTED_INVITATIONS) {
    const remaining = Math.max(0, MAX_UNACCEPTED_INVITATIONS - total)
    const message =
      remaining > 0
        ? `To prevent spam, a team can have at most ${MAX_UNACCEPTED_INVITATIONS} invitations until someone accepts one. You can invite ${remaining} more ${plural(remaining, 'person', 'people')} now, or share the invite link.`
        : `To prevent spam, this team can't send more invitations until someone accepts one. Share the invite link instead.`
    return {refusal: {code: 'UNACCEPTED_INVITATION_LIMIT', message}}
  }

  const mailManager = getMailManager()
  const validations = await Promise.all(candidates.map((email) => mailManager.validateEmail(email)))
  const deliverableEmails = candidates.filter((email, idx) => {
    const {result, didYouMean} = validations[idx]!
    if (result !== 'undeliverable') return true
    const normalizedSuggestion = didYouMean ? normalizeInviteeEmail(didYouMean) : null
    const suggestedEmail =
      normalizedSuggestion &&
      normalizedSuggestion !== email &&
      isValidInviteeEmail(normalizedSuggestion)
        ? normalizedSuggestion
        : null
    results.set(email, {
      email,
      status: 'undeliverable',
      message: suggestedEmail
        ? `This address can't receive email. Did you mean ${suggestedEmail}?`
        : `This address can't receive email. Check it for typos, or share the invite link instead.`,
      suggestedEmail
    })
    return false
  })

  let removedSuggestedActionId: string | undefined
  if (deliverableEmails.length > 0) {
    const tokens = await Promise.all(
      deliverableEmails.map(async () => (await randomBytes(48)).toString('hex'))
    )
    const expiresAt = new Date(now + Threshold.TEAM_INVITATION_LIFESPAN)
    const invitations = deliverableEmails.map((email, idx) => ({
      id: generateUID(),
      expiresAt,
      email,
      invitedBy: viewerId,
      meetingId: meetingId ?? undefined,
      teamId,
      token: tokens[idx]!,
      isMassInvite: false
    }))
    await pg.insertInto('TeamInvitation').values(invitations).execute()
    const notifications = invitations.flatMap((invitation) => {
      const user = userByEmail.get(invitation.email)
      if (!user) return []
      return {
        id: generateUID(),
        type: 'TEAM_INVITATION' as const,
        userId: user.id,
        invitationId: invitation.id,
        teamId
      }
    })
    if (notifications.length > 0) {
      await pg.insertInto('Notification').values(notifications).execute()
    }

    const searchParams = {
      utm_source: 'invite email',
      utm_medium: 'email',
      utm_campaign: 'invitations'
    }
    const sendResults = await Promise.all(
      invitations.map((invitation) => {
        const user = userByEmail.get(invitation.email)
        const {html, subject, body} = teamInviteEmailCreator({
          appOrigin,
          inviteLink: makeAppURL(appOrigin, `team-invitation/${invitation.token}`, {searchParams}),
          inviteeName: user ? user.preferredName : '',
          inviteeEmail: invitation.email,
          inviterName: inviter.preferredName,
          inviterEmail: inviter.email,
          teamName,
          meeting: bestMeeting,
          corsOptions: EMAIL_CORS_OPTIONS
        })
        return mailManager.sendEmail({
          to: invitation.email,
          html,
          subject,
          body,
          tags: [
            'type:teamInvitation',
            `tier:${tier}`,
            `team:${teamName}:${orgName}:${teamId}:${orgId}`
          ]
        })
      })
    )

    const sentInvitations = invitations.filter((_invitation, idx) => sendResults[idx])
    const failedInvitationIds = invitations
      .filter((_invitation, idx) => !sendResults[idx])
      .map(({id}) => id)
    // A failed send leaves no trace: no dead link, no in-app notification, and nothing to trip the cooldown on retry
    const [suggestedActionId] = await Promise.all([
      isOnboardTeam && sentInvitations.length > 0
        ? removeSuggestedAction(viewerId, 'inviteYourTeam')
        : undefined,
      failedInvitationIds.length > 0
        ? pg.deleteFrom('TeamInvitation').where('id', 'in', failedInvitationIds).execute()
        : undefined
    ])
    removedSuggestedActionId = suggestedActionId

    const inviteTo = meetingId ? 'meeting' : 'team'
    const isInvitedOnCreation = teamCreatedAt.getTime() > now - ms('10s')
    invitations.forEach((invitation, idx) => {
      const success = sendResults[idx]!
      analytics.inviteEmailSent(
        inviter,
        teamId,
        invitation.email,
        userByEmail.has(invitation.email),
        inviteTo,
        success,
        isInvitedOnCreation
      )
      results.set(
        invitation.email,
        success
          ? {email: invitation.email, status: 'sent', message: null, suggestedEmail: null}
          : refuse(
              invitation.email,
              'sendFailed',
              `We couldn't send this email. Try again in a few minutes, or share the invite link.`
            )
      )
    })

    const sentInvitationIds = new Set(sentInvitations.map(({id}) => id))
    notifications.forEach(({id: teamInvitationNotificationId, invitationId, userId}) => {
      if (!sentInvitationIds.has(invitationId)) return
      publish(
        SubscriptionChannel.NOTIFICATION,
        userId,
        'InviteToTeamPayload',
        {teamInvitationNotificationId},
        subOptions
      )
    })
  }

  return {
    invitees: emails.map((email) => results.get(email)!),
    removedSuggestedActionId
  }
}

export default inviteToTeamHelper
