import {TemplatePromptItem_prompt} from '__generated__/TemplatePromptItem_prompt.graphql'
import React, {Component} from 'react'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {createFragmentContainer, graphql} from 'react-relay'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'
import {typeScale} from 'universal/styles/theme/typography'
import EditableTemplatePrompt from './EditableTemplatePrompt'

interface Props {
  prompt: TemplatePromptItem_prompt
  prompts: ReadonlyArray<TemplatePromptItem_prompt>
}

interface State {
  isHover: boolean
}

const PromptItem = styled('li')(({isHover}: {isHover: boolean}) => ({
  backgroundColor: isHover && PALETTE.BACKGROUND.MAIN_LIGHTENED,
  borderRadius: '.125rem',
  display: 'flex',
  fontSize: typeScale[5],
  lineHeight: '2.75rem',
  padding: '0 1rem'
}))

const EditTemplateIcon = styled(StyledFontAwesome)(({isHover}: {isHover: boolean}) => ({
  color: PALETTE.TEXT.MAIN,
  fontSize: ICON_SIZE_FA_1X,
  opacity: isHover ? 1 : 0,
  margin: '15px 0 0 10px'
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

  render () {
    const {prompt, prompts} = this.props
    const {id: promptId, question} = prompt
    const {isHover} = this.state
    return (
      <PromptItem
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <EditableTemplatePrompt question={question} promptId={promptId} prompts={prompts} />
        <EditTemplateIcon isHover={isHover} name={'pencil'} />
      </PromptItem>
    )
  }
}

export default createFragmentContainer(
  TemplatePromptItem,
  graphql`
    fragment TemplatePromptItem_prompt on RetroPhaseItem {
      id
      question
    }
  `
)
