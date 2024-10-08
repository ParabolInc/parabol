import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import addReflectionToGroup from '../../mutations/helpers/updateReflectionLocation/addReflectionToGroup'
import removeReflectionFromGroup from '../../mutations/helpers/updateReflectionLocation/removeReflectionFromGroup'
import {MutationResolvers} from '../resolverTypes'

type ResetGroupsMapper = {
  [newReflectionGroupId: string]: {
    reflectionIds: string[]
    groupTitle: string
  }
}

const resetReflectionGroups: MutationResolvers['resetReflectionGroups'] = async (
  _source,
  {meetingId}: {meetingId: string},
  context: GQLContext
) => {
  const pg = getKysely()
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)
  const [meeting, viewer] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!meeting) {
    return standardError(new Error('Meeting not found'), {userId: viewerId})
  }

  if (!isTeamMember(authToken, meeting.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  if (meeting.meetingType !== 'retrospective') {
    return standardError(new Error('Incorrect meeting type'), {userId: viewerId})
  }

  const {resetReflectionGroups, teamId} = meeting
  if (!resetReflectionGroups) {
    return standardError(new Error('No reset reflection groups found'), {userId: viewerId})
  }

  const resetGroupsMapper: ResetGroupsMapper = {}

  for (const group of resetReflectionGroups) {
    const {reflectionIds, groupTitle} = group
    const newReflectionGroupIds = await Promise.all(
      reflectionIds.map((reflectionId) => removeReflectionFromGroup(reflectionId, context))
    )
    const newReflectionGroupId = newReflectionGroupIds[0]
    if (!newReflectionGroupId) continue
    resetGroupsMapper[newReflectionGroupId] = {reflectionIds, groupTitle}
  }

  await Promise.all(
    Object.entries(resetGroupsMapper)
      .map(([newReflectionGroupId, {reflectionIds, groupTitle}]) => {
        return reflectionIds.map((reflectionId) => {
          return addReflectionToGroup(reflectionId, newReflectionGroupId, context, groupTitle)
        })
      })
      .flat()
  )

  await pg
    .updateTable('NewMeeting')
    .set({resetReflectionGroups: null})
    .where('id', '=', meetingId)
    .execute()
  meeting.resetReflectionGroups = null
  analytics.resetGroupsClicked(viewer, meetingId, teamId)
  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'ResetReflectionGroupsSuccess', data, subOptions)
  return data
}

export default resetReflectionGroups
