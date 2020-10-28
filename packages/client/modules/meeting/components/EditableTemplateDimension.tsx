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
import {EditableTemplateDimension_dimensions} from '../../../__generated__/EditableTemplateDimension_dimensions.graphql'

const StyledEditableText = styled(EditableText)({
  fontSize: 16,
  lineHeight: '24px',
  padding: 0
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  scaleName: string
  dimensionId: string
  dimensions: EditableTemplateDimension_dimensions
}

class EditableTemplateDimension extends Component<Props> {
  handleSubmit = (rawQuestion) => {
    const {
      setDirty,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    setDirty()
    const {error} = this.validate(rawQuestion)
    if (error) return
    submitMutation()
    // RenameReflectTemplateDimensionMutation(atmosphere, {dimensionId, question}, {}, onError, onCompleted)
  }

  legitify(value: string) {
    const {dimensionId, dimensions} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a dimension scale name')
      .max(100, 'That sacle name is probably long enough')
      .test((mVal) => {
        const isDupe = dimensions.find(
          (dimension) => dimension.id !== dimensionId && dimension.scale.name.toLowerCase() === mVal.toLowerCase()
        )
        return isDupe ? 'That question was already asked' : undefined
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
    const {isOwner, error, isHover, scaleName, isEditingDescription} = this.props
    return (
      <StyledEditableText
        autoFocus={scaleName.startsWith('New dimension #')}
        disabled={!isOwner}
        error={error as string}
        hideIcon={isEditingDescription ? true : !isHover}
        handleSubmit={this.handleSubmit}
        initialValue={scaleName}
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
      scale {
        name
      }
    }
  `
})
