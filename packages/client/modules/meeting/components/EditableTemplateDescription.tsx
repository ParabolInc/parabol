import React, {Component} from 'react'
import styled from '@emotion/styled'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import ReflectTemplatePromptUpdateDescriptionMutation from '../../../mutations/ReflectTemplatePromptUpdateDescriptionMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'

interface Props extends WithAtmosphereProps, WithMutationProps {
  description: string
  promptId: string
  onEditingChange: (isEditing: boolean) => void
}

const EditableSubText = styled(EditableText)({
  fontSize: 14,
  lineHeight: 1,
  marginBottom: 8
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
    const {error, description} = this.props
    return (
      <EditableSubText
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
