import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'
import {PALETTE} from '~/styles/paletteV2'
import UpdatePokerTemplateScaleValueMutation from '~/mutations/UpdatePokerTemplateScaleValueMutation'
import {EditableTemplateScaleValueLabel_scaleValue} from '~/__generated__/EditableTemplateScaleValueLabel_scaleValue.graphql'
import {EditableTemplateScaleValueLabel_scale} from '~/__generated__/EditableTemplateScaleValueLabel_scale.graphql'

const StyledEditableText = styled(EditableText)({
  fontFamily: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '24px',
  padding: 0
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  scale: EditableTemplateScaleValueLabel_scale
  scaleValue: EditableTemplateScaleValueLabel_scaleValue
}

class EditableTemplateScaleValueLabel extends Component<Props> {
  handleSubmit = (rawScaleLabel) => {
    const {
      atmosphere,
      scale,
      scaleValue,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    setDirty()
    const {error, value: newLabel} = this.validate(rawScaleLabel)
    if (error) return
    submitMutation()

    const scaleId = scale.id
    const oldScaleValue = {label: scaleValue.label, color: scaleValue.color, value: scaleValue.value}
    const newScaleValue = {...oldScaleValue, label: newLabel}
    UpdatePokerTemplateScaleValueMutation(atmosphere, {scaleId, oldScaleValue, newScaleValue}, {}, onError, onCompleted)
  }

  legitify(value: string) {
    const {scaleValue, scale} = this.props
    const scaleValueId = scaleValue.id
    return new Legitity(value)
      .trim()
      .required('Please enter a scale label')
      .max(2, 'That scale label is probably long enough')
      .test((mVal) => {
        const isDupe = mVal ? scale.values.find(
          (aScaleValue) => aScaleValue.id !== scaleValueId && aScaleValue.label.toLowerCase() === mVal.toLowerCase()
        ) : undefined
        return isDupe ? 'That scale label already exists' : undefined
      })
  }

  validate = (rawValue: string) => {
    const {error, onError} = this.props
    const res = this.legitify(rawValue)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  render() {
    const {isOwner, error, isHover, isEditingDescription, scaleValue} = this.props
    return (
      <StyledEditableText
        disabled={!isOwner}
        error={error as string}
        hideIcon={isEditingDescription ? true : !isHover}
        handleSubmit={this.handleSubmit}
        initialValue={scaleValue.label}
        maxLength={2}
        validate={this.validate}
        placeholder={'*'}
      />
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplateScaleValueLabel)), {
  scale: graphql`
    fragment EditableTemplateScaleValueLabel_scale on TemplateScale {
      id
      values {
        id
        label
        value
        color
      }
    }
  `,
  scaleValue: graphql`
    fragment EditableTemplateScaleValueLabel_scaleValue on TemplateScaleValue {
      id
      label
      value
      color
    }
  `
})
