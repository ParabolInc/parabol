import React from 'react'
import styled from '@emotion/styled'
import ui from '../../styles/ui'
import appTheme from '../../styles/theme/theme'

const tagTheme = {
  cool: {
    backgroundColor: ui.palette.cool,
    color: ui.palette.white
  },

  gray: {
    backgroundColor: ui.palette.light,
    color: ui.palette.dark
  },

  midGray: {
    backgroundColor: ui.palette.midGray,
    color: ui.palette.white
  },

  light: {
    backgroundColor: ui.palette.light,
    color: ui.palette.dark
  },

  warm: {
    backgroundColor: ui.palette.warm,
    color: ui.palette.white
  },

  yellow: {
    backgroundColor: ui.palette.yellow,
    color: ui.palette.mid
  },

  blue: {
    backgroundColor: ui.palette.blue,
    color: ui.palette.white
  },

  white: {
    backgroundColor: ui.palette.white,
    color: ui.palette.mid
  },

  purple: {
    backgroundColor: appTheme.brand.primary.purpleLightened,
    color: ui.palette.white
  }
}

const TagRoot = styled('div')<{colorPalette: keyof typeof tagTheme}>(({colorPalette}) => ({
  backgroundColor: tagTheme[colorPalette].backgroundColor,
  borderRadius: '4em',
  color: tagTheme[colorPalette].color,
  fontSize: 11,
  fontWeight: 600,
  height: 16,
  lineHeight: '16px',
  marginLeft: 8,
  padding: '0 8px',
  textAlign: 'center',
  userSelect: 'none'
}))

interface Props {
  className?: string
  colorPalette?: keyof typeof tagTheme
  label: string
}

const Tag = (props: Props) => {
  const {className, colorPalette, label} = props
  return (
    <TagRoot className={className} colorPalette={colorPalette || 'midGray'}>
      {label}
    </TagRoot>
  )
}

export default Tag
