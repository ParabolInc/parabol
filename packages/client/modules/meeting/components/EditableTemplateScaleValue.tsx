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
import {EditableTemplateScaleValue_scaleValues} from '../../../__generated__/EditableTemplateScaleValue_scaleValues.graphql'
import {PALETTE} from '~/styles/paletteV2'

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
  scaleValueLabel: string
  scaleValueId: string
  scaleValues: EditableTemplateScaleValue_scaleValues
}

class EditableTemplateScaleValue extends Component<Props> {
  handleSubmit = (rawDimensionName) => {
    const {
      atmosphere,
      scaleValueId,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    setDirty()
    const {error, value: name} = this.validate(rawDimensionName)
    if (error) return
    submitMutation()

    console.log(`${atmosphere}:${scaleValueId}:${onError}:${onCompleted}:${name}`)
  }

  legitify(value: string) {
    const {scaleValueId, scaleValues} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a scaleValue name')
      .max(100, 'That scaleValue name is probably long enough')
      .test((mVal) => {
        const isDupe = scaleValues.find(
          (scaleValue) => scaleValue.id !== scaleValueId && scaleValue.label.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That scaleValue already exists' : undefined
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
    const {isOwner, error, isHover, isEditingDescription, scaleValueLabel} = this.props
    return (
      <StyledEditableText
        disabled={!isOwner}
        error={error as string}
        hideIcon={isEditingDescription ? true : !isHover}
        handleSubmit={this.handleSubmit}
        initialValue={scaleValueLabel}
        maxLength={100}
        validate={this.validate}
        placeholder={''}
      />
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplateScaleValue)), {
  scaleValues: graphql`
    fragment EditableTemplateScaleValue_scaleValues on TemplateScaleValue @relay(plural: true) {
      id
      label
      value
      isSpecial
    }
  `
})
