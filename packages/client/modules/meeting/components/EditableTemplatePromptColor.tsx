import React, {Component} from 'react'
import styled from '@emotion/styled'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {PALETTE} from '../../../styles/paletteV2'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import Icon from 'components/Icon'

interface Props {
  groupColor: string
  pickedColors?: string[]
}

interface StyledProps {
  groupColor?: string
  isHover?: boolean
}

interface State {
  isHover: boolean
}

const PromptColor = styled('div')<StyledProps>(({isHover}) => ({
  cursor: isHover ? 'pointer' : 'grab',
  display: 'flex',
  flex: 1,
  padding: '14px 0 5px',
  position: 'relative'
}))

const ColorBadge = styled('div')<StyledProps>(({groupColor, isHover}) => ({
  backgroundColor: groupColor ? groupColor : 'green',
  borderRadius: '50%',
  height: '16px',
  width: '16px',
  opacity: isHover ? 0.6 : 1
}))

const DropdownIcon = styled(Icon)<StyledProps>(({isHover}) => ({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  opacity: isHover ? 1 : 0
}))

class EditableTemplatePromptColor extends Component<Props, State> {
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

  render() {
    const {groupColor, pickedColors} = this.props
    const {isHover} = this.state
    return (
      <PromptColor
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <ColorBadge groupColor={groupColor} />
        <DropdownIcon isHover={isHover}>arrow_drop_down</DropdownIcon>
        {isHover && <PalettePicker isHover={isHover} pickedColors={pickedColors} />}
      </PromptColor>
    )
  }
}

export default EditableTemplatePromptColor
