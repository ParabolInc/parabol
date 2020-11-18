import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import RenamePokerTemplateDimensionMutation from '../../../mutations/RenamePokerTemplateDimensionMutation'
import EditableText from '../../../components/EditableText'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateDimension_dimensions} from '../../../__generated__/EditableTemplateDimension_dimensions.graphql'
import {PALETTE} from '~/styles/paletteV2'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'

const StyledEditableText = styled(EditableText)({
  fontFamily: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '24px',
  padding: 0
})

interface Props {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  dimensionName: string
  dimensionId: string
  dimensions: EditableTemplateDimension_dimensions
}

const EditableTemplateDimension = (props: Props) => {
  const {dimensionId, dimensions} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawDimensionName) => {
    if (submitting) return
    const {error, value: name} = validate(rawDimensionName)
    if (error) return
    submitMutation()
    RenamePokerTemplateDimensionMutation(atmosphere, {dimensionId, name}, {}, onError, onCompleted)
  }

  const legitify = (value: string) => {
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

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else if (error) {
      onError(new Error(error.message))
    }
    return res
  }

  const {isOwner, isHover, isEditingDescription, dimensionName} = props
  return (
    <StyledEditableText
      autoFocus={dimensionName.startsWith('New dimension #')}
      disabled={!isOwner}
      error={error?.message}
      hideIcon={isEditingDescription ? true : !isHover}
      handleSubmit={handleSubmit}
      initialValue={dimensionName}
      maxLength={100}
      validate={validate}
      placeholder={'New Dimension'}
    />
  )
}

export default createFragmentContainer(EditableTemplateDimension, {
  dimensions: graphql`
    fragment EditableTemplateDimension_dimensions on TemplateDimension @relay(plural: true) {
      id
      name
    }
  `
})
