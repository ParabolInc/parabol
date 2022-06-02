import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import clientTempId from '../utils/relay/clientTempId'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddAgendaItemMutation as TAddAgendaItemMutation} from '../__generated__/AddAgendaItemMutation.graphql'
import handleAddAgendaItems from './handlers/handleAddAgendaItems'

graphql`
  fragment AddAgendaItemMutation_team on AddAgendaItemPayload {
    agendaItem {
      id
      content
      pinned
      sortOrder
      teamId
      teamMember {
        id
        picture
        preferredName
      }
    }
    meeting {
      ...useGotoStageId_meeting
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
        stages {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
          isNavigableByFacilitator
        }
      }
    }
  }
`

const mutation = graphql`
  mutation AddAgendaItemMutation($newAgendaItem: CreateAgendaItemInput!) {
    addAgendaItem(newAgendaItem: $newAgendaItem) {
      error {
        message
      }
      ...AddAgendaItemMutation_team @relay(mask: false)
    }
  }
`

export const addAgendaItemUpdater: SharedUpdater<
  TAddAgendaItemMutation['response']['addAgendaItem']
> = (payload, {store}) => {
  const agendaItem = payload.getLinkedRecord('agendaItem')
  if (!agendaItem) return
  handleAddAgendaItems(agendaItem, store)
}

const AddAgendaItemMutation: StandardMutation<TAddAgendaItemMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addAgendaItem')
      if (!payload) return
      addAgendaItemUpdater(payload, {store, atmosphere})
    },
    optimisticUpdater: (store) => {
      const {newAgendaItem} = variables
      const {teamId, teamMemberId} = newAgendaItem
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const optimisticAgendaItem = {
        ...newAgendaItem,
        id: clientTempId(teamId),
        isActive: true
      }
      const agendaItemNode = createProxyRecord(store, 'AgendaItem', optimisticAgendaItem)
      agendaItemNode.setLinkedRecord(teamMember, 'teamMember')
      handleAddAgendaItems(agendaItemNode, store)
    },
    onCompleted,
    onError
  })
}

export default AddAgendaItemMutation
