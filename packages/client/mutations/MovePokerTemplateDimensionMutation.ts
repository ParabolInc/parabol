import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {MovePokerTemplateDimensionMutation as TMovePokerTemplateDimensionMutation} from '~/__generated__/MovePokerTemplateDimensionMutation.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {MovePokerTemplateDimensionMutation_team$data} from '../__generated__/MovePokerTemplateDimensionMutation_team.graphql'
import handleMovePokerTemplateDimension from './handlers/handleMovePokerTemplateDimension'

graphql`
  fragment MovePokerTemplateDimensionMutation_team on MovePokerTemplateDimensionPayload {
    dimension {
      sortOrder
      templateId
    }
  }
`

const mutation = graphql`
  mutation MovePokerTemplateDimensionMutation($dimensionId: ID!, $sortOrder: Float!) {
    movePokerTemplateDimension(dimensionId: $dimensionId, sortOrder: $sortOrder) {
      error {
        message
      }
      ...MovePokerTemplateDimensionMutation_team @relay(mask: false)
    }
  }
`

export const movePokerTemplateDimensionTeamUpdater: SharedUpdater<
  MovePokerTemplateDimensionMutation_team$data
> = (payload, {store}) => {
  if (!payload) return
  const templateId = payload.getLinkedRecord('dimension').getValue('templateId')
  handleMovePokerTemplateDimension(store, templateId)
}

const MovePokerTemplateDimensionMutation: StandardMutation<
  TMovePokerTemplateDimensionMutation,
  {templateId: string}
> = (atmosphere, variables, {templateId}) => {
  return commitMutation<TMovePokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('movePokerTemplateDimension')
      if (!payload) return
      movePokerTemplateDimensionTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {sortOrder, dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      dimension.setValue(sortOrder, 'sortOrder')
      handleMovePokerTemplateDimension(store, templateId)
    }
  })
}

export default MovePokerTemplateDimensionMutation
