import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RenamePokerTemplateScaleMutation from '../../../mutations/RenamePokerTemplateScaleMutation'
import Legitity from '../../../validation/Legitity'
import {EditableTemplateScaleName_scales$key} from '../../../__generated__/EditableTemplateScaleName_scales.graphql'

interface Props {
  name: string
  scaleId: string
  scales: EditableTemplateScaleName_scales$key
  isOwner: boolean
}

const InheritedStyles = styled('div')({
  flex: 1,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: '4px'
})

const StyledEditableText = styled(EditableText)({
  lineHeight: '24px'
})

const EditableTemplateScaleName = (props: Props) => {
  const {name, scaleId, scales: scalesRef, isOwner} = props
  const scales = useFragment(
    graphql`
      fragment EditableTemplateScaleName_scales on TemplateScale @relay(plural: true) {
        id
        name
      }
    `,
    scalesRef
  )
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawName: string) => {
    if (submitting) return
    const {error, value: name} = validate(rawName)
    if (error) return
    submitMutation()
    RenamePokerTemplateScaleMutation(atmosphere, {scaleId, name}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
    return new Legitity(value)
      .trim()
      .required('Please enter a scale name')
      .max(50, 'That scale name is probably long enough')
      .test((mVal) => {
        const isDupe = !scales
          ? undefined
          : scales.find(
              (scale) => scale.id !== scaleId && scale.name.toLowerCase() === mVal.toLowerCase()
            )
        return isDupe ? 'That scale name is already taken' : undefined
      })
  }

  const validate = (rawValue: string) => {
    const res = legitify(rawValue)
    if (res.error) {
      onError(new Error(res.error))
    } else {
      onCompleted()
    }
    return res
  }

  return (
    <InheritedStyles>
      <StyledEditableText
        disabled={!isOwner}
        error={error?.message}
        handleSubmit={handleSubmit}
        initialValue={name}
        maxLength={50}
        validate={validate}
        placeholder={'*New Scale'}
      />
    </InheritedStyles>
  )
}

export default EditableTemplateScaleName
