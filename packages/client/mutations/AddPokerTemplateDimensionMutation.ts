import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SprintPokerDefaults} from '~/types/constEnums'
import {BaseLocalHandlers, SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateDimensionMutation as TAddPokerTemplateDimensionMutation} from '../__generated__/AddPokerTemplateDimensionMutation.graphql'
import {AddPokerTemplateDimensionMutation_team} from '../__generated__/AddPokerTemplateDimensionMutation_team.graphql'
import handleAddPokerTemplateDimension from './handlers/handleAddPokerTemplateDimension'

interface Handlers extends BaseLocalHandlers {
  dimensionCount: number
  sortOrder: number
}

graphql`
  fragment AddPokerTemplateDimensionMutation_team on AddPokerTemplateDimensionPayload {
    dimension {
      ...AddPokerTemplateDimension_dimensions @relay(mask: false)
      ...TemplateDimensionList_dimensions @relay(mask: false)
      id
      name
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateDimensionMutation($templateId: ID!) {
    addPokerTemplateDimension(templateId: $templateId) {
      ...AddPokerTemplateDimensionMutation_team @relay(mask: false)
    }
  }
`

export const addPokerTemplateDimensionTeamUpdater: SharedUpdater<AddPokerTemplateDimensionMutation_team> = (
  payload,
  {store}
) => {
  const dimension = payload.getLinkedRecord('dimension')
  if (!dimension) return
  handleAddPokerTemplateDimension(dimension, store)
}

const AddPokerTemplateDimensionMutation: StandardMutation<
  TAddPokerTemplateDimensionMutation,
  Handlers
> = (atmosphere, variables, {dimensionCount, sortOrder, onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplateDimension')
      if (!payload) return
      addPokerTemplateDimensionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {templateId} = variables
      const nowISO = new Date().toJSON()
      const proxyTemplateDimension = createProxyRecord(store, 'PokerTemplateDimension', {
        scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
        description: '',
        sortOrder,
        name: `*New Dimension #${dimensionCount + 1}`,
        createdAt: nowISO,
        templateId,
      })
      handleAddPokerTemplateDimension(proxyTemplateDimension, store)
    }
  })
}

export default AddPokerTemplateDimensionMutation
