import {Add} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {Threshold} from '~/types/constEnums'
import type {AddTemplatePrompt_prompts$key} from '../../../__generated__/AddTemplatePrompt_prompts.graphql'
import LinkButton from '../../../components/LinkButton'
import AddReflectTemplatePromptMutation from '../../../mutations/AddReflectTemplatePromptMutation'
import {positionAfter} from '../../../shared/sortOrder'

interface Props {
  prompts: AddTemplatePrompt_prompts$key
  templateId: string
}

const AddTemplatePrompt = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const {prompts: promptsRef, templateId} = props
  const prompts = useFragment(
    graphql`
      fragment AddTemplatePrompt_prompts on ReflectPrompt @relay(plural: true) {
        sortOrder
      }
    `,
    promptsRef
  )

  const addPrompt = () => {
    if (submitting) return
    submitMutation()
    const lastPrompt = prompts.at(-1)!
    const sortOrder = positionAfter(lastPrompt.sortOrder)
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
    <LinkButton
      palette='blue'
      onClick={addPrompt}
      waiting={submitting}
      className='m-0 mb-4 flex items-center justify-start px-0 py-1 text-base outline-none'
    >
      <Add className='mx-4 block' />
      <div>Add another prompt</div>
    </LinkButton>
  )
}

export default AddTemplatePrompt
