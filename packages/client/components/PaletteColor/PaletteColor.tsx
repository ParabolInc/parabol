import React from 'react'
import useHover from '../../hooks/useHover'
import styled from '@emotion/styled'

interface Props {
  color: string
  isPicked: boolean
  currentSelection: boolean
}

interface ColorProps extends Props {
  isHover: boolean
}

const ColorItem = styled('li')<ColorProps>(({isHover, color, isPicked, currentSelection}) => ({
  backgroundColor: color,
  cursor: isHover ? 'pointer' : 'grab',
  height: 32,
  width: 32,
  borderRadius: '50%',
  opacity: isPicked && !currentSelection ? 0.25 : 1,
  flex: '0 32px',
  position: 'relative',
  transition: 'all 0.3s',
  margin: 9
}))

const SelectedIcon = styled('div')({
  display: 'inline-block',
  transform: 'rotate(45deg)',
  height: 16,
  width: 8,
  borderBottom: '2px solid #fff',
  borderRight: '2px solid #fff',
  position: 'absolute',
  transition: 'all 0.3s',
  top: 7,
  left: 12
})

const PaletteColor = (props: Props) => {
  const {color, isPicked, currentSelection} = props
  const [hoverRef, isHover] = useHover<HTMLElement>()
  return (
    <ColorItem
      ref={hoverRef}
      isHover={isHover}
      color={color}
      isPicked={isPicked}
      currentSelection={currentSelection}
    >
      {currentSelection && <SelectedIcon />}
    </ColorItem>
  )
}

export default PaletteColor
