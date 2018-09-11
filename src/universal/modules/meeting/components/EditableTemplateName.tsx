import React, {Component} from 'react'
import EditableText from 'universal/components/Editable/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import RenameReflectTemplateMutation from '../../../mutations/RenameReflectTemplateMutation'

interface Props extends WithAtmosphereProps, WithMutationProps {
  name: string
  templateId: string
}

class EditableTemplateName extends Component<Props> {
  handleSubmit = (rawName) => {
    const {
      atmosphere,
      templateId,
      name,
      onError,
      onCompleted,
      submitMutation,
      submitting
    } = this.props
    const trimmedName = rawName.trim()
    const normalizedName = trimmedName || 'Unnamed Template'
    if (normalizedName === name || submitting) return
    submitMutation()
    RenameReflectTemplateMutation(
      atmosphere,
      {templateId, name: normalizedName},
      {},
      onError,
      onCompleted
    )
  }

  validate = (value: string) => {
    const {onError} = this.props
    if (value.length > 100) {
      onError('That is a little too long')
      return false
    }
    return true
  }

  render () {
    const {error, name} = this.props
    return (
      <EditableText
        error={error}
        handleSubmit={this.handleSubmit}
        initialValue={name}
        maxLength={100}
        validate={this.validate}
        placeholder={'*New Template'}
      />
    )
  }
}

export default withAtmosphere(withMutationProps(EditableTemplateName))
