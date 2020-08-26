import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import EditableText from '../../../components/EditableText'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import RenameReflectTemplatePromptMutation from '../../../mutations/RenameReflectTemplatePromptMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import Legitity from '../../../validation/Legitity'
import {EditableTemplatePrompt_prompts} from '../../../__generated__/EditableTemplatePrompt_prompts.graphql'

const StyledEditableText = styled(EditableText)({
  fontSize: 16,
  lineHeight: '24px',
  padding: 0
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  question: string
  promptId: string
  prompts: EditableTemplatePrompt_prompts
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

  legitify(value: string) {
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

  render() {
    const {isOwner, error, isHover, question, isEditingDescription} = this.props
    return (
      <StyledEditableText
        autoFocus={question.startsWith('New prompt #')}
        disabled={!isOwner}
        error={error as string}
        hideIcon={isEditingDescription ? true : !isHover}
        handleSubmit={this.handleSubmit}
        initialValue={question}
        maxLength={100}
        validate={this.validate}
        placeholder={'New Prompt'}
      />
    )
  }
}

export default createFragmentContainer(withAtmosphere(withMutationProps(EditableTemplatePrompt)), {
  prompts: graphql`
    fragment EditableTemplatePrompt_prompts on ReflectPrompt @relay(plural: true) {
      id
      question
    }
  `
})
