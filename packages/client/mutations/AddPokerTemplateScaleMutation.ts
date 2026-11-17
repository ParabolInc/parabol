import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {AddPokerTemplateScaleMutation as TAddPokerTemplateScaleMutation} from '../__generated__/AddPokerTemplateScaleMutation.graphql'
import type {AddPokerTemplateScaleMutation_scale$data} from '../__generated__/AddPokerTemplateScaleMutation_scale.graphql'
import {PALETTE} from '../styles/paletteV3'
import {PokerCards} from '../types/constEnums'
import type {SharedUpdater, StandardMutation} from '../types/relayMutations'
import createProxyRecord from '../utils/relay/createProxyRecord'
import handleAddPokerTemplateScale from './handlers/handleAddPokerTemplateScale'

graphql`
  fragment AddPokerTemplateScaleMutation_scale on AddPokerTemplateScalePayload {
    scale {
      ...ScaleDropdownMenuItem_scale
      id
      name
      values {
        label
        color
      }
      teamId
    }
  }
`

const mutation = graphql`
  mutation AddPokerTemplateScaleMutation($parentScaleId: ID, $teamId: ID!) {
    addPokerTemplateScale(parentScaleId: $parentScaleId, teamId: $teamId) {
      ...AddPokerTemplateScaleMutation_scale @relay(mask: false)
    }
  }
`

export const addPokerTemplateScaleTeamUpdater: SharedUpdater<
  AddPokerTemplateScaleMutation_scale$data
> = (payload, {store}) => {
  const scale = payload.getLinkedRecord('scale')
  handleAddPokerTemplateScale(scale, store)
}

const AddPokerTemplateScaleMutation: StandardMutation<TAddPokerTemplateScaleMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddPokerTemplateScaleMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError,
    updater: (store) => {
      const payload = store.getRootField('addPokerTemplateScale')
      if (!payload) return
      addPokerTemplateScaleTeamUpdater(payload, {atmosphere, store})
      const scale = payload.getLinkedRecord('scale')
      if (!scale) return
      store.get(variables.teamId)?.setValue(scale.getValue('id'), 'editingScaleId')
    },
    optimisticUpdater: (store) => {
      const {parentScaleId, teamId} = variables
      const team = store.get(teamId)!
      const parentScale = parentScaleId ? store.get(parentScaleId) : null
      const scaleName = parentScale ? parentScale.getValue('name') + ' Copy' : '*New Scale'
      const proxyScale = createProxyRecord(store, 'TemplateScale', {
        name: scaleName
      })
      proxyScale.setLinkedRecord(team, 'team')

      if (parentScale) {
        const currentScaleValues = parentScale.getLinkedRecords('values')!
        proxyScale.setLinkedRecords(currentScaleValues, 'values')
      } else {
        const questionMarkCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.FUSCIA_400,
          label: PokerCards.QUESTION_CARD
        })
        const passCard = createProxyRecord(store, 'TemplateScaleValue', {
          color: PALETTE.GRAPE_500,
          label: PokerCards.PASS_CARD
        })
        proxyScale.setLinkedRecords([questionMarkCard, passCard], 'values')
      }

      handleAddPokerTemplateScale(proxyScale, store)
    }
  })
}

export default AddPokerTemplateScaleMutation
