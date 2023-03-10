import styled from '@emotion/styled'
import {Cancel as CancelIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {TemplatePromptItem_prompts$key} from '~/__generated__/TemplatePromptItem_prompts.graphql'
import RemoveReflectTemplatePromptMutation from '../../../mutations/RemoveReflectTemplatePromptMutation'
import {PALETTE} from '../../../styles/paletteV3'
import {TemplatePromptItem_prompt$key} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
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

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
}

const PromptItem = styled('div')<StyledProps & {isOwner: boolean}>(
  ({isOwner, isHover, isDragging}) => ({
    alignItems: 'flex-start',
    backgroundColor: isOwner && (isHover || isDragging) ? PALETTE.SLATE_100 : undefined,
    cursor: isOwner ? 'pointer' : undefined,
    display: 'flex',
    fontSize: 14,
    lineHeight: '24px',
    padding: '4px 16px',
    width: '100%'
  })
)

const RemovePromptIcon = styled('div')<StyledProps>(({isHover}) => ({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  svg: {
    fontSize: 18
  },
  height: 24,
  marginLeft: 'auto',
  padding: 0,
  opacity: isHover ? 1 : 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 24
}))

const PromptAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16
})

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
    <PromptItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      isOwner={isOwner}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <EditableTemplatePromptColor isOwner={isOwner} prompt={prompt} prompts={prompts} />
      <PromptAndDescription>
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
      </PromptAndDescription>
      {canRemove && (
        <RemovePromptIcon isHover={isHover} onClick={removePrompt}>
          <CancelIcon />
        </RemovePromptIcon>
      )}
    </PromptItem>
  )
}
export default TemplatePromptItem
