import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {ActionMeeting_meeting$data} from '~/__generated__/ActionMeeting_meeting.graphql'
import {AgendaItem_agendaItem$data} from '~/__generated__/AgendaItem_agendaItem.graphql'
import {UpdateAgendaItemMutation_team$data} from '~/__generated__/UpdateAgendaItemMutation_team.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {UpdateAgendaItemMutation as TUpdateAgendaItemMutation} from '../__generated__/UpdateAgendaItemMutation.graphql'
import handleUpdateAgendaItems from './handlers/handleUpdateAgendaItems'

graphql`
  fragment UpdateAgendaItemMutation_team on UpdateAgendaItemPayload {
    agendaItem {
      id
      teamId
      pinned
      sortOrder
    }
    meetingId
  }
`

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      error {
        message
      }
      ...UpdateAgendaItemMutation_team @relay(mask: false)
    }
  }
`

const handleUpdateAgendaPhase = (
  store: RecordSourceSelectorProxy,
  meetingId: string | undefined | null
) => {
  if (meetingId) {
    const meeting = store.get(meetingId) as RecordProxy<ActionMeeting_meeting$data>
    if (!meeting) return
    const phases = meeting.getLinkedRecords('phases')
    const agendaPhase = phases.find((phase) =>
      phase ? phase.getValue('phaseType') === 'agendaitems' : false
    )
    if (!agendaPhase) return
    const getSortOrder = (stage: RecordProxy) => {
      const agendaItem = stage.getLinkedRecord<AgendaItem_agendaItem$data>('agendaItem')
      if (!agendaItem) return 0
      return agendaItem.getValue('sortOrder')
    }
    const stages = agendaPhase.getLinkedRecords('stages')
    if (!stages) return
    stages.sort((a, b) => {
      return getSortOrder(a)! > getSortOrder(b)! ? 1 : -1
    })
    agendaPhase.setLinkedRecords(stages, 'stages')
  }
}

export const updateAgendaItemUpdater: SharedUpdater<UpdateAgendaItemMutation_team$data> = (
  payload,
  {store}
) => {
  const agendaItem = payload.getLinkedRecord('agendaItem')
  const meetingId = payload.getValue('meetingId')
  if (!agendaItem) return
  const teamId = agendaItem.getValue('teamId')
  handleUpdateAgendaItems(store, teamId)
  handleUpdateAgendaPhase(store, meetingId)
}

const UpdateAgendaItemMutation: StandardMutation<
  TUpdateAgendaItemMutation,
  {meetingId: string | undefined}
> = (atmosphere, variables, {meetingId}) => {
  const {updatedAgendaItem} = variables
  const teamId = updatedAgendaItem.id.split('::')[0]!
  return commitMutation<TUpdateAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('updateAgendaItem')
      if (!payload) return
      updateAgendaItemUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id)!
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem)
      handleUpdateAgendaItems(store, teamId)
      handleUpdateAgendaPhase(store, meetingId)
    }
  })
}

export default UpdateAgendaItemMutation
