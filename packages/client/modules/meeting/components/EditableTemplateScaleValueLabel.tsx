import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import Legitity from '../../../validation/Legitity'
import {PALETTE} from '~/styles/paletteV2'
import UpdatePokerTemplateScaleValueMutation from '~/mutations/UpdatePokerTemplateScaleValueMutation'
import {EditableTemplateScaleValueLabel_scaleValue} from '~/__generated__/EditableTemplateScaleValueLabel_scaleValue.graphql'
import {EditableTemplateScaleValueLabel_scale} from '~/__generated__/EditableTemplateScaleValueLabel_scale.graphql'
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
  scale: EditableTemplateScaleValueLabel_scale
  scaleValue: EditableTemplateScaleValueLabel_scaleValue
}

const EditableTemplateScaleValueLabel = (props: Props) => {
  const {isOwner, isHover, isEditingDescription, scale, scaleValue} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawScaleLabel) => {
    if (submitting) return
    const {error, value: newLabel} = validate(rawScaleLabel)
    if (error) return
    submitMutation()

    const scaleId = scale.id
    const newValue = isNaN(Number(newLabel)) ? scaleValue.value : Number(newLabel)
    const oldScaleValue = {label: scaleValue.label, color: scaleValue.color, value: scaleValue.value}
    const newScaleValue = {...oldScaleValue, label: newLabel, value: newValue}
    UpdatePokerTemplateScaleValueMutation(atmosphere, {scaleId, oldScaleValue, newScaleValue}, {}, onError, onCompleted)
  }

  const legitify = (value: string) => {
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

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else if (error) {
      onError(new Error(error.message))
    }
    return res
  }

  return (
    <StyledEditableText
      autoFocus={scaleValue.label.startsWith('*')}
      disabled={!isOwner}
      error={error?.message}
      hideIcon={isEditingDescription ? true : !isHover}
      handleSubmit={handleSubmit}
      initialValue={scaleValue.label}
      maxLength={2}
      validate={validate}
      placeholder={''}
    />
  )
}

export default createFragmentContainer(EditableTemplateScaleValueLabel, {
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
