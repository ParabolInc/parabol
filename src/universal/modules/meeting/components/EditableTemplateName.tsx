import React, {Component} from 'react'
import EditableText from 'universal/components/Editable/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props extends WithAtmosphereProps, WithMutationProps {
  name: string
}

class EditableTemplateName extends Component<Props> {
  handleSubmit (name) {
    console.log('submit!', name)
    // const {submitMutation} = this.props
    // submitMutation()
    // EditTemplateNameMutation(atmosphere, {templateId, name})
  }

  validate (value: string) {
    const {onError} = this.props
    if (value.length > 100) {
      onError('That is a little too long')
      return false
    }
    if (value.length <= 0) {
      onError('Please enter a template name')
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
