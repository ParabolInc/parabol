import React from 'react'
import CreateCardRootStyles from '../CreateCard/CreateCardRootStyles'
import useHover from '../../hooks/useHover'
import PaletteColor from '../PaletteColor/PaletteColor'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'

interface Props {
  className?: string
  pickedColors?: string[]
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

const PalettePicker = (props: Props) => {
  const {className, pickedColors} = props
  const [hoverRef, isHover] = useHover<HTMLDivElement>()
  return (
    <PaletteDropDown
      ref={hoverRef}
      isHover={isHover}
      className={className}
      pickedColors={pickedColors}
    >
      <PaletteList>
        {Colors.map((color, id) => {
          return <PaletteColor color={color} key={id} />
        })}
      </PaletteList>
    </PaletteDropDown>
  )
}

export default PalettePicker
