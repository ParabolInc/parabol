// deprecated, refactor & use
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import BaseTag from './BaseTag'

const tagTheme = {
  gray: {
    backgroundColor: PALETTE.BACKGROUND_MAIN,
    color: PALETTE.TEXT_MAIN
  },

  midGray: {
    backgroundColor: PALETTE.BACKGROUND_GRAY,
    color: '#FFFFFF'
  },

  yellow: {
    backgroundColor: PALETTE.BACKGROUND_YELLOW,
    color: PALETTE.TEXT_PURPLE
  },

  blue: {
    backgroundColor: PALETTE.BACKGROUND_BLUE,
    color: '#FFFFFF'
  },

  white: {
    backgroundColor: '#FFFFFF',
    color: PALETTE.TEXT_PURPLE
  }
}

const TagRoot = styled(BaseTag)<{colorPalette?: keyof typeof tagTheme}>(({colorPalette = 'midGray'}) => {
  const {backgroundColor, color} = tagTheme[colorPalette]
  return {backgroundColor, color}
})

interface Props {
  className?: string
  colorPalette?: keyof typeof tagTheme
  label: string
}

const Tag = (props: Props) => {
  const {className, colorPalette, label} = props
  return (
    <TagRoot className={className} colorPalette={colorPalette}>
      {label}
    </TagRoot>
  )
}

export default Tag
