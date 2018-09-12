import {TemplatePromptItem_prompt} from '__generated__/TemplatePromptItem_prompt.graphql'
import React, {Component} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplatePromptMutation from 'universal/mutations/RemoveReflectTemplatePromptMutation'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'
import {PALETTE} from 'universal/styles/paletteV2'
import {typeScale} from 'universal/styles/theme/typography'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import EditableTemplatePrompt from './EditableTemplatePrompt'

interface PassedProps {
  isDragging: boolean
  prompt: TemplatePromptItem_prompt
  prompts: any
  dragProvided: DraggableProvided
}

interface Props extends WithAtmosphereProps, WithMutationProps, PassedProps {}

interface State {
  isHover: boolean
}

interface HoverProp {
  isHover: boolean
}

const PromptItem = styled('li')(({isHover}: HoverProp) => ({
  backgroundColor: isHover ? PALETTE.BACKGROUND.MAIN_LIGHTENED : undefined,
  borderRadius: '.125rem',
  display: 'flex',
  fontSize: typeScale[5],
  lineHeight: '2.75rem',
  padding: '0 1rem'
}))

const EditTemplateIcon = styled(StyledFontAwesome)(({isHover}: HoverProp) => ({
  color: PALETTE.TEXT.MAIN,
  fontSize: ICON_SIZE_FA_1X,
  opacity: isHover ? 1 : 0,
  margin: '15px 0 0 10px'
}))

const RemovePrompt = styled(StyledFontAwesome)(({isHover}: HoverProp) => ({
  opacity: isHover ? 1 : 0
}))

class TemplatePromptItem extends Component<Props, State> {
  state = {
    isHover: false
  }
  onMouseEnter = () => {
    this.setState({
      isHover: true
    })
  }

  onMouseLeave = () => {
    this.setState({
      isHover: false
    })
  }

  removePrompt = () => {
    const {
      onError,
      onCompleted,
      submitting,
      submitMutation,
      atmosphere,
      prompt,
      prompts
    } = this.props
    if (submitting) return
    if (prompts.length <= 1) {
      onError('You must have at least 1 prompt')
      return
    }
    submitMutation()
    RemoveReflectTemplatePromptMutation(atmosphere, {promptId: prompt.id}, {}, onError, onCompleted)
  }

  render () {
    const {dragProvided, prompt, prompts} = this.props
    const {id: promptId, question} = prompt
    const {isHover} = this.state
    return (
      <PromptItem
        innerRef={dragProvided.innerRef}
        {...dragProvided.dragHandleProps}
        {...dragProvided.draggableProps}
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <EditableTemplatePrompt question={question} promptId={promptId} prompts={prompts} />
        <EditTemplateIcon isHover={isHover} name={'pencil'} />
        <RemovePrompt isHover={isHover} name={'times-circle'} onClick={this.removePrompt} />
      </PromptItem>
    )
  }
}

export default createFragmentContainer<PassedProps>(
  withAtmosphere(withMutationProps(TemplatePromptItem)),
  graphql`
    fragment TemplatePromptItem_prompt on RetroPhaseItem {
      id
      question
    }
  `
)
