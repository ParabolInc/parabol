import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateMaxPhaseIndex: MutationResolvers['updateMaxPhaseIndex'] = async (
  _source,
  {meetingId, currentPhaseIndex},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION

  // RESOLUTION
  const data = {meetingId}
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({
      maxPhaseIndex: currentPhaseIndex
    })
    .run()
  dataLoader.get('newMeetings').clear(meetingId)

  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMaxPhaseIndexSuccess', data, subOptions)
  return data
}

export default updateMaxPhaseIndex
