import styled from '@emotion/styled'
import React from 'react'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import ReflectTemplatePromptUpdateDescriptionMutation from '../../../mutations/ReflectTemplatePromptUpdateDescriptionMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  description: string
  promptId: string
  onEditingChange: (isEditing: boolean) => void
}

const EditableSubText = styled(EditableText)({
  fontSize: 12,
  lineHeight: '24px'
})

const EditableTemplateDescription = (props: Props) => {
  const handleSubmit = (rawQuestion) => {
    const {
      atmosphere,
      promptId,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting
    } = props
    if (submitting) return
    setDirty()
    const {error, value: description = ''} = validate(rawQuestion)
    if (error) return
    submitMutation()
    ReflectTemplatePromptUpdateDescriptionMutation(
      atmosphere,
      {promptId, description},
      {onError, onCompleted}
    )
  }

  const legitify = (value: string) => {
    return new Legitity(value).trim().max(256, 'That description is probably long enough')
  }

  const validate = (rawValue: string) => {
    const {error, onError} = props
    const res = legitify(rawValue)
    if (res.error) {
      onError(res.error)
    } else if (error) {
      onError()
    }
    return res
  }

  const onEditChange = (isEditing: boolean) => {
    const {onEditingChange} = props
    onEditingChange && onEditingChange(isEditing)
  }

  const {isOwner, error, description} = props
  return (
    <EditableSubText
      disabled={!isOwner}
      error={error as string}
      hideIcon
      handleSubmit={handleSubmit}
      initialValue={description}
      maxLength={256}
      validate={validate}
      placeholder={'Description'}
      onEditingChange={onEditChange}
    />
  )
}

export default withAtmosphere(withMutationProps(EditableTemplateDescription))
