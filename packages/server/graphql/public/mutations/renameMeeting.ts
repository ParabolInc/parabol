import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import linkify from 'parabol-client/utils/linkify'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import type {MutationResolvers} from '../resolverTypes'

const renameMeeting: MutationResolvers['renameMeeting'] = async (
  _source,
  {name, meetingId},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) {
    throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {teamId} = meeting

  // VALIDATION
  if (name.length < 2 || name.length > 50) {
    throw new GraphQLError('Invalid meeting name', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const links = linkify.match(name)
  if (links) {
    throw new GraphQLError('Name cannot be a hyperlink', {extensions: {code: 'BAD_USER_INPUT'}})
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
