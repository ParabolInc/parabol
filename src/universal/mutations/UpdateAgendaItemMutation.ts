import {commitMutation, graphql} from 'react-relay'
import Atmosphere from 'universal/Atmosphere'
import handleUpdateAgendaItems from 'universal/mutations/handlers/handleUpdateAgendaItems'
import {IUpdateAgendaItemOnMutationArguments} from 'universal/types/graphql'
import {LocalHandlers} from 'universal/types/relayMutations'
import updateProxyRecord from 'universal/utils/relay/updateProxyRecord'
import {UpdateAgendaItemMutation} from '__generated__/UpdateAgendaItemMutation.graphql'

graphql`
  fragment UpdateAgendaItemMutation_agendaItem on UpdateAgendaItemPayload {
    agendaItem {
      id
      isComplete
      sortOrder
    }
  }
`

const mutation = graphql`
  mutation UpdateAgendaItemMutation($updatedAgendaItem: UpdateAgendaItemInput!) {
    updateAgendaItem(updatedAgendaItem: $updatedAgendaItem) {
      error {
        message
      }
      ...UpdateAgendaItemMutation_agendaItem @relay(mask: false)
    }
  }
`

const UpdateAgendaItemMutation = (
  atmosphere: Atmosphere,
  variables: IUpdateAgendaItemOnMutationArguments,
  {onError, onCompleted}: LocalHandlers = {}
) => {
  const {updatedAgendaItem} = variables
  const [teamId] = updatedAgendaItem.id.split('::')
  return commitMutation<UpdateAgendaItemMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      handleUpdateAgendaItems(store, teamId)
    },
    optimisticUpdater: (store) => {
      const proxyAgendaItem = store.get(updatedAgendaItem.id)
      updateProxyRecord(proxyAgendaItem, updatedAgendaItem)
      handleUpdateAgendaItems(store, teamId)
    },
    onCompleted,
    onError
  })
}

export default UpdateAgendaItemMutation
