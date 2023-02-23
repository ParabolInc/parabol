import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {checkTeamsLimit} from '../../../billing/helpers/teamLimitsCheck'
import {ParabolR} from '../../../database/rethinkDriver'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {analytics} from '../../../utils/analytics/analytics'
import publish, {SubOptions} from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {InternalContext} from '../../graphql'
import sendNewMeetingSummary from './endMeeting/sendNewMeetingSummary'

const safeEndTeamPrompt = async ({
  meeting,
  now,
  viewerId,
  r,
  context,
  subOptions
}: {
  meeting: MeetingTeamPrompt
  now: Date
  viewerId?: string
  r: ParabolR
  context: InternalContext
  subOptions: SubOptions
}) => {
  const {dataLoader} = context

  const {endedAt, id: meetingId, teamId} = meeting

  if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

  // RESOLUTION
  const completedTeamPrompt = (await r
    .table('NewMeeting')
    .get(meetingId)
    .update(
      {
        endedAt: now
      },
      {returnChanges: true}
    )('changes')(0)('new_val')
    .default(null)
    .run()) as unknown as MeetingTeamPrompt

  if (!completedTeamPrompt) {
    return standardError(new Error('Completed team prompt meeting does not exist'), {
      userId: viewerId
    })
  }

  const [meetingMembers, team, teamMembers, responses] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('teamMembersByTeamId').load(teamId),
    getTeamPromptResponsesByMeetingId(meetingId)
  ])

  const events = teamMembers.map(
    (teamMember) =>
      new TimelineEventTeamPromptComplete({
        userId: teamMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      })
  )
  const timelineEventId = events[0]!.id
  await r.table('TimelineEvent').insert(events).run()
  sendNewMeetingSummary(completedTeamPrompt, context).catch(console.log)
  checkTeamsLimit(team.orgId, dataLoader)
  analytics.teamPromptEnd(completedTeamPrompt, meetingMembers, responses)
  dataLoader.get('newMeetings').clear(meetingId)

  const data = {
    meetingId,
    teamId,
    timelineEventId
  }
  publish(SubscriptionChannel.TEAM, teamId, 'EndTeamPromptSuccess', data, subOptions)
  return data
}

export default safeEndTeamPrompt
