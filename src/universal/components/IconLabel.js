import React from 'react'
import PropTypes from 'prop-types'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18, MD_ICONS_SIZE_24} from 'universal/styles/icons'

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

const StyledIcon = styled(Icon)(({iconAfter, iconColor, iconLarge}) => ({
  color: iconColor ? ui.palette[iconColor] : 'inherit',
  display: 'block',
  fontSize: iconLarge ? MD_ICONS_SIZE_24 : MD_ICONS_SIZE_18,
  order: iconAfter && 2
}))

const IconLabel = (props) => {
  const {icon, label} = props
  return (
    <LabelBlock>
      <StyledIcon {...props}>{icon}</StyledIcon>
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
