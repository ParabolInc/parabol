import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {AddPokerTemplateScaleValueMutation as TAddPokerTemplateScaleValueMutation} from '../__generated__/AddPokerTemplateScaleValueMutation.graphql'
import {AddPokerTemplateScaleValueMutation_scale} from '../__generated__/AddPokerTemplateScaleValueMutation_scale.graphql'
import handleAddPokerTemplateScaleValue from './handlers/handleAddPokerTemplateScaleValue'

graphql`
  fragment AddPokerTemplateScaleValueMutation_scale on AddPokerTemplateScaleValuePayload {
    scale {
      id
      name
      values {
        id
        value
        label
        color
        isSpecial
      }
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleValueMutation($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      ...AddPokerTemplateScaleValueMutation_scale @relay(mask: false)
    }
  }
`

export const addPokerTemplateScaleValueTeamUpdater: SharedUpdater<AddPokerTemplateScaleValueMutation_scale> = (
  payload,
  {store}
) => {
  const scale = payload.getLinkedRecord('scale')
  if (!scale) return
  handleAddPokerTemplateScaleValue(scale, store)
}

const AddPokerTemplateScaleValueMutation: StandardMutation<
  TAddPokerTemplateScaleValueMutation
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TAddPokerTemplateScaleValueMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    // updater: (store) => {
    //   const payload = store.getRootField('addPokerTemplateScaleValue')
    //   if (!payload) return
    //   addPokerTemplateScaleValueTeamUpdater(payload, {atmosphere, store})
    // },
    optimisticUpdater: (store) => {
      const {scaleId, scaleValue} = variables
      const proxyTemplateScaleValue = createProxyRecord(store, 'TemplateScaleValue', {
        ...scaleValue,
        id: `${scaleId}:${scaleValue.value}`
      })
      handleAddPokerTemplateScaleValue(proxyTemplateScaleValue, store)
    }
  })
}

export default AddPokerTemplateScaleValueMutation
