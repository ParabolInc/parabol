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
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {userId: viewerId}})
  if (meeting.meetingType !== 'teamHealth') {
    throw new GraphQLError('Meeting type is not teamHealth')
  }
  const res = await safeEndTeamHealth({meeting, context, info})
  if ('error' in res) throw new GraphQLError(res.error.message)
  return res
}

export default endTeamHealth
