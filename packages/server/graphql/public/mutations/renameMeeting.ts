import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import linkify from 'parabol-client/utils/linkify'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'

const renameMeeting: MutationResolvers['renameMeeting'] = async (
  _source,
  {name, meetingId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    return {error: {message: 'Meeting not found'}}
  }
  const {facilitatorUserId, teamId} = meeting
  const viewerId = getUserId(authToken)
  if (viewerId !== facilitatorUserId) {
    return {error: {message: 'Only the facilitator can change the meeting name'}}
  }

  // VALIDATION
  if (name.length < 2 || name.length > 50) {
    return {error: {message: 'Invalid meeting name'}}
  }

  const links = linkify.match(name)
  if (links) {
    return standardError(new Error('Name cannot be a hyperlink'), {userId: viewerId})
  }

  // RESOLUTION
  meeting.name = name
  await getKysely().updateTable('NewMeeting').set({name}).where('id', '=', meetingId).execute()
  const data = {meetingId}
  IntegrationNotifier.updateMeeting?.(dataLoader, meetingId, teamId).catch(() => {
    // The message may not exist
  })
  publish(SubscriptionChannel.TEAM, teamId, 'RenameMeetingSuccess', data, subOptions)

  return data
}

export default renameMeeting
