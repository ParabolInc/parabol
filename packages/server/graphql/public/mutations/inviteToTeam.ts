import {GraphQLError} from 'graphql'
import inviteToTeamHelper, {assertInviteeCount} from '../../mutations/helpers/inviteToTeamHelper'
import type {MutationResolvers} from '../resolverTypes'

const inviteToTeam: MutationResolvers['inviteToTeam'] = async (
  _source,
  {invitees, meetingId, teamId},
  context
) => {
  const {dataLoader} = context

  // VALIDATION
  assertInviteeCount(invitees)
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
