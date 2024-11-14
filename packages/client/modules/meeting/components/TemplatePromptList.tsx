import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import {TemplatePromptList_prompts$key} from '../../../__generated__/TemplatePromptList_prompts.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import MoveReflectTemplatePromptMutation from '../../../mutations/MoveReflectTemplatePromptMutation'
import {getSortOrder} from '../../../shared/sortOrder'
import {TEMPLATE_PROMPT} from '../../../utils/constants'
import TemplatePromptItem from './TemplatePromptItem'

interface Props {
  isOwner: boolean
  prompts: TemplatePromptList_prompts$key
  templateId: string
}

const PromptList = styled('div')({
  margin: 0,
  padding: 0,
  width: '100%'
})

const TemplatePromptList = (props: Props) => {
  const {isOwner, prompts: promptsRef, templateId} = props
  const prompts = useFragment(
    graphql`
      fragment TemplatePromptList_prompts on ReflectPrompt @relay(plural: true) {
        id
        sortOrder
        question
        groupColor
        ...TemplatePromptItem_prompt
        ...TemplatePromptItem_prompts
      }
    `,
    promptsRef
  )
  const atmosphere = useAtmosphere()

  const onDragEnd = (result: DropResult) => {
    const {source, destination} = result
    if (!destination) return
    const sourcePrompt = prompts[source.index]
    const destinationPrompt = prompts[destination.index]
    if (
      destination.droppableId !== TEMPLATE_PROMPT ||
      source.droppableId !== TEMPLATE_PROMPT ||
      destination.index === source.index ||
      !sourcePrompt ||
      !destinationPrompt
    ) {
      return
    }
    const sortOrder = getSortOrder(prompts, source.index, destination.index)
    const {id: promptId} = sourcePrompt
    const variables = {promptId, sortOrder}
    MoveReflectTemplatePromptMutation(atmosphere, variables, {templateId})
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <PromptList>
        <Droppable droppableId={TEMPLATE_PROMPT} isDropDisabled={!isOwner}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {prompts.map((prompt, idx) => {
                  return (
                    <Draggable
                      key={prompt.id}
                      draggableId={prompt.id}
                      index={idx}
                      isDragDisabled={!isOwner}
                    >
                      {(dragProvided, dragSnapshot) => {
                        return (
                          <TemplatePromptItem
                            isOwner={isOwner}
                            prompt={prompt}
                            prompts={prompts}
                            isDragging={dragSnapshot.isDragging}
                            dragProvided={dragProvided}
                          />
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </PromptList>
    </DragDropContext>
  )
}

export default TemplatePromptList
