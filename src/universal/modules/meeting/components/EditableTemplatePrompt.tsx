import React, {Component} from 'react'
import EditableText from 'universal/components/Editable/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  question: string
}

class EditableTemplatePrompt extends Component<Props> {
  handleSubmit (question) {
    console.log('submit!', question)
    // const {submitMutation} = this.props
    // submitMutation()
    // EditTemplateNameMutation(atmosphere, {templateId, question})
  }

  validate (value: string) {
    const {onError} = this.props
    if (value.length > 100) {
      onError('That is a little too long')
      return false
    }
    if (value.length <= 0) {
      onError('Please enter a prompt')
      return false
    }
    return true
  }

  render () {
    const {error, question} = this.props
    return (
      <EditableText
        error={error}
        hideIcon
        handleSubmit={this.handleSubmit}
        initialValue={question}
        maxLength={100}
        validate={this.validate}
        placeholder={'New Prompt'}
      />
    )
  }
}

export default withAtmosphere(withMutationProps(EditableTemplatePrompt))
