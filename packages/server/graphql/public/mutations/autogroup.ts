import {SubscriptionChannel} from '../../../../client/types/constEnums'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
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
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {
      userId: viewerId
    })
  }

  const {autogroupReflectionGroups, teamId} = meeting
  if (!autogroupReflectionGroups) {
    return standardError(new Error('No autogroup reflection groups found'), {
      userId: viewerId
    })
  }

  meeting.resetReflectionGroups = await applySuggestedGroupsToMeeting(
    meetingId,
    autogroupReflectionGroups,
    context
  )
  analytics.suggestGroupsClicked(viewer, meetingId, teamId, {
    mode: 'ai',
    source: 'legacyAutogroup',
    sameColumnOnly: false,
    suggestedGroupCount: autogroupReflectionGroups.length
  })
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AutogroupSuccess', data, subOptions)
  return data
}

export default autogroup
