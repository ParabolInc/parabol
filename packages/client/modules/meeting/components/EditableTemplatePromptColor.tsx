import React, {Component} from 'react'
import {TemplatePromptItem_prompt} from '../../../__generated__/TemplatePromptItem_prompt.graphql'
import styled from '@emotion/styled'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {PALETTE} from '../../../styles/paletteV2'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import Icon from 'components/Icon'

interface Props {
  groupColor: string
  pickedColors?: string[]
  prompt: TemplatePromptItem_prompt
  prompts: any
  scrollOffset: number
}

interface StyledProps {
  groupColor?: string
  isHover?: boolean
}

interface State {
  isHover: boolean
  offsetTop: number
}

const PromptColor = styled('div')<StyledProps>(({isHover}) => ({
  cursor: isHover ? 'pointer' : 'grab',
  display: 'flex',
  flex: 1,
  padding: '14px 0 5px'
}))

const ColorBadge = styled('div')<StyledProps>(({groupColor}) => ({
  backgroundColor: groupColor ? groupColor : 'green',
  borderRadius: '50%',
  height: '16px',
  width: '16px'
}))

const DropdownIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  opacity: isHover ? 1 : 0
}))

class EditableTemplatePromptColor extends Component<Props, State> {
  state = {
    isHover: false,
    offsetTop: 0
  }

  promptRef: HTMLDivElement | null = null

  setPromptRef = (element: HTMLDivElement) => {
    this.promptRef = element
  }

  componentDidMount() {
    if (this.promptRef) {
      this.setState({offsetTop: this.promptRef.offsetTop})
    }
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

  render() {
    const {groupColor, prompt, prompts, scrollOffset} = this.props
    const {isHover, offsetTop} = this.state
    return (
      <PromptColor
        ref={this.setPromptRef}
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <ColorBadge groupColor={groupColor} />
        <DropdownIcon isHover={isHover}>arrow_drop_down</DropdownIcon>
        {isHover && (
          <PalettePicker
            prompt={prompt}
            prompts={prompts}
            scrollOffset={scrollOffset}
            offsetTop={offsetTop}
          />
        )}
      </PromptColor>
    )
  }
}

export default EditableTemplatePromptColor
