import pluralizeHandler from './pluralizeHandler'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import {RecordSourceSelectorProxy} from 'relay-runtime'
import {NewMeetingPhaseTypeEnum, IActionMeeting, IAgendaItem} from '../../types/graphql'

const handleRemoveAgendaItem = (agendaItemId: string, store: RecordSourceSelectorProxy, meetingId?: string) => {
  const agendaItem = store.get<IAgendaItem>(agendaItemId)
  if (!agendaItem) return
  const teamId = agendaItem.getValue('id').split('::')[0]
  const team = store.get(teamId)
  safeRemoveNodeFromArray(agendaItemId, team, 'agendaItems')
  if (meetingId) {
    const meeting = store.get<IActionMeeting>(meetingId)
    if (!meeting) return
    const phases = meeting.getLinkedRecords('phases')
    if (!phases) return
    const agendaItemPhase = phases.find((phase) => phase.getValue('phaseType') === NewMeetingPhaseTypeEnum.agendaitems)
    if (!agendaItemPhase) return
    const stages = agendaItemPhase.getLinkedRecords('stages')
    const stageToRemove = stages.find((stage) => stage.getValue('agendaItemId') === agendaItemId)
    if (!stageToRemove) return
    const stageId = stageToRemove.getValue('id')
    safeRemoveNodeFromArray(stageId, agendaItemPhase, 'stages')
  }
}

const handleRemoveAgendaItems = pluralizeHandler(handleRemoveAgendaItem)
export default handleRemoveAgendaItems
