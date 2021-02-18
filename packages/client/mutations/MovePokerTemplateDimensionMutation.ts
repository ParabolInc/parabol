import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import handleMovePokerTemplateDimension from './handlers/handleMovePokerTemplateDimension'
import getInProxy from '../utils/relay/getInProxy'
import {MovePokerTemplateDimensionMutationVariables} from '~/__generated__/MovePokerTemplateDimensionMutation.graphql'

interface Context {
  templateId: string
}

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

export const movePokerTemplateDimensionTeamUpdater = (payload, {store}) => {
  if (!payload) return
  const templateId = getInProxy(payload, 'dimension', 'templateId')
  handleMovePokerTemplateDimension(store, templateId)
}

const MovePokerTemplateDimensionMutation = (
  atmosphere: Atmosphere,
  variables: MovePokerTemplateDimensionMutationVariables,
  context: Context
): Disposable => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('movePokerTemplateDimension')
      if (!payload) return
      movePokerTemplateDimensionTeamUpdater(payload, {store})
    },
    optimisticUpdater: (store) => {
      const {sortOrder, dimensionId} = variables
      const {templateId} = context
      const dimension = store.get(dimensionId)
      if (!dimension) return
      dimension.setValue(sortOrder, 'sortOrder')
      handleMovePokerTemplateDimension(store, templateId)
    }
  })
}

export default MovePokerTemplateDimensionMutation
