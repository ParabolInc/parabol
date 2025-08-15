import dayjs from 'dayjs'
import tracer from 'dd-trace'
import {sql} from 'kysely'
import ms from 'ms'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {DateTime, RRuleSet} from 'rrule-rust'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {toDateTime} from '../../../../client/shared/rruleUtil'
import AuthToken from '../../../database/types/AuthToken'
import {getActiveMeetingSeries} from '../../../postgres/queries/getActiveMeetingSeries'
import {selectNewMeetings} from '../../../postgres/select'
import type {RetrospectiveMeeting, TeamPromptMeeting} from '../../../postgres/types/Meeting'
import type {MeetingSeries} from '../../../postgres/types/MeetingSeries'
import {analytics} from '../../../utils/analytics/analytics'
import {getNextRRuleDate} from '../../../utils/getNextRRuleDate'
import publish, {type SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {DataLoaderWorker} from '../../graphql'
import isStartMeetingLocked from '../../mutations/helpers/isStartMeetingLocked'
import {IntegrationNotifier} from '../../mutations/helpers/notifications/IntegrationNotifier'
import safeCreateRetrospective from '../../mutations/helpers/safeCreateRetrospective'
import safeCreateTeamPrompt, {DEFAULT_PROMPT} from '../../mutations/helpers/safeCreateTeamPrompt'
import safeEndRetrospective from '../../mutations/helpers/safeEndRetrospective'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import {stopMeetingSeries} from '../../public/mutations/updateRecurrenceSettings'
import type {MutationResolvers} from '../resolverTypes'
import {checkSequential} from './helpers/checkSequential'

const startRecurringMeeting = async (
  meetingSeries: MeetingSeries,
  dataLoader: DataLoaderWorker,
  subOptions: SubOptions
) => {
  const {id: meetingSeriesId, teamId, facilitatorId, meetingType} = meetingSeries

  // AUTH
  const [unpaidError, facilitator] = await Promise.all([
    isStartMeetingLocked(teamId, dataLoader),
    dataLoader.get('users').loadNonNull(facilitatorId)
  ])
  if (unpaidError) return standardError(new Error(unpaidError), {userId: facilitatorId})

  const [lastMeeting, meetingSettings] = await Promise.all([
    dataLoader.get('lastMeetingByMeetingSeriesId').load(meetingSeriesId),
    dataLoader.get('meetingSettingsByType').load({teamId, meetingType})
  ])

  const rrule = RRuleSet.parse(meetingSeries.recurrenceRule)
  const scheduledEndTime = getNextRRuleDate(rrule)

  const meetingName = meetingSeries.title
  const meeting = await (async () => {
    if (meetingSeries.meetingType === 'teamPrompt') {
      const teamPromptMeeting = lastMeeting as TeamPromptMeeting | null
      const meeting = await safeCreateTeamPrompt(meetingName, teamId, facilitatorId, dataLoader, {
        scheduledEndTime,
        meetingSeriesId: meetingSeries.id,
        meetingPrompt: teamPromptMeeting?.meetingPrompt ?? DEFAULT_PROMPT
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
      const {totalVotes, maxVotesPerGroup, disableAnonymity, templateId} =
        (lastMeeting as RetrospectiveMeeting) ?? {
          templateId: meetingSettings.selectedTemplateId,
          ...meetingSettings
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
  analytics.meetingStarted(facilitator, meeting)
  return undefined
}

const processRecurrence: MutationResolvers['processRecurrence'] = checkSequential(
  async (_source, _args, serverContext, info) => {
    const {dataLoader, socketId: mutatorId} = serverContext
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // RESOLUTION
    // Find any meetings with a scheduledEndTime before now, and close them
    const meetingsToEnd = await selectNewMeetings()
      .where('scheduledEndTime', '<', sql<Date>`CURRENT_TIMESTAMP`)
      .where('endedAt', 'is', null)
      .execute()

    const res = await tracer.trace('processRecurrence.endMeetings', async () =>
      Promise.all(
        meetingsToEnd.map(async (meeting) => {
          const {facilitatorUserId} = meeting
          if (!facilitatorUserId) return {error: {message: 'No facilitator'}}
          const userTeams = await dataLoader.get('teamMembersByUserId').load(facilitatorUserId)
          const tms = userTeams.map(({teamId}) => teamId)
          const authToken = new AuthToken({
            sub: facilitatorUserId,
            tms,
            rol: 'impersonate'
          })
          const context = {...serverContext, authToken}
          if (meeting.meetingType === 'teamPrompt') {
            return safeEndTeamPrompt({meeting, context, info})
          } else if (meeting.meetingType === 'retrospective') {
            return safeEndRetrospective({meeting, context, info})
          } else {
            return standardError(new Error('Unhandled recurring meeting type'), {
              tags: {
                meetingId: meeting.id,
                meetingType: meeting.meetingType
              }
            })
          }
        })
      )
    )

    const meetingsEnded = res.filter((res) => !('error' in res)).length

    let meetingsStarted = 0

    // For each active meeting series, get the meeting start times (according to rrule) after the most
    // recent meeting start time and before now.
    const activeMeetingSeries = await tracer.trace(
      'processRecurrence.getActiveMeetingSeries',
      getActiveMeetingSeries
    )
    await tracer.trace('processRecurrence.startActiveMeetingSeries', async () =>
      Promise.allSettled(
        activeMeetingSeries.map(async (meetingSeries) => {
          const {teamId, id: meetingSeriesId, recurrenceRule, facilitatorId} = meetingSeries
          const teamMemberId = TeamMemberId.join(teamId, facilitatorId)
          const [seriesTeam, facilitatorTeamMember] = await Promise.all([
            dataLoader.get('teams').loadNonNull(teamId),
            dataLoader.get('teamMembers').loadNonNull(teamMemberId)
          ])
          if (seriesTeam.isArchived || !facilitatorTeamMember.isNotRemoved) {
            return await stopMeetingSeries(meetingSeries)
          }

          const [seriesOrg, lastMeeting] = await Promise.all([
            dataLoader.get('organizations').loadNonNull(seriesTeam.orgId),
            dataLoader.get('lastMeetingByMeetingSeriesId').load(meetingSeriesId)
          ])

          if (!seriesOrg.isPaid || seriesOrg.lockedAt) {
            return
          }

          // For meetings that should still be active, start the meeting and set its end time.
          // Any subscriptions are handled by the shared meeting start code
          const rrule = RRuleSet.parse(recurrenceRule)

          // Only get meetings that should currently be active, i.e. meetings that should have started
          // within the last 24 hours, started after the last meeting in the series, and started before
          // 'now'.
          const fromDate = lastMeeting
            ? new Date(
                Math.max(lastMeeting.createdAt.getTime() + ms('10m'), now.getTime() - ms('24h'))
              )
            : new Date(0)
          const newMeetingsStartTimes = rrule.between(
            DateTime.fromString(toDateTime(dayjs(fromDate), rrule.tzid)),
            DateTime.fromString(toDateTime(dayjs(), rrule.tzid))
          )
          if (newMeetingsStartTimes.length > 0) {
            const err = await tracer.trace('startRecurringMeeting', async (span) => {
              span?.addTags({meetingSeriesId})
              return startRecurringMeeting(meetingSeries, dataLoader, subOptions)
            })
            if (!err) meetingsStarted++
          }
        })
      )
    )

    const data = {meetingsStarted, meetingsEnded}
    return data
  }
)

export default processRecurrence
