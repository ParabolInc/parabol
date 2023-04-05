import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {RemovePokerTemplateScaleMutation as IRemovePokerTemplateScaleMutation} from '../__generated__/RemovePokerTemplateScaleMutation.graphql'
import {RemovePokerTemplateScaleMutation_scale$data} from '../__generated__/RemovePokerTemplateScaleMutation_scale.graphql'
import handleRemovePokerTemplateScale from './handlers/handleRemovePokerTemplateScale'

graphql`
  fragment RemovePokerTemplateScaleMutation_scale on RemovePokerTemplateScalePayload {
    scale {
      ...ScaleDropdownMenuItem_scale
      id
      teamId
    }
    dimensions {
      ...PokerTemplateScalePicker_dimension
    }
  }
`

const mutation = graphql`
  mutation RemovePokerTemplateScaleMutation($scaleId: ID!) {
    removePokerTemplateScale(scaleId: $scaleId) {
      ...RemovePokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

export const removePokerTemplateScaleTeamUpdater: SharedUpdater<
  RemovePokerTemplateScaleMutation_scale$data
> = (payload, {store}) => {
  const scaleId = payload.getLinkedRecord('scale').getValue('id')
  const teamId = payload.getLinkedRecord('scale').getValue('teamId')
  handleRemovePokerTemplateScale(scaleId, teamId, store)
}

const RemovePokerTemplateScaleMutation: StandardMutation<IRemovePokerTemplateScaleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<IRemovePokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('removePokerTemplateScale')
      if (!payload) return
      removePokerTemplateScaleTeamUpdater(payload, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {scaleId} = variables
      const scale = store.get(scaleId)
      if (!scale) return
      const teamId = scale.getValue('teamId') as string
      if (!teamId) return
      handleRemovePokerTemplateScale(scaleId, teamId, store)
    }
  })
}

export default RemovePokerTemplateScaleMutation
