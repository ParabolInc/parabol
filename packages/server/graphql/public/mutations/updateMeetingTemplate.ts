import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateMeetingTemplate: MutationResolvers['updateMeetingTemplate'] = async (
  _source,
  {meetingId, templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  await r.table('NewMeeting').get(meetingId).update({templateId}).run()

  // RESOLUTION
  const data = {meetingId, templateId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingTemplateSuccess', data, subOptions)
  return data
}

export default updateMeetingTemplate
