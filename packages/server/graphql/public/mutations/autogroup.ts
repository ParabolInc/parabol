import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
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
  const r = await getRethink()
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [meeting, reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  const {meetingType, autogroupReflectionGroups, teamId} = meeting as MeetingRetrospective
  if (!autogroupReflectionGroups) {
    return standardError(new Error('No autogroup reflection groups found'), {userId: viewerId})
  }

  if (meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
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
  await r.table('NewMeeting').get(meetingId).update({resetReflectionGroups}).run()

  await Promise.all(
    autogroupReflectionGroups.flatMap((group) => {
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
    })
  )

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'AutogroupSuccess', data, subOptions)
  return data
}

export default autogroup
