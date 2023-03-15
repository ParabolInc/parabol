import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {RemoveAgendaItemMutation as TRemoveAgendaItemMutation} from '../__generated__/RemoveAgendaItemMutation.graphql'
import {RemoveAgendaItemMutation_team$data} from '../__generated__/RemoveAgendaItemMutation_team.graphql'
import handleRemoveAgendaItems from './handlers/handleRemoveAgendaItems'
graphql`
  fragment RemoveAgendaItemMutation_team on RemoveAgendaItemPayload {
    agendaItem {
      id
    }
    meeting {
      id
      facilitatorStageId
      phases {
        ...ActionSidebarAgendaItemsSectionAgendaItemPhase @relay(mask: false)
      }
    }
  }
`

const mutation = graphql`
  mutation RemoveAgendaItemMutation($agendaItemId: ID!) {
    removeAgendaItem(agendaItemId: $agendaItemId) {
      error {
        message
      }
      ...RemoveAgendaItemMutation_team @relay(mask: false)
    }
  }
`

export const removeAgendaItemUpdater: SharedUpdater<RemoveAgendaItemMutation_team$data> = (
  payload,
  {store}
) => {
  const agendaItemId = payload.getLinkedRecord('agendaItem').getValue('id')
  const meetingId = payload.getLinkedRecord('meeting').getValue('id')
  handleRemoveAgendaItems(agendaItemId, store, meetingId)
}

const RemoveAgendaItemMutation: StandardMutation<
  TRemoveAgendaItemMutation,
  {meetingId?: string}
> = (atmosphere, variables, {meetingId}) => {
  return commitMutation<TRemoveAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeAgendaItem')
      if (!payload) return
      removeAgendaItemUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {agendaItemId} = variables
      handleRemoveAgendaItems(agendaItemId, store, meetingId)
    }
  })
}

export default RemoveAgendaItemMutation
