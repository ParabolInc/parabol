import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import palettePickerOptions from '../../../styles/palettePickerOptions'
import Icon from '../../../components/Icon'
import LinkButton from '../../../components/LinkButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AddPokerTemplateScaleValueMutation from '../../../mutations/AddPokerTemplateScaleValueMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddPokerTemplateScaleValue_scaleValues} from '../../../__generated__/AddPokerTemplateScaleValue_scaleValues.graphql'
import {PALETTE} from '../../../styles/paletteV2'

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

interface Props extends WithAtmosphereProps, WithMutationProps {
  scaleValues: AddPokerTemplateScaleValue_scaleValues
  scaleId: string
}

class AddTemplateScaleValue extends Component<Props> {
  addScaleValue = () => {
    const {
      atmosphere,
      scaleValues,
      scaleId,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    submitMutation()
    const values = scaleValues.filter(({isSpecial}) => !isSpecial).map(({value}) => value)
    const pickedColors = scaleValues.filter(({isSpecial}) => !isSpecial).map(({color}) => color)
    const availableNewColor = palettePickerOptions.find(
      (color) => !pickedColors.includes(color.hex)
    )
    const newValue = Math.max(0, ...values) + 1

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

  render() {
    const {scaleValues, submitting} = this.props
    if (scaleValues.length >= 20) return null
    return (
      <AddScaleValueLink palette='blue' onClick={this.addScaleValue} waiting={submitting}>
        <AddScaleValueLinkPlus>add</AddScaleValueLinkPlus>
        <div>Add value</div>
      </AddScaleValueLink>
    )
  }
}

export default createFragmentContainer(withMutationProps(withAtmosphere(AddTemplateScaleValue)), {
  scaleValues: graphql`
    fragment AddPokerTemplateScaleValue_scaleValues on TemplateScaleValue @relay(plural: true) {
      isSpecial
      value
      color
      label
    }
  `
})
