import {commitMutation, graphql} from 'react-relay'
import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import handleUpdateAgendaItems from './handlers/handleUpdateAgendaItems'
import {
  IActionMeeting,
  IAgendaItemsPhase,
  IUpdateAgendaItemOnMutationArguments,
  NewMeetingPhaseTypeEnum
} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import updateProxyRecord from '../utils/relay/updateProxyRecord'
import {UpdateAgendaItemMutation as TUpdateAgendaItemMutation} from '../../__generated__/UpdateAgendaItemMutation.graphql'

graphql`
  fragment UpdateAgendaItemMutation_team on UpdateAgendaItemPayload {
    agendaItem {
      id
      teamId
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
    const meeting = store.get(meetingId) as RecordProxy<IActionMeeting>
    if (!meeting) return
    const phases = meeting.getLinkedRecords('phases')
    const agendaPhase = phases.find((phase) =>
      phase ? phase.getValue('phaseType') === NewMeetingPhaseTypeEnum.agendaitems : false
    ) as RecordProxy<IAgendaItemsPhase>
    if (!agendaPhase) return
    const getSortOrder = (stage) => {
      const agendaItemId = stage.getValue('agendaItemId')
      const agendaItem = store.get(agendaItemId)
      if (!agendaItem) return
      return agendaItem.getValue('sortOrder')
    }
    const stages = agendaPhase.getLinkedRecords('stages')
    stages.sort((a, b) => {
      return getSortOrder(a) > getSortOrder(b) ? 1 : -1
    })
    agendaPhase.setLinkedRecords(stages, 'stages')
  }
}

export const updateAgendaItemUpdater = (payload: RecordProxy, {store}) => {
  const agendaItem = payload.getLinkedRecord('agendaItem')
  const meetingId = payload.getValue('meetingId')
  if (!agendaItem) return
  const teamId = agendaItem.getValue('teamId')
  handleUpdateAgendaItems(store, teamId)
  handleUpdateAgendaPhase(store, meetingId)
}

const UpdateAgendaItemMutation = (
  atmosphere: Atmosphere,
  variables: IUpdateAgendaItemOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
) => {
  const {updatedAgendaItem} = variables
  const [teamId] = updatedAgendaItem.id.split('::')
  return commitMutation<TUpdateAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('updateAgendaItem')
      if (!payload) return
      updateAgendaItemUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id)
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem)
      const team = store.get(teamId)
      if (!team) return
      const meetingId = team.getValue('meetingId')
      handleUpdateAgendaItems(store, teamId)
      handleUpdateAgendaPhase(store, meetingId)
    },
    onCompleted,
    onError
  })
}

export default UpdateAgendaItemMutation
