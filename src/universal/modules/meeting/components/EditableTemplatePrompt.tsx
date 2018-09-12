import React, {Component} from 'react'
import EditableText from 'universal/components/Editable/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {Legitity} from 'universal/validation/legitify'
import RenameReflectTemplatePromptMutation from '../../../mutations/RenameReflectTemplatePromptMutation'

interface Props extends WithAtmosphereProps, WithMutationProps {
  question: string
  promptId: string
  prompts: ReadonlyArray<{id: string; question: string}>
}

class EditableTemplatePrompt extends Component<Props> {
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
    const {error, value: question} = this.validate(rawQuestion)
    if (error) return
    submitMutation()
    RenameReflectTemplatePromptMutation(atmosphere, {promptId, question}, {}, onError, onCompleted)
  }

  legitify (value) {
    const {promptId, prompts} = this.props
    return new Legitity(value)
      .trim()
      .required('Please enter a prompt question')
      .max(100, 'That question is probably long enough')
      .test((mVal) => {
        const isDupe = prompts.find(
          (prompt) => prompt.id !== promptId && prompt.question.toLowerCase() === mVal.toLowerCase()
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
