import type {DraggableProvided} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {TemplatePromptItem_prompts$key} from '~/__generated__/TemplatePromptItem_prompts.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {Cancel as CancelIcon} from '~/ui/icons'
import type {TemplatePromptItem_prompt$key} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import RemoveReflectTemplatePromptMutation from '../../../mutations/RemoveReflectTemplatePromptMutation'
import {cn} from '../../../ui/cn'
import EditableTemplateDescription from './EditableTemplateDescription'
import EditableTemplatePrompt from './EditableTemplatePrompt'
import EditableTemplatePromptColor from './EditableTemplatePromptColor'

interface Props {
  isOwner: boolean
  isDragging: boolean
  prompt: TemplatePromptItem_prompt$key
  prompts: TemplatePromptItem_prompts$key
  dragProvided: DraggableProvided
}

const TemplatePromptItem = (props: Props) => {
  const {dragProvided, isDragging, isOwner, prompt: promptRef, prompts: promptsRef} = props
  const prompts = useFragment(
    graphql`
      fragment TemplatePromptItem_prompts on ReflectPrompt @relay(plural: true) {
        ...EditableTemplatePromptColor_prompts
        ...EditableTemplatePrompt_prompts
      }
    `,
    promptsRef
  )
  const prompt = useFragment(
    graphql`
      fragment TemplatePromptItem_prompt on ReflectPrompt {
        ...EditableTemplatePromptColor_prompt
        id
        question
        description
      }
    `,
    promptRef
  )
  const {id: promptId, description, question} = prompt
  const [isHover, setIsHover] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const canRemove = prompts.length > 1 && isOwner
  const onMouseEnter = () => {
    setIsHover(true)
  }
  const onMouseLeave = () => {
    setIsHover(false)
  }
  const removePrompt = () => {
    if (submitting) return
    if (!canRemove) {
      onError(new Error('You must have at least 1 prompt'))
      return
    }
    submitMutation()
    RemoveReflectTemplatePromptMutation(atmosphere, {promptId}, {onError, onCompleted})
  }

  return (
    <div
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      className={cn(
        'flex w-full items-start px-4 py-1 text-[14px] leading-6',
        isOwner && 'cursor-pointer',
        isOwner && (isHover || isDragging) && 'bg-surface-raised'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <EditableTemplatePromptColor isOwner={isOwner} prompt={prompt} prompts={prompts} />
      <div className='flex w-full flex-col pl-4'>
        <EditableTemplatePrompt
          isOwner={isOwner}
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          question={question}
          promptId={promptId}
          prompts={prompts}
        />
        <EditableTemplateDescription
          isOwner={isOwner}
          description={description}
          onEditingChange={setIsEditingDescription}
          promptId={promptId}
        />
      </div>
      {canRemove && (
        <div
          className={cn(
            'ml-auto flex h-6 w-6 cursor-pointer items-center justify-center p-0 text-fg-secondary [&_svg]:text-[18px]',
            isHover ? 'opacity-100' : 'opacity-0'
          )}
          onClick={removePrompt}
        >
          <CancelIcon />
        </div>
      )}
    </div>
  )
}
export default TemplatePromptItem
