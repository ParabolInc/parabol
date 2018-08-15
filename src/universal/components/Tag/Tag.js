import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/theme'

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

const TagRoot = styled('div')(({colorPalette}) => ({
  backgroundColor: tagTheme[colorPalette].backgroundColor,
  borderRadius: '4em',
  color: tagTheme[colorPalette].color,
  display: 'inline-block',
  fontSize: ui.tagFontSize,
  fontWeight: ui.tagFontWeight,
  height: ui.tagHeight,
  lineHeight: ui.tagHeight,
  marginLeft: ui.tagGutter,
  padding: ui.tagPadding,
  textAlign: 'center',
  userSelect: 'none',
  verticalAlign: 'middle'
}))

const Tag = (props) => {
  const {colorPalette, label} = props
  return <TagRoot colorPalette={colorPalette || 'midGray'}>{label}</TagRoot>
}

Tag.propTypes = {
  colorPalette: PropTypes.oneOf(Object.keys(tagTheme)),
  label: PropTypes.string
}

export default Tag
