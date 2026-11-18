import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import switchMeetingTemplate, {getSwitchableTemplate} from './helpers/switchMeetingTemplate'

const updateMeetingTemplate: MutationResolvers['updateMeetingTemplate'] = async (
  _source,
  {meetingId, templateId, applyToSeries, clearTeamPromptResponses},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  if (meeting.endedAt) {
    throw new GraphQLError('The meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  const template = await getSwitchableTemplate(meeting, templateId, dataLoader)
  await switchMeetingTemplate({
    meeting,
    template,
    applyToSeries: !!applyToSeries,
    clearTeamPromptResponses: !!clearTeamPromptResponses,
    dataLoader,
    operationId
  })

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingTemplatePayload', data, subOptions)
  return data
}

export default updateMeetingTemplate
