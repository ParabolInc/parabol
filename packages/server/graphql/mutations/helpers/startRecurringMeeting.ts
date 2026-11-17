import {MeetingSettingsThreshold, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RRuleSet} from 'rrule-rust'
import {meetingsStarted} from '../../../metricsHandler'
import type {MeetingSeries} from '../../../postgres/types'
import type {
  AnyMeeting,
  RetrospectiveMeeting,
  TeamHealthMeeting
} from '../../../postgres/types/Meeting'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import logError from '../../../utils/logError'
import publish, {type SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {DataLoaderWorker} from '../../graphql'
import getValidPromptTemplateId from './getValidPromptTemplateId'
import isStartMeetingLocked from './isStartMeetingLocked'
import {IntegrationNotifier} from './notifications/IntegrationNotifier'
import safeCreateRetrospective from './safeCreateRetrospective'
import safeCreateTeamHealth from './safeCreateTeamHealth'
import safeCreateTeamPrompt from './safeCreateTeamPrompt'

type Options = {
  // Whoever kicks off an occurrence early facilitates it, else the series facilitator does
  facilitatorId?: string
  // Defaults to the next occurrence, which is when the recurrence closes the meeting it opened
  scheduledEndTime?: Date | null
  // Set only when a multi-team group opens this occurrence for several teams at once, who must
  // all ask the same questions. Left undefined otherwise, so the meeting rotates its own.
  questionIds?: number[]
}

/*
 * Opens the next meeting of a series, seeding it from the last meeting in the series when possible.
 */
const startRecurringMeeting = async (
  meetingSeries: MeetingSeries,
  dataLoader: DataLoaderWorker,
  subOptions: SubOptions,
  options: Options = {}
): Promise<{meeting: AnyMeeting} | {error: {message: string}}> => {
  const {id: meetingSeriesId, teamId, meetingType} = meetingSeries
  const facilitatorId = options.facilitatorId ?? meetingSeries.facilitatorId

  // AUTH
  const unpaidError = await isStartMeetingLocked(teamId, dataLoader)
  if (unpaidError) return standardError(new Error(unpaidError), {userId: facilitatorId})

  const [lastMeeting, meetingSettings] = await Promise.all([
    dataLoader.get('lastMeetingByMeetingSeriesId').load(meetingSeriesId),
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
  ])

  const scheduledEndTime =
    options.scheduledEndTime !== undefined
      ? options.scheduledEndTime
      : getNextRRuleDate(RRuleSet.parse(meetingSeries.recurrenceRule))

  const meetingName = meetingSeries.title
  const meeting = await (async () => {
    if (meetingSeries.meetingType === 'teamPrompt') {
      const templateId = await getValidPromptTemplateId(
        meetingSeries.templateId,
        'teamPrompt',
        dataLoader
      )
      const meeting = await safeCreateTeamPrompt(meetingName, teamId, facilitatorId, dataLoader, {
        scheduledEndTime,
        meetingSeriesId: meetingSeries.id,
        templateId
      })
      if (!meeting) {
        return {
          error: {
            message: 'Unable to create meeting. Perhaps one was just created?'
          }
        }
      }
      const data = {teamId, meetingId: meeting.id}
      publish(SubscriptionChannel.TEAM, teamId, 'StartTeamPromptSuccess', data, subOptions)
      return meeting
    } else if (meetingSeries.meetingType === 'retrospective') {
      // Field-by-field fallback: prior meeting > MeetingSettings (nullable, may be missing) > defaults.
      // The template checks the series first: a mid-meeting switch changes the series only when asked
      const retroLastMeeting = lastMeeting as RetrospectiveMeeting | null
      const seriesTemplate = meetingSeries.templateId
        ? await dataLoader.get('meetingTemplates').load(meetingSeries.templateId)
        : null
      const seriesTemplateId =
        seriesTemplate?.isActive && seriesTemplate.type === 'retrospective'
          ? seriesTemplate.id
          : null
      const templateId = await getValidPromptTemplateId(
        seriesTemplateId ?? retroLastMeeting?.templateId ?? meetingSettings?.selectedTemplateId,
        'retrospective',
        dataLoader
      )
      const totalVotes =
        retroLastMeeting?.totalVotes ??
        meetingSettings?.totalVotes ??
        MeetingSettingsThreshold.RETROSPECTIVE_TOTAL_VOTES_DEFAULT
      const maxVotesPerGroup =
        retroLastMeeting?.maxVotesPerGroup ??
        meetingSettings?.maxVotesPerGroup ??
        MeetingSettingsThreshold.RETROSPECTIVE_MAX_VOTES_PER_GROUP_DEFAULT
      const disableAnonymity =
        retroLastMeeting?.disableAnonymity ?? meetingSettings?.disableAnonymity ?? false
      if (!retroLastMeeting && (!meetingSettings || !meetingSettings.selectedTemplateId)) {
        logError(new Error('startRecurringMeeting: seeding retrospective with defaults'), {
          tags: {meetingSeriesId, teamId}
        })
      }
      const meeting = await safeCreateRetrospective(
        {
          teamId,
          facilitatorUserId: facilitatorId,
          totalVotes,
          maxVotesPerGroup,
          disableAnonymity,
          templateId,
          videoMeetingURL: undefined,
          meetingSeriesId: meetingSeries.id,
          scheduledEndTime,
          name: meetingName
        },
        dataLoader
      )
      if (!meeting) {
        return {
          error: {
            message: 'Unable to create meeting. Perhaps one was just created?'
          }
        }
      }
      const data = {teamId, meetingId: meeting.id}
      publish(SubscriptionChannel.TEAM, teamId, 'StartRetrospectiveSuccess', data, subOptions)
      return meeting
    } else if (meetingSeries.meetingType === 'teamHealth') {
      // Field-by-field fallback: prior meeting > MeetingSettings (nullable) > default.
      const healthLastMeeting = lastMeeting as TeamHealthMeeting | null
      const templateId =
        healthLastMeeting?.templateId ??
        meetingSettings?.selectedTemplateId ??
        'everythingBagelTemplate'
      const meeting = await safeCreateTeamHealth(
        {
          teamId,
          facilitatorUserId: facilitatorId,
          templateId,
          name: meetingName,
          meetingSeriesId: meetingSeries.id,
          scheduledEndTime,
          questionIds: options.questionIds
        },
        dataLoader
      )
      if (!meeting) {
        return {
          error: {
            message: 'Unable to create meeting. Perhaps one was just created?'
          }
        }
      }
      publish(
        SubscriptionChannel.TEAM,
        teamId,
        'StartTeamHealthSuccess',
        {meetingIds: [meeting.id], teamIds: [teamId]},
        subOptions
      )
      return meeting
    }
    return standardError(new Error('Unhandled recurring meeting type'), {
      tags: {
        meetingSeriesId: meetingSeries.id,
        meetingType: meetingSeries.meetingType
      }
    })
  })()

  if ('error' in meeting) {
    return meeting
  }

  IntegrationNotifier.startMeeting(dataLoader, meeting.id, teamId)
  meetingsStarted.inc({meeting_type: meeting.meetingType})
  return {meeting}
}

export default startRecurringMeeting
