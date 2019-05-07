import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import handleRemoveAgendaItems from 'universal/mutations/handlers/handleRemoveAgendaItems'
import {IRemoveAgendaItemOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import getInProxy from 'universal/utils/relay/getInProxy'
import {RemoveAgendaItemMutation} from '__generated__/RemoveAgendaItemMutation.graphql'

graphql`
  fragment RemoveAgendaItemMutation_agendaItem on RemoveAgendaItemPayload {
    agendaItem {
      id
    }
  }
`

const mutation = graphql`
  mutation RemoveAgendaItemMutation($agendaItemId: ID!) {
    removeAgendaItem(agendaItemId: $agendaItemId) {
      error {
        message
      }
      ...RemoveAgendaItemMutation_agendaItem @relay(mask: false)
    }
  }
`

export const removeAgendaItemUpdater = (payload, store) => {
  const agendaItemId = getInProxy(payload, 'agendaItem', 'id')
  handleRemoveAgendaItems(agendaItemId, store)
}

const RemoveAgendaItemMutation = (
  atmosphere: Atmosphere,
  variables: IRemoveAgendaItemOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
) => {
  return commitMutation<RemoveAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('removeAgendaItem')
      if (!payload) return
      removeAgendaItemUpdater(payload, store)
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
