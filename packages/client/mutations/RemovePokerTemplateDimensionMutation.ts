import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {CompletedHandler, ErrorHandler, SharedUpdater} from '../types/relayMutations'
import handleRemovePokerTemplateDimension from './handlers/handleRemovePokerTemplateDimension'
import {RemovePokerTemplateDimensionMutation_team} from '../__generated__/RemovePokerTemplateDimensionMutation_team.graphql'
import {
  RemovePokerTemplateDimensionMutation as IRemovePokerTemplateDimensionMutation,
  RemovePokerTemplateDimensionMutationVariables
} from '../__generated__/RemovePokerTemplateDimensionMutation.graphql'
import getInProxy from '~/utils/relay/getInProxy'

graphql`
  fragment RemovePokerTemplateDimensionMutation_team on RemovePokerTemplateDimensionPayload {
    dimension {
      id
      teamId
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

export const removePokerTemplateDimensionTeamUpdater: SharedUpdater<RemovePokerTemplateDimensionMutation_team> = (
  payload,
  {store}
) => {
  const dimensionId = getInProxy(payload, 'dimension', 'id')
  const teamId = getInProxy(payload, 'dimension', 'teamId')
  handleRemovePokerTemplateDimension(dimensionId, teamId, store)
}

const RemovePokerTemplateDimensionMutation = (
  atmosphere: Atmosphere,
  variables: RemovePokerTemplateDimensionMutationVariables,
  _context: {},
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  return commitMutation<IRemovePokerTemplateDimensionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplateDimension')
      if (!payload) return
      removePokerTemplateDimensionTeamUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {dimensionId} = variables
      const dimension = store.get(dimensionId)
      if (!dimension) return
      const teamId = dimension.getValue('teamId') as string
      if (!teamId) return
      handleRemovePokerTemplateDimension(dimensionId, teamId, store)
    }
  })
}

export default RemovePokerTemplateDimensionMutation
