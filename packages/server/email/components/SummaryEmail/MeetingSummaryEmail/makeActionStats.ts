import {AGENDA_ITEMS, AGENDA_ITEM_LABEL} from 'parabol-client/utils/constants'
import plural from 'parabol-client/utils/plural'

interface Meeting {
  meetingMembers: {
    isCheckedIn: boolean | null
    doneTasks: {
      id: string
    }[]
    tasks: {
      id: string
    }[]
  }[]
  phases: {
    phaseType: string
    stages: {
      isComplete: boolean
    }[]
  }[]
}

const makeActionStats = (meeting: Meeting) => {
  const {meetingMembers, phases} = meeting
  const agendaItemPhase = phases.find((phase) => phase.phaseType === AGENDA_ITEMS)!
  const {stages} = agendaItemPhase
  const agendaItemsCompleted = stages.filter((stage) => stage.isComplete).length
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks.length, 0)
  const doneTaskCount = meetingMembers.reduce((sum, {doneTasks}) => sum + doneTasks.length, 0)
  const meetingMembersCount = meetingMembers.length
  const meetingMembersPresentCount = meetingMembers.filter((member) => member.isCheckedIn === true)
    .length
  const memberCount =
    meetingMembersPresentCount >= 10
      ? meetingMembersPresentCount
      : `${meetingMembersPresentCount}/${meetingMembersCount}`
  return [
    {value: doneTaskCount, label: `${plural(doneTaskCount, 'Task')} Done`},
    {value: agendaItemsCompleted, label: plural(agendaItemsCompleted, AGENDA_ITEM_LABEL)},
    {value: newTaskCount, label: plural(newTaskCount, 'New Task')},
    {value: memberCount, label: 'Present'}
  ]
}

export default makeActionStats
