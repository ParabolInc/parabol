import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import {TemplatePromptItem_prompts} from '~/__generated__/TemplatePromptItem_prompts.graphql'
import Icon from '../../../components/Icon'
import RemoveReflectTemplatePromptMutation from '../../../mutations/RemoveReflectTemplatePromptMutation'
import {PALETTE} from '../../../styles/paletteV2'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {TemplatePromptItem_prompt} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import EditableTemplateDescription from './EditableTemplateDescription'
import EditableTemplatePrompt from './EditableTemplatePrompt'
import EditableTemplatePromptColor from './EditableTemplatePromptColor'

interface Props {
  isDragging: boolean
  prompt: TemplatePromptItem_prompt
  prompts: TemplatePromptItem_prompts
  dragProvided: DraggableProvided
}

interface StyledProps {
  isDragging?: boolean
  isHover?: boolean
}

const lineHeight = '2.75rem'

const PromptItem = styled('li')<StyledProps>(({isHover, isDragging}) => ({
  alignItems: 'flex-start',
  backgroundColor: isHover || isDragging ? PALETTE.BACKGROUND_MAIN_LIGHTENED : undefined,
  borderRadius: '.125rem',
  display: 'flex',
  fontSize: 18,
  lineHeight,
  padding: '0 .6875rem 0 1rem'
}))

const RemovePromptIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  cursor: 'pointer',
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  lineHeight,
  marginLeft: 'auto',
  opacity: isHover ? 1 : 0
}))

const PromptAndDescription = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
})

const TemplatePromptItem = (props: Props) => {
  const {dragProvided, isDragging, prompt, prompts} = props
  const {id: promptId, description, question} = prompt
  const [isHover, setIsHover] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const canRemove = prompts.length > 1
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
    RemoveReflectTemplatePromptMutation(atmosphere, {promptId}, {}, onError, onCompleted)
  }

  return (
    <PromptItem
      ref={dragProvided.innerRef}
      {...dragProvided.dragHandleProps}
      {...dragProvided.draggableProps}
      isDragging={isDragging}
      isHover={isHover}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <EditableTemplatePromptColor prompt={prompt} prompts={prompts} />
      <PromptAndDescription>
        <EditableTemplatePrompt
          isEditingDescription={isEditingDescription}
          isHover={isHover}
          question={question}
          promptId={promptId}
          prompts={prompts}
        />
        <EditableTemplateDescription
          description={description}
          onEditingChange={setIsEditingDescription}
          promptId={promptId}
        />
      </PromptAndDescription>
      {canRemove && (
        <RemovePromptIcon isHover={isHover} onClick={removePrompt}>
          cancel
        </RemovePromptIcon>
      )}
    </PromptItem>
  )
}
export default createFragmentContainer(TemplatePromptItem, {
  prompts: graphql`
    fragment TemplatePromptItem_prompts on RetroPhaseItem @relay(plural: true) {
      ...EditableTemplatePromptColor_prompts
      ...EditableTemplatePrompt_prompts
    }
  `,
  prompt: graphql`
    fragment TemplatePromptItem_prompt on RetroPhaseItem {
      ...EditableTemplatePromptColor_prompt
      id
      question
      description
    }
  `
})
