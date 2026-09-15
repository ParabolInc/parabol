import {GraphQLError} from 'graphql'
import MeetingSeriesId from 'parabol-client/shared/gqlIds/MeetingSeriesId'
import {RRuleSet} from 'rrule-rust'
import AuthToken from '../../../database/types/AuthToken'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getUpcomingRRuleDates} from '../../../utils/getNextRRuleDate'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import canAdminMeetingSeries from '../../mutations/helpers/canAdminMeetingSeries'
import rotateSeriesTeamHealthQuestionIds from '../../mutations/helpers/rotateSeriesTeamHealthQuestionIds'
import safeEndRetrospective from '../../mutations/helpers/safeEndRetrospective'
import safeEndTeamHealth from '../../mutations/helpers/safeEndTeamHealth'
import safeEndTeamPrompt from '../../mutations/helpers/safeEndTeamPrompt'
import startRecurringMeeting from '../../mutations/helpers/startRecurringMeeting'
import type {MutationResolvers} from '../resolverTypes'
import {selectGroupSeriesIds, stopMeetingSeriesGroup} from './updateRecurrenceSettings'

const startMeetingSeriesNow: MutationResolvers['startMeetingSeriesNow'] = async (
  _source,
  {meetingSeriesId},
  context,
  info
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const numericId = MeetingSeriesId.split(meetingSeriesId)
  if (!Number.isFinite(numericId)) {
    throw new GraphQLError('Invalid meeting series id')
  }
  const meetingSeries = await dataLoader.get('meetingSeries').load(numericId)
  if (!meetingSeries) {
    throw new GraphQLError('Meeting series not found')
  }
  const {cancelledAt, recurrenceRule} = meetingSeries
  if (!(await canAdminMeetingSeries(meetingSeries, authToken, dataLoader))) {
    throw new GraphQLError('Only the owner of this meeting series can start it early')
  }
  if (cancelledAt) {
    throw new GraphQLError('Meeting series was cancelled')
  }

  // a group covering several teams opens one meeting per team, on its own sibling series
  const seriesIds = await selectGroupSeriesIds(meetingSeries)
  const groupSeries = (await dataLoader.get('meetingSeries').loadMany(seriesIds))
    .filter(isValid)
    .filter((series) => !series.cancelledAt)

  // The next occurrence replaces the current one: a team still mid-meeting has that meeting
  // closed, with its summary, so the new one never runs alongside it
  const activeMeetings = (
    await dataLoader.get('activeMeetingsByMeetingSeriesId').loadMany(seriesIds)
  )
    .filter(isValid)
    .flat()
  await Promise.all(
    activeMeetings.map(async (meeting) => {
      const {facilitatorUserId, teamId} = meeting
      if (!facilitatorUserId) return
      // The summary page lands in the team's page tree, which only its members can write to. An
      // owner may not be on this team, so end it as its facilitator, the way the cron does
      const endAuthToken = isTeamMember(authToken, teamId)
        ? authToken
        : new AuthToken({
            sub: facilitatorUserId,
            tms: (await dataLoader.get('teamMembersByUserId').load(facilitatorUserId)).map(
              (teamMember) => teamMember.teamId
            ),
            rol: 'impersonate'
          })
      // ending publishes a snapshot of its dataloader, so it gets one of its own rather than
      // freezing the loader the starts below still write through
      const meetingDataLoader = getNewDataLoader('startMeetingSeriesNow.endMeeting')
      const endContext = {...context, authToken: endAuthToken, dataLoader: meetingDataLoader}
      const tags = {meetingId: meeting.id, meetingType: meeting.meetingType}
      const endMeeting = async () => {
        if (meeting.meetingType === 'teamPrompt') {
          return safeEndTeamPrompt({meeting, context: endContext, info})
        } else if (meeting.meetingType === 'retrospective') {
          return safeEndRetrospective({meeting, context: endContext, info})
        } else if (meeting.meetingType === 'teamHealth') {
          return safeEndTeamHealth({meeting, context: endContext, info})
        }
        return standardError(new Error('Unhandled recurring meeting type'), {tags})
      }
      return endMeeting()
        .catch((e: Error) => standardError(e, {tags}))
        .finally(() => meetingDataLoader.dispose())
    })
  )
  dataLoader.clearAll('newMeetings')

  // This meeting stands in for the upcoming occurrence, so it runs until the occurrence after that.
  // Ending it on the upcoming occurrence would close it as soon as the schedule caught up.
  const [, occurrenceAfterNext] = getUpcomingRRuleDates(RRuleSet.parse(recurrenceRule), 2)
  // Only a group opening several teams at once needs to rotate here; a lone series lets its
  // own meeting rotate, against its own history
  const questionIds =
    meetingSeries.groupId && meetingSeries.meetingType === 'teamHealth' && meetingSeries.templateId
      ? await rotateSeriesTeamHealthQuestionIds(meetingSeries.templateId, seriesIds, dataLoader)
      : undefined

  const startedMeetings = (
    await Promise.all(
      groupSeries.map(async (series) => {
        const res = await startRecurringMeeting(series, dataLoader, subOptions, {
          // whoever kicks off an occurrence early facilitates it, but only on teams they are on.
          // An owner may not be on every team the group covers
          facilitatorId: isTeamMember(authToken, series.teamId) ? viewerId : undefined,
          scheduledEndTime: occurrenceAfterNext ?? null,
          questionIds
        })
        return 'error' in res ? null : res.meeting
      })
    )
  ).filter(isValid)
  if (startedMeetings.length === 0) {
    throw new GraphQLError('Unable to start a meeting for any team in this series group')
  }

  if (!occurrenceAfterNext) {
    // the meeting just started was the last one the rule had to give, so the series is over.
    // it stays open until its scheduledEndTime, which processRecurrence honors
    await stopMeetingSeriesGroup(meetingSeries)
    dataLoader.clearAll('meetingSeries')
  }
  dataLoader.clearAll('newMeetings')

  // the viewer can only join a meeting on a team they are on, & an owner may be on none of them
  const joinableMeeting = startedMeetings.find(({teamId}) => isTeamMember(authToken, teamId))
  return {
    meetingId: joinableMeeting?.id ?? null,
    // the team whose dash the client refreshes, so it has to be the one the meeting is on. Other
    // teams in the group refresh from their own StartTeamHealthSuccess subscription
    teamId: joinableMeeting?.teamId ?? meetingSeries.teamId
  }
}

export default startMeetingSeriesNow
