import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import isTemplateAvailableToTeam from '../../../../client/shared/isTemplateAvailableToTeam'
import {SubscriptionChannel} from '../../../../client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import switchTeamPromptTemplate from './helpers/switchTeamPromptTemplate'

const updateMeetingTemplate: MutationResolvers['updateMeetingTemplate'] = async (
  _source,
  {meetingId, templateId, applyToSeries, clearResponses},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const [meeting, template] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    dataLoader.get('meetingTemplates').load(templateId)
  ])
  if (!meeting) throw new GraphQLError('Meeting not found', {extensions: {code: 'NOT_FOUND'}})
  const {meetingType, teamId} = meeting
  if (meetingType !== 'retrospective' && meetingType !== 'teamPrompt') {
    throw new GraphQLError('This meeting has no template to change', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (meeting.endedAt) {
    throw new GraphQLError('The meeting has ended', {extensions: {code: 'CONFLICT'}})
  }
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  if (!template || template.type !== meetingType || !isTemplateAvailableToTeam(template, team)) {
    throw new GraphQLError('That template is not available to this team', {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  const series =
    applyToSeries && meeting.meetingSeriesId
      ? await dataLoader.get('meetingSeries').load(meeting.meetingSeriesId)
      : null
  const seriesIdToUpdate = series && !series.cancelledAt ? series.id : null

  if (meeting.meetingType === 'teamPrompt') {
    await switchTeamPromptTemplate({
      meeting,
      templateId,
      templateName: template.name,
      seriesIdToUpdate,
      clearResponses: !!clearResponses,
      dataLoader,
      operationId
    })
    await updateMeetingTemplateLastUsedAt(templateId, teamId)
  } else {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    if (reflections.length > 0) {
      throw new GraphQLError('Cannot change template after reflections have been created', {
        extensions: {code: 'CONFLICT'}
      })
    }
    const reflectPhase = getPhase(meeting.phases, 'reflect')
    if (reflectPhase.stages.every((stage) => stage.isComplete)) {
      throw new GraphQLError('Cannot change template after reflection phase has been completed', {
        extensions: {code: 'CONFLICT'}
      })
    }
    await getKysely()
      .transaction()
      .execute(async (trx) => {
        await trx
          .updateTable('NewMeeting')
          .set({templateId, templateChosenAt: sql`now()`})
          .where('id', '=', meetingId)
          .execute()
        if (seriesIdToUpdate) {
          await trx
            .updateTable('MeetingSeries')
            .set({templateId})
            .where('id', '=', seriesIdToUpdate)
            .execute()
        }
      })
  }
  dataLoader.clearAll(['newMeetings', 'meetingSeries'])

  const data = {meetingId}
  publish(SubscriptionChannel.MEETING, meetingId, 'UpdateMeetingTemplateSuccess', data, subOptions)
  return data
}

export default updateMeetingTemplate
