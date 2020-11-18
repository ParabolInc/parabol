import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import palettePickerOptions from '../../../styles/palettePickerOptions'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import AddPokerTemplateScaleValueMutation from '../../../mutations/AddPokerTemplateScaleValueMutation'
import {AddPokerTemplateScaleValue_scaleValues} from '../../../__generated__/AddPokerTemplateScaleValue_scaleValues.graphql'
import {PALETTE} from '../../../styles/paletteV2'
import computeNewScaleValue from '../../../utils/meetings/computeNewScaleValue'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'

const AddScaleValueLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  padding: '8px 0'
})

const AddScaleValueLinkPlus = styled(Icon)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props {
  scaleValues: AddPokerTemplateScaleValue_scaleValues
  scaleId: string
}

const AddTemplateScaleValue = (props: Props) => {
  const {scaleValues, scaleId} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const addScaleValue = () => {
    if (submitting) return
    submitMutation()
    const values = scaleValues.filter(({isSpecial}) => !isSpecial).map(({value}) => value)
    const pickedColors = scaleValues.filter(({isSpecial}) => !isSpecial).map(({color}) => color)
    const availableNewColor = palettePickerOptions.find(
      (color) => !pickedColors.includes(color.hex)
    )
    const newValue = computeNewScaleValue(values)

    const scaleValue = {
      color: availableNewColor?.hex ?? PALETTE.PROMPT_GREEN,
      value: newValue,
      label: '*',
      isSpecial: false
    }
    AddPokerTemplateScaleValueMutation(
      atmosphere,
      {scaleId, scaleValue},
      {
        onError,
        onCompleted
      }
    )
  }

  if (scaleValues.length >= 20) return null
  return (
    <AddScaleValueLink palette='blue' onClick={addScaleValue} waiting={submitting}>
      <AddScaleValueLinkPlus>add</AddScaleValueLinkPlus>
      <div>Add value</div>
    </AddScaleValueLink>
  )
}

export default createFragmentContainer(AddTemplateScaleValue, {
  scaleValues: graphql`
    fragment AddPokerTemplateScaleValue_scaleValues on TemplateScaleValue @relay(plural: true) {
      isSpecial
      value
      color
      label
    }
  `
})
