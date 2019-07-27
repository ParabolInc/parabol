import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import Atmosphere from '../Atmosphere'
import handleRemoveAgendaItems from './handlers/handleRemoveAgendaItems'
import {IRemoveAgendaItemOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'
import getInProxy from '../utils/relay/getInProxy'
import {RemoveAgendaItemMutation as TRemoveAgendaItemMutation} from '../__generated__/RemoveAgendaItemMutation.graphql'

graphql`
  fragment RemoveAgendaItemMutation_team on RemoveAgendaItemPayload {
    agendaItem {
      id
    }
    meeting {
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

export const removeAgendaItemUpdater = (payload, {store}) => {
  const agendaItemId = getInProxy(payload, 'agendaItem', 'id')
  handleRemoveAgendaItems(agendaItemId, store)
}

const RemoveAgendaItemMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveAgendaItemOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<TRemoveAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeAgendaItem')
      if (!payload) return
      removeAgendaItemUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {agendaItemId} = variables
      handleRemoveAgendaItems(agendaItemId, store)
    },
    onCompleted,
    onError
  })
}

export default RemoveAgendaItemMutation
