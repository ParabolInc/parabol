import styled from '@emotion/styled'
import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {Threshold} from '~/types/constEnums'
import LinkButton from '../../../components/LinkButton'
import AddReflectTemplatePromptMutation from '../../../mutations/AddReflectTemplatePromptMutation'
import dndNoise from '../../../utils/dndNoise'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import {AddTemplatePrompt_prompts$key} from '../../../__generated__/AddTemplatePrompt_prompts.graphql'

const AddPromptLink = styled(LinkButton)({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 16,
  // fontWeight: 600,
  lineHeight: '24px',
  margin: 0,
  marginBottom: 16,
  outline: 'none',
  padding: '4px 0'
})

const AddPromptLinkPlus = styled(Add)({
  display: 'block',
  margin: '0 16px 0 16px'
})

interface Props extends WithMutationProps {
  prompts: AddTemplatePrompt_prompts$key
  templateId: string
}

const AddTemplatePrompt = (props: Props) => {
  const atmosphere = useAtmosphere()

  const {prompts: promptsRef, submitting} = props
  const prompts = useFragment(
    graphql`
      fragment AddTemplatePrompt_prompts on ReflectPrompt @relay(plural: true) {
        sortOrder
      }
    `,
    promptsRef
  )

  const addPrompt = () => {
    const {templateId, onError, onCompleted, submitMutation, submitting} = props
    if (submitting) return
    submitMutation()
    const sortOrders = prompts.map(({sortOrder}) => sortOrder)
    const sortOrder = Math.max(0, ...sortOrders) + 1 + dndNoise()
    const promptCount = prompts.length
    AddReflectTemplatePromptMutation(
      atmosphere,
      {templateId},
      {
        promptCount,
        sortOrder,
        onError,
        onCompleted
      }
    )
  }
  if (prompts.length >= Threshold.MAX_REFLECTION_PROMPTS) return null
  return (
    <AddPromptLink palette='blue' onClick={addPrompt} waiting={submitting}>
      <AddPromptLinkPlus />
      <div>Add another prompt</div>
    </AddPromptLink>
  )
}

export default withMutationProps(AddTemplatePrompt)
