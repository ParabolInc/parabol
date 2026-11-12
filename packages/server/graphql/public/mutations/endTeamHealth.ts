import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import safeEndTeamHealth from '../../mutations/helpers/safeEndTeamHealth'
import type {MutationResolvers} from '../resolverTypes'

const endTeamHealth: MutationResolvers['endTeamHealth'] = async (
  _source,
  {meetingId},
  context,
  info
) => {
  const {authToken, dataLoader} = context
  const viewerId = getUserId(authToken)

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting)
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND', userId: viewerId}})
  if (meeting.meetingType !== 'teamHealth') {
    throw new GraphQLError('Meeting type is not teamHealth', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const res = await safeEndTeamHealth({meeting, context, info})
  if ('error' in res) throw new GraphQLError(res.error.message, {extensions: {code: 'CONFLICT'}})
  return res
}

export default endTeamHealth
