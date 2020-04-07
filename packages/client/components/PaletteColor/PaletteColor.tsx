import React from 'react'
import useHover from '../../hooks/useHover'
import styled from '@emotion/styled'

interface Props {
  color: string
}

interface ColorProps {
  color: string
  isHover: boolean
}

const ColorItem = styled('li')<ColorProps>(({isHover, color}) => ({
  backgroundColor: color,
  cursor: isHover ? 'pointer' : 'grab',
  height: 32,
  width: 32,
  borderRadius: '50%',
  opacity: isHover ? 0.5 : 1,
  flex: '0 32px',
  margin: 9
}))

const PaletteColor = (props: Props) => {
  const {color} = props
  const [hoverRef, isHover] = useHover<HTMLElement>()
  return <ColorItem ref={hoverRef} isHover={isHover} color={color} />
}

export default PaletteColor
