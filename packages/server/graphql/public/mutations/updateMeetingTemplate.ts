import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateMeetingTemplate: MutationResolvers['updateMeetingTemplate'] = async (
  _source,
  {meetingId, templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingRetrospective
  if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
  if (!isTeamMember(authToken, meeting.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  await r.table('NewMeeting').get(meetingId).update({templateId}).run()
  meeting.templateId = templateId

  const data = {meetingId, templateId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingTemplateSuccess', data, subOptions)
  return data
}

export default updateMeetingTemplate
