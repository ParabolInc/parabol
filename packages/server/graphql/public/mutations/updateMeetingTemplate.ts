import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateMeetingTemplate: MutationResolvers['updateMeetingTemplate'] = async (
  _source,
  {meetingId, templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (!('templateId' in meeting)) return {error: {message: 'Meeting has no template'}}
  if (!isTeamMember(authToken, meeting.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  if (reflections.length > 0) {
    return standardError(new Error('Cannot change template after reflections have been created'), {
      userId: viewerId
    })
  }
  const reflectPhase = getPhase(meeting.phases, 'reflect')
  const hasCompletedReflectPhase = reflectPhase.stages.every((stage) => stage.isComplete)
  if (hasCompletedReflectPhase) {
    return standardError(
      new Error('Cannot change template after reflection phase has been completed'),
      {
        userId: viewerId
      }
    )
  }
  await pg.updateTable('NewMeeting').set({templateId}).where('id', '=', meetingId).execute()
  meeting.templateId = templateId

  const data = {meetingId, templateId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingTemplateSuccess', data, subOptions)
  return data
}

export default updateMeetingTemplate
