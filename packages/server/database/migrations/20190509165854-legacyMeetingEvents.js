import MeetingMember from '../types/MeetingMember'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import CheckInPhase from '../types/CheckInPhase'
import UpdatesPhase from '../types/UpdatesPhase'
import GenericMeetingPhase from '../types/GenericMeetingPhase'
import AgendaItemsPhase from '../types/AgendaItemsPhase'
import Meeting from '../types/Meeting'

/* Migrate the old Action "Meeting" type into a "NewMeeting" type and sets an isLegacy flag on the Meeting */

exports.up = async (r) => {
  try {
    const meetings = await r.table('Meeting').run()
    const completedAgendaItems = await r
      .table('AgendaItem')
      .filter({ isActive: false })
      .pluck('id', 'createdAt')
      .run()
    const agendaItemswithMeetingId = completedAgendaItems.map((agendaItem) => {
      const teamMeetings = meetings.filter(
        (meeting) => meeting.teamId === agendaItem.teamId && meeting.endedAt >= agendaItem.createdAt
      )
      teamMeetings.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      const meeting = teamMeetings[0]
      return {
        id: agendaItem.id,
        meetingId: meeting ? meeting.id : null
      }
    })
    const meetingMemberInserts = []
    const taskUpdates = []
    const meetingInserts = []
    meetings.forEach((meeting) => {
      const {
        id: meetingId,
        teamId,
        endedAt,
        createdAt,
        invitees,
        facilitator,
        meetingNumber,
        summarySentAt
      } = meeting
      if (!endedAt || !invitees || invitees.length === 0) return
      const tasks = meeting.tasks || []
      const facilitatorUserId = facilitator ? facilitator.split('::')[0] : null
      meetingMemberInserts.push(
        ...invitees.map((invitee) => {
          const { id: teamMemberId, present } = invitee
          const { userId } = fromTeamMemberId(teamMemberId)
          const member = new MeetingMember(teamId, userId, 'action', meetingId)
          member.isCheckedIn = present
          member.isLegacy = true
          return member
        })
      )

      taskUpdates.push(
        ...tasks.map((task) => {
          return {
            id: task.id.substr(teamId.length + 2),
            meetingId: task.status === 'done' ? null : meetingId,
            doneMeetingId: task.status === 'done' ? meetingId : null
          }
        })
      )

      const teamMembers = invitees.map((invitee, checkInOrder) => ({
        id: invitee.id,
        checkInOrder
      }))
      const agendaItemIds = agendaItemswithMeetingId
        .filter((agendaItem) => agendaItem.meetingId === meetingId)
        .map(({ id }) => id)
      const phases = [
        new CheckInPhase(teamId, meetingNumber - 1, teamMembers),
        new UpdatesPhase(teamMembers),
        new GenericMeetingPhase('firstcall'),
        new AgendaItemsPhase(agendaItemIds),
        new GenericMeetingPhase('lastcall')
      ]
      phases.forEach((phase) => {
        phase.stages.forEach((stage) => {
          stage.startAt = createdAt
          stage.endAt = endedAt
        })
      })
      if (!phases[0].stages[0]) {
        console.log('bad phase', JSON.stringify(phases), meetingId)
      }
      const newMeeting = new Meeting(teamId, 'action', meetingNumber - 1, phases, facilitatorUserId)
      newMeeting.createdAt = createdAt
      newMeeting.endedAt = endedAt
      newMeeting.summarySentAt = summarySentAt
      newMeeting.id = meetingId
      newMeeting.isLegacy = true
      meetingInserts.push(newMeeting)
    })
    await r({
      tasks: r(taskUpdates).forEach((task) => {
        return r
          .table('Task')
          .get(task('id'))
          .update({
            doneMeetingId: task('doneMeetingId'),
            meetingId: task('meetingId')
          })
      }),
      meetingMembers: r.table('MeetingMember').insert(meetingMemberInserts),
      meetings: r.table('NewMeeting').insert(meetingInserts)
    }).run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r
      .table('TimelineEvent')
      .filter({ type: 'actionComplete' })
      .replace((row) => {
        return row.merge({ meetingId: row('legacyMeetingId') }).without('legacyMeetingId')
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}
