import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import EditableText from '../../../components/EditableText'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import RenameReflectTemplatePromptMutation from '../../../mutations/RenameReflectTemplatePromptMutation'
import Legitity from '../../../validation/Legitity'
import {EditableTemplatePrompt_prompts$key} from '../../../__generated__/EditableTemplatePrompt_prompts.graphql'

const StyledEditableText = styled(EditableText)({
  fontSize: 16,
  lineHeight: '24px',
  padding: 0
})

interface Props {
  isOwner: boolean
  isEditingDescription: boolean
  isHover: boolean
  question: string
  promptId: string
  prompts: EditableTemplatePrompt_prompts$key
}

const EditableTemplatePrompt = (props: Props) => {
  const {isOwner, promptId, isHover, question, isEditingDescription, prompts: promptsRef} = props
  const prompts = useFragment(
    graphql`
      fragment EditableTemplatePrompt_prompts on ReflectPrompt @relay(plural: true) {
        id
        question
      }
    `,
    promptsRef
  )
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  const handleSubmit = (rawQuestion: string) => {
    if (submitting) return
    const {error, value: question} = validate(rawQuestion)
    if (error) return
    submitMutation()
    RenameReflectTemplatePromptMutation(atmosphere, {promptId, question}, {onError, onCompleted})
  }

  const legitify = (value: string) => {
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
    <StyledEditableText
      autoFocus={question.startsWith('New prompt #')}
      disabled={!isOwner}
      error={error?.message}
      hideIcon={isEditingDescription ? true : !isHover}
      handleSubmit={handleSubmit}
      initialValue={question}
      maxLength={100}
      validate={validate}
      placeholder={'New Prompt'}
    />
  )
}

export default EditableTemplatePrompt
