import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import handleAddAgendaItems from 'universal/mutations/handlers/handleAddAgendaItems'
import {IAddAgendaItemOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import clientTempId from 'universal/utils/relay/clientTempId'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import {AddAgendaItemMutation as TAddAgendaItemMutation} from '__generated__/AddAgendaItemMutation.graphql'

graphql`
  fragment AddAgendaItemMutation_team on AddAgendaItemPayload {
    agendaItem {
      id
      content
      sortOrder
      teamId
      teamMember {
        id
        picture
        preferredName
      }
    }
    meeting {
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
        stages {
          ...ActionMeetingAgendaItemsStage @relay(mask: false)
          # For useMeetingGotoStageId
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

export const addAgendaItemUpdater = (payload, {store}) => {
  const agendaItem = payload.getLinkedRecord('agendaItem')
  handleAddAgendaItems(agendaItem, store)
}

const AddAgendaItemMutation = (
  atmosphere: Atmosphere,
  variables: IAddAgendaItemOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
) => {
  return commitMutation<TAddAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addAgendaItem')
      if (!payload) return
      addAgendaItemUpdater(payload, {store})
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
