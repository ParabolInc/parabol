import {TemplatePromptList_prompts} from '../../../__generated__/TemplatePromptList_prompts.graphql'
import React, {Component} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import MoveReflectTemplatePromptMutation from '../../../mutations/MoveReflectTemplatePromptMutation'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import TemplatePromptItem from './TemplatePromptItem'
import dndNoise from '../../../utils/dndNoise'

interface Props extends WithAtmosphereProps, WithMutationProps {
  prompts: TemplatePromptList_prompts
  templateId: string
}

interface State {
  scrollOffset: number
}

const PromptList = styled('ul')({
  margin: 0,
  marginBottom: 16,
  overflowY: 'auto',
  padding: '0 2rem',
  width: '100%'
})

const TEMPLATE_PROMPT = 'TEMPLATE_PROMPT'

class TemplatePromptList extends Component<Props, State> {
  state = {
    scrollOffset: 0
  }

  /**
   * This is needed to offset the Palette Picker dropdown since it needs to
   * position itself to the ReflectTemplateModal's PromptEditor in order to not
   * be hidden by the overflow on scroll.
   */
  scrollRef: HTMLUListElement | null = null

  setScrollRef = (element: HTMLUListElement) => {
    this.scrollRef = element
  }

  componentDidMount() {
    if (this.scrollRef) {
      this.scrollRef.addEventListener('scroll', this.handleScroll)
    }
  }

  componentWillUnmount() {
    if (this.scrollRef) {
      this.scrollRef.removeEventListener('scroll', this.handleScroll)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.prompts.length < prevProps.prompts.length) {
      // Trigger scroll event so scrollOffset can be recalculated.
      // This is useful for when prompts are removed.
      window.scrollTo(window.scrollX, window.scrollY)
    }
  }

  handleScroll = (event) => {
    this.setState({
      scrollOffset: event.srcElement.scrollTop
    })
  }

  onDragEnd = (result) => {
    const {source, destination} = result
    const {atmosphere, prompts, templateId} = this.props
    if (
      !destination ||
      destination.droppableId !== TEMPLATE_PROMPT ||
      source.droppableId !== TEMPLATE_PROMPT ||
      destination.index === source.index
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
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (prompts[destination.index + offset].sortOrder + destinationPrompt.sortOrder) / 2 +
        dndNoise()
    }

    const {id: promptId} = sourcePrompt
    const variables = {promptId, sortOrder}
    MoveReflectTemplatePromptMutation(atmosphere, variables, {templateId})
  }

  render() {
    const {prompts} = this.props
    const {scrollOffset} = this.state
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <PromptList ref={this.setScrollRef}>
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
                              scrollOffset={scrollOffset}
                              canRemove={prompts.length > 1}
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
}

export default createFragmentContainer(withAtmosphere(withMutationProps(TemplatePromptList)), {
  prompts: graphql`
    fragment TemplatePromptList_prompts on RetroPhaseItem @relay(plural: true) {
      id
      sortOrder
      question
      groupColor
      ...TemplatePromptItem_prompt
      ...EditableTemplatePrompt_prompts
    }
  `
})
