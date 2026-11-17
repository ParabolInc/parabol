import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {legacyAutogroups} from '../../../metricsHandler'
import publish from '../../../utils/publish'
import type {GQLContext} from '../../graphql'
import applySuggestedGroupsToMeeting from '../../mutations/helpers/applySuggestedGroupsToMeeting'
import type {MutationResolvers} from '../resolverTypes'

/**
 * @deprecated Superseded by generateSuggestedGroups, which can also group by embedding similarity,
 * take a custom instruction, and keep groups within a column. Kept so clients loaded before the
 * SuggestedGroups release keep working; delete once those have drained.
 */
const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const {dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)

  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }

  if (meeting.meetingType !== 'retrospective') {
    throw new GraphQLError('Incorrect meeting type', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const {autogroupReflectionGroups} = meeting
  if (!autogroupReflectionGroups) {
    throw new GraphQLError('No autogroup reflection groups found', {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  meeting.resetReflectionGroups = await applySuggestedGroupsToMeeting(
    meetingId,
    autogroupReflectionGroups,
    context
  )
  legacyAutogroups.inc()
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AutogroupSuccess', data, subOptions)
  return data
}

export default autogroup
