import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import {MutationResolvers} from '../resolverTypes'

const autogroup: MutationResolvers['autogroup'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const pg = getKysely()
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [meeting, reflections, reflectionGroups, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
  }

  const {autogroupReflectionGroups, teamId} = meeting
  if (!autogroupReflectionGroups) {
    return standardError(new Error('No autogroup reflection groups found'), {userId: viewerId})
  }

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  const resetReflectionGroups = reflectionGroups.map((group) => {
    const {id, title} = group
    const reflectionIds = reflections
      .filter(({reflectionGroupId}) => reflectionGroupId === id)
      .map(({id}) => id)
    return {
      groupTitle: title ?? '',
      reflectionIds
    }
  })

  await Promise.all([
    ...autogroupReflectionGroups.flatMap((group) => {
      const {groupTitle, reflectionIds} = group
      const reflectionsInGroup = reflections.filter(({id}) => reflectionIds.includes(id))
      const firstReflectionInGroup = reflectionsInGroup[0]
      if (!firstReflectionInGroup) {
        return []
      }
      return reflectionsInGroup.map((reflection) =>
        addReflectionToGroup(
          reflection.id,
          firstReflectionInGroup.reflectionGroupId,
          context,
          groupTitle
        )
      )
    }),
    pg
      .updateTable('NewMeeting')
      .set({resetReflectionGroups: JSON.stringify(resetReflectionGroups)})
      .where('id', '=', meetingId)
      .execute()
  ])
  meeting.resetReflectionGroups = resetReflectionGroups
  analytics.suggestGroupsClicked(viewer, meetingId, teamId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AutogroupSuccess', data, subOptions)
  return data
}

export default autogroup
