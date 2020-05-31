import {R} from 'rethinkdb-ts'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'

export const up = async function (r: R) {
  try {
    await r
      .table('AgendaItem')
      .update({meetingId: ''})
      .run()
  } catch (e) {
    console.log(e)
  }

  try {
    const actionMeetings = await r
      .table('NewMeeting')
      .filter({meetingType: MeetingTypeEnum.action})
      .run()

    const updates = [] as {
      agendaItemId: string; meetingId: string
    }[]
    actionMeetings.forEach((meeting) => {
      meeting.phases.forEach((phase) => {
        if (phase.phaseType !== NewMeetingPhaseTypeEnum.agendaitems)
          return
        phase.stages.forEach((stage) => {
          if (stage.phaseType !== NewMeetingPhaseTypeEnum.agendaitems)
            return
          updates.push({
            meetingId: meeting.id,
            agendaItemId: stage.agendaItemId
          })
        })
      })
    })

    await r(updates)
      .forEach((update) => {
        return r
          .table('AgendaItem')
          .get(update('agendaItemId'))
          .update({meetingId: update('meetingId')})
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('AgendaItem')
      .replace((row) => row.without('meetingId'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
