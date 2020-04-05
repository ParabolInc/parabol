import React, {Component} from 'react'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'

interface Props {
  className?: string
  pickedColors?: string[]
  isHover: boolean
}

interface ColorProps {
  color: string
  isHover: boolean
}

interface State {
  isHover: boolean
}

const PaletteDropDown = styled('div')<Props>({
  ...CreateCardRootStyles,
  border: 0,
  height: '160px',
  width: '214px',
  minWidth: '214px',
  padding: 5,
  position: 'absolute',
  zIndex: 1,
  top: 34
})

const PaletteList = styled('ul')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  listStyle: 'none',
  padding: 0
})

const PaletteColor = styled('li')<ColorProps>(({isHover, color}) => ({
  backgroundColor: color,
  height: 32,
  width: 32,
  borderRadius: '50%',
  opacity: isHover ? 0.5 : 1,
  flex: '0 32px',
  margin: 9
}))

const Colors = [
  PALETTE.PROMPT_RED,
  PALETTE.PROMPT_ORANGE,
  PALETTE.PROMPT_YELLOW,
  PALETTE.PROMPT_LIGHT_GREEN,
  PALETTE.PROMPT_GREEN,
  PALETTE.PROMPT_CYAN,
  PALETTE.PROMPT_LIGHT_BLUE,
  PALETTE.PROMPT_BLUE,
  PALETTE.PROMPT_PURPLE,
  PALETTE.PROMPT_VIOLET,
  PALETTE.PROMPT_FUCHSIA,
  PALETTE.PROMPT_PINK
]

class PalettePicker extends Component<Props, State> {
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
    const {className, pickedColors} = this.props
    const {isHover} = this.state
    return (
      <PaletteDropDown isHover={isHover} className={className} pickedColors={pickedColors}>
        <PaletteList>
          {Colors.map((color, id) => {
            return <PaletteColor color={color} isHover={isHover} key={id} />
          })}
        </PaletteList>
      </PaletteDropDown>
    )
  }
}

export default PalettePicker
