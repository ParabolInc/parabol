import styled from '@emotion/styled'
import React, {Component} from 'react'
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

class EditableTemplateDescription extends Component<Props> {
  handleSubmit = (rawQuestion) => {
    const {
      atmosphere,
      promptId,
      onError,
      onCompleted,
      setDirty,
      submitMutation,
      submitting
    } = this.props
    if (submitting) return
    setDirty()
    const {error, value: description = ''} = this.validate(rawQuestion)
    if (error) return
    submitMutation()
    ReflectTemplatePromptUpdateDescriptionMutation(
      atmosphere,
      {promptId, description},
      {onError, onCompleted}
    )
  }

  legitify(value: string) {
    return new Legitity(value).trim().max(256, 'That description is probably long enough')
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

  onEditChange = (isEditing: boolean) => {
    const {onEditingChange} = this.props
    onEditingChange && onEditingChange(isEditing)
  }

  render() {
    const {isOwner, error, description} = this.props
    return (
      <EditableSubText
        disabled={!isOwner}
        error={error as string}
        hideIcon
        handleSubmit={this.handleSubmit}
        initialValue={description}
        maxLength={256}
        validate={this.validate}
        placeholder={'Description'}
        onEditingChange={this.onEditChange}
      />
    )
  }
}

export default withAtmosphere(withMutationProps(EditableTemplateDescription))
