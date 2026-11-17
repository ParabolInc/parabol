import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {RemovePokerTemplateDimensionMutation as IRemovePokerTemplateDimensionMutation} from '../__generated__/RemovePokerTemplateDimensionMutation.graphql'
import type {RemovePokerTemplateDimensionMutation_team$data} from '../__generated__/RemovePokerTemplateDimensionMutation_team.graphql'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import handleRemovePokerTemplateDimension from './handlers/handleRemovePokerTemplateDimension'

graphql`
  fragment RemovePokerTemplateDimensionMutation_team on RemovePokerTemplateDimensionPayload {
    dimension {
      id
      templateId
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateDimensionMutation($dimensionId: ID!) {
    removePokerTemplateDimension(dimensionId: $dimensionId) {
      ...RemovePokerTemplateDimensionMutation_team @relay(mask: false)
    }
  }
`

export const removePokerTemplateDimensionTeamUpdater: SharedUpdater<
  RemovePokerTemplateDimensionMutation_team$data
> = (payload, {store}) => {
  const dimension = payload.getLinkedRecord('dimension')
  if (!dimension) return
  handleRemovePokerTemplateDimension(
    dimension.getValue('id'),
    dimension.getValue('templateId'),
    store
  )
}

const RemovePokerTemplateDimensionMutation: StandardMutation<
  IRemovePokerTemplateDimensionMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<IRemovePokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplateDimension')
      if (!payload) return
      removePokerTemplateDimensionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      const templateId = dimension.getValue('templateId') as string
      if (!templateId) return
      handleRemovePokerTemplateDimension(dimensionId, templateId, store)
    }
  })
}

export default RemovePokerTemplateDimensionMutation
