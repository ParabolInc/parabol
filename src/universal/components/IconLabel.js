import React from 'react'
import PropTypes from 'prop-types'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const LabelBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Label = styled('div')(({iconAfter, iconLarge}) => {
  const gutter = iconLarge ? '.75em' : '.5em'
  return {
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: iconAfter ? `0 ${gutter} 0 0` : `0 0 0 ${gutter}`,
    whiteSpace: 'nowrap'
  }
})

const Icon = styled(StyledFontAwesome)(({iconAfter, iconColor, iconLarge}) => ({
  color: iconColor ? ui.palette[iconColor] : 'inherit',
  display: 'block',
  fontSize: iconLarge ? ui.iconSize2x : ui.iconSize,
  lineHeight: 'inherit',
  order: iconAfter && 2
}))

const IconLabel = (props) => {
  const {icon, label} = props
  return (
    <LabelBlock>
      <Icon name={icon} {...props} />
      {label && <Label {...props}>{label}</Label>}
    </LabelBlock>
  )
}

IconLabel.propTypes = {
  icon: PropTypes.string,
  iconAfter: PropTypes.bool,
  iconColor: PropTypes.oneOf(ui.paletteOptions),
  iconLarge: PropTypes.bool,
  label: PropTypes.any
}

export default IconLabel
