import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import RenamePokerTemplateDimensionMutation from '../../../mutations/RenamePokerTemplateDimensionMutation'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateDimension_dimensions} from '../../../__generated__/EditableTemplateDimension_dimensions.graphql'
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
  dimensionName: string
  dimensionId: string
  dimensions: EditableTemplateDimension_dimensions
}

class EditableTemplateDimension extends Component<Props> {
  handleSubmit = (rawDimensionName) => {
    const {
      atmosphere,
      dimensionId,
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
    RenamePokerTemplateDimensionMutation(atmosphere, {dimensionId, name}, {}, onError, onCompleted)
  }

  legitify(value: string) {
    const {dimensionId, dimensions} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a dimension name')
      .max(100, 'That dimension name is probably long enough')
      .test((mVal) => {
        const isDupe = dimensions.find(
          (dimension) => dimension.id !== dimensionId && dimension.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That dimension already exists' : undefined
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
    const {isOwner, error, isHover, isEditingDescription, dimensionName} = this.props
    return (
      <StyledEditableText
        autoFocus={dimensionName.startsWith('New dimension #')}
        disabled={!isOwner}
        error={error as string}
        hideIcon={isEditingDescription ? true : !isHover}
        handleSubmit={this.handleSubmit}
        initialValue={dimensionName}
        maxLength={100}
        validate={this.validate}
        placeholder={'New Dimension'}
      />
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplateDimension)), {
  dimensions: graphql`
    fragment EditableTemplateDimension_dimensions on TemplateDimension @relay(plural: true) {
      id
      name
    }
  `
})
