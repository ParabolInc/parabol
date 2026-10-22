import {GraphQLError} from 'graphql'
import {MAX_TEAM_INVITEES, normalizeInviteeEmail} from '../../../../client/shared/teamInviteeEmail'
import inviteToTeamHelper from '../../mutations/helpers/inviteToTeamHelper'
import type {MutationResolvers} from '../resolverTypes'

const inviteToTeam: MutationResolvers['inviteToTeam'] = async (
  _source,
  {invitees, meetingId, teamId},
  context
) => {
  const {dataLoader} = context

  // VALIDATION
  const inviteeCount = new Set(invitees.map(normalizeInviteeEmail)).size
  if (inviteeCount > MAX_TEAM_INVITEES) {
    const excess = inviteeCount - MAX_TEAM_INVITEES
    throw new GraphQLError(
      `You can invite up to ${MAX_TEAM_INVITEES} people at a time. Remove ${excess} and try again.`,
      {extensions: {code: 'TOO_MANY_INVITEES'}}
    )
  }
  if (meetingId) {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting?.teamId !== teamId) {
      throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
    }
  }

  // RESOLUTION
  const outcome = await inviteToTeamHelper(invitees, teamId, meetingId, context)
  if ('refusal' in outcome) {
    const {code, message} = outcome.refusal
    throw new GraphQLError(message, {extensions: {code}})
  }
  return {teamId, ...outcome}
}

export default inviteToTeam
