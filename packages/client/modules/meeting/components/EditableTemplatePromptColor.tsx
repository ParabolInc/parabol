import React, {Component} from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import styled from '@emotion/styled'
import {ICON_SIZE} from '../../../styles/typographyV2'
import {PALETTE} from '../../../styles/paletteV2'
import PalettePicker from '../../../components/PalettePicker/PalettePicker'
import Icon from 'components/Icon'

interface Props extends WithAtmosphereProps, WithMutationProps {
  groupColor: string
  pickedColors?: string[]
}

interface StyledProps {
  groupColor: string
  isHover?: boolean
}

interface State {
  isEditingColor: boolean
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
    isHover: false,
    isEditingColor: false
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

  onEditColor = (isEditingColor: boolean) => {
    this.setState({
      isEditingColor
    })
  }

  render() {
    const {groupColor, pickedColors} = this.props
    const {isEditingColor, isHover} = this.state
    return (
      <PromptColor
        isHover={isHover}
        isEditingColor={isEditingColor}
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

export default withAtmosphere(withMutationProps(EditableTemplatePromptColor))
