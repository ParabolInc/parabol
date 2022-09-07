import {RecordSourceSelectorProxy} from 'relay-runtime'
import {ActionMeeting_meeting} from '~/__generated__/ActionMeeting_meeting.graphql'
import {AgendaItem_agendaItem} from '~/__generated__/AgendaItem_agendaItem.graphql'
import safeRemoveNodeFromArray from '../../utils/relay/safeRemoveNodeFromArray'
import pluralizeHandler from './pluralizeHandler'

const handleRemoveAgendaItem = (
  agendaItemId: string,
  store: RecordSourceSelectorProxy,
  meetingId?: string
) => {
  const agendaItem = store.get<AgendaItem_agendaItem>(agendaItemId)
  if (!agendaItem) return
  const teamId = agendaItem.getValue('id').split('::')[0]
  if (!teamId) return
  const team = store.get(teamId)
  safeRemoveNodeFromArray(agendaItemId, team, 'agendaItems')
  if (meetingId) {
    const meeting = store.get<ActionMeeting_meeting>(meetingId)
    if (!meeting) return
    safeRemoveNodeFromArray(agendaItemId, meeting, 'agendaItems')
    const phases = meeting.getLinkedRecords('phases')
    if (!phases) return
    const agendaItemPhase = phases.find((phase) => phase.getValue('phaseType') === 'agendaitems')
    if (!agendaItemPhase) return
    const stages = agendaItemPhase.getLinkedRecords('stages')
    if (!stages) return
    const stageToRemove = stages.find(
      (stage) =>
        stage.getLinkedRecord<AgendaItem_agendaItem>('agendaItem')?.getValue('id') === agendaItemId
    )
    if (!stageToRemove) return
    const stageId = stageToRemove.getValue('id') as string
    if (!stageId) return
    safeRemoveNodeFromArray(stageId, agendaItemPhase, 'stages')
  }
}

const handleRemoveAgendaItems = pluralizeHandler(handleRemoveAgendaItem)
export default handleRemoveAgendaItems
