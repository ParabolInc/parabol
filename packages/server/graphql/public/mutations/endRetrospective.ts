import {GraphQLError} from 'graphql'
import safeEndRetrospective from '../../mutations/helpers/safeEndRetrospective'
import type {MutationResolvers} from '../resolverTypes'

const endRetrospective: MutationResolvers['endRetrospective'] = async (
  _source,
  {meetingId},
  context,
  info
) => {
  const {dataLoader} = context

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {endedAt} = meeting

  // VALIDATION
  if (endedAt) throw new GraphQLError('Meeting already ended', {extensions: {code: 'CONFLICT'}})

  // RESOLUTION
  const res = await safeEndRetrospective({meeting, context, info})
  return res
}

export default endRetrospective
