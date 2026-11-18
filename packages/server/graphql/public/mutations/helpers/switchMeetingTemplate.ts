import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import isTemplateAvailableToTeam from '../../../../../client/shared/isTemplateAvailableToTeam'
import getKysely from '../../../../postgres/getKysely'
import updateMeetingTemplateLastUsedAt from '../../../../postgres/queries/updateMeetingTemplateLastUsedAt'
import type {AnyMeeting} from '../../../../postgres/types/Meeting'
import getPhase from '../../../../utils/getPhase'
import type {DataLoaderWorker} from '../../../graphql'
import switchTeamPromptTemplate from './switchTeamPromptTemplate'

// Checks a template can replace the meeting's, before anything is written
export const getSwitchableTemplate = async (
  meeting: AnyMeeting,
  templateId: string,
  dataLoader: DataLoaderWorker
) => {
  const {meetingType, teamId} = meeting
  if (meetingType !== 'retrospective' && meetingType !== 'teamPrompt') {
    throw new GraphQLError('This meeting has no template to change', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const [template, team] = await Promise.all([
    dataLoader.get('meetingTemplates').load(templateId),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  if (!template || template.type !== meetingType || !isTemplateAvailableToTeam(template, team)) {
    throw new GraphQLError('That template is not available to this team', {
      extensions: {code: 'NOT_FOUND'}
    })
  }
  return template
}

interface Options {
  meeting: AnyMeeting
  template: {id: string; name: string}
  applyToSeries: boolean
  clearTeamPromptResponses: boolean
  dataLoader: DataLoaderWorker
  operationId: string
}

const switchMeetingTemplate = async (options: Options) => {
  const {meeting, template, applyToSeries, clearTeamPromptResponses, dataLoader, operationId} =
    options
  const {id: meetingId, teamId, meetingSeriesId} = meeting
  const {id: templateId} = template
  const series =
    applyToSeries && meetingSeriesId
      ? await dataLoader.get('meetingSeries').load(meetingSeriesId)
      : null
  const seriesIdToUpdate = series && !series.cancelledAt ? series.id : null

  if (meeting.meetingType === 'teamPrompt') {
    await switchTeamPromptTemplate({
      meeting,
      templateId,
      templateName: template.name,
      seriesIdToUpdate,
      clearTeamPromptResponses,
      dataLoader,
      operationId
    })
    await updateMeetingTemplateLastUsedAt(templateId, teamId)
  } else {
    const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    const reflectPhase = getPhase(meeting.phases, 'reflect')
    const isReflectDone = reflectPhase.stages.every((stage) => stage.isComplete)
    // once reflections exist they belong to this template's prompts, so only the series can change
    const canChangeMeeting = reflections.length === 0 && !isReflectDone
    if (!canChangeMeeting && !seriesIdToUpdate) {
      throw new GraphQLError(
        reflections.length > 0
          ? 'Cannot change template after reflections have been created'
          : 'Cannot change template after reflection phase has been completed',
        {extensions: {code: 'CONFLICT'}}
      )
    }
    await getKysely()
      .transaction()
      .execute(async (trx) => {
        if (canChangeMeeting) {
          await trx
            .updateTable('NewMeeting')
            .set({templateId, templateChosenAt: sql`now()`})
            .where('id', '=', meetingId)
            .execute()
        }
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
}

export default switchMeetingTemplate
