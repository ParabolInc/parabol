import {TemplatePromptList_prompts} from '__generated__/TemplatePromptList_prompts.graphql'
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import MoveReflectTemplatePromptMutation from 'universal/mutations/MoveReflectTemplatePromptMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import TemplatePromptItem from './TemplatePromptItem'
import dndNoise from 'universal/utils/dndNoise'

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompts: TemplatePromptList_prompts
  templateId: string
}

const PromptList = styled('ul')({
  margin: 0,
  padding: '0 2rem',
  width: '100%'
})

const TEMPLATE_PROMPT = 'TEMPLATE_PROMPT'

class TemplatePromptList extends Component<Props> {
  const
  onDragEnd = (result) => {
    const {source, destination} = result
    const {atmosphere, prompts, templateId} = this.props
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_PROMPT ||
      source.droppableId !== TEMPLATE_PROMPT
    ) {
      return
    }

    const sourcePrompt = prompts[source.index]
    const destinationPrompt = prompts[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationPrompt.sortOrder - 1 + dndNoise()
    } else if (destination.index === prompts.length - 1) {
      sortOrder = destinationPrompt.sortOrder + 1 + dndNoise()
    } else {
      sortOrder =
        (prompts[destination.index - 1].sortOrder + destinationPrompt.sortOrder) / 2 + dndNoise()
    }

    const {id: promptId} = sourcePrompt
    const variables = {promptId, sortOrder}
    MoveReflectTemplatePromptMutation(atmosphere, variables, {templateId})
  }

  render () {
    const {prompts} = this.props
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <PromptList>
          <Droppable droppableId={TEMPLATE_PROMPT}>
            {(provided) => {
              return (
                <div ref={provided.innerRef}>
                  {prompts.map((prompt, idx) => {
                    return (
                      <Draggable key={prompt.id} draggableId={prompt.id} index={idx}>
                        {(dragProvided, dragSnapshot) => {
                          return (
                            <TemplatePromptItem
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
                </div>
              )
            }}
          </Droppable>
        </PromptList>
      </DragDropContext>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(TemplatePromptList)),
  graphql`
    fragment TemplatePromptList_prompts on RetroPhaseItem @relay(plural: true) {
      id
      sortOrder
      question
      ...TemplatePromptItem_prompt
      ...EditableTemplatePrompt_prompts
    }
  `
)
