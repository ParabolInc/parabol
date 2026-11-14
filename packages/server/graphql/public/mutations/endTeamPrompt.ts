import {GraphQLError} from 'graphql'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import type {MutationResolvers} from '../resolverTypes'

const endTeamPrompt: MutationResolvers['endTeamPrompt'] = async (
  _source,
  {meetingId},
  context,
  info
) => {
  const {dataLoader} = context

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.meetingType !== 'teamPrompt') {
    throw new GraphQLError('Meeting type is not teamPrompt', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const res = await safeEndTeamPrompt({meeting, context, info})
  if ('error' in res) throw new GraphQLError(res.error.message, {extensions: {code: 'CONFLICT'}})
  return res
}

export default endTeamPrompt
