import PropTypes from 'prop-types'
import React from 'react'
import ui from '../../styles/ui'
import appTheme from '../../styles/theme/appTheme'
import styled from '@emotion/styled'

const boxShadow = '.0625rem .0625rem .125rem rgba(0, 0, 0, .5)'

const BadgeRoot = styled('div')(({colorPalette, flat}) => ({
  backgroundColor: ui.palette[colorPalette] || ui.palette.warm,
  borderRadius: '1rem',
  boxShadow: !flat && boxShadow,
  color: ui.palette.white,
  fontSize: appTheme.typography.s1,
  fontWeight: 600,
  height: '1rem',
  lineHeight: '1rem',
  minWidth: '1rem',
  padding: '0 .25rem',
  textAlign: 'center'
}))

const Badge = (props) => <BadgeRoot {...props}>{props.value || 0}</BadgeRoot>

Badge.propTypes = {
  colorPalette: PropTypes.oneOf(['cool', 'dark', 'mid', 'midGray', 'warm']),
  flat: PropTypes.bool,
  value: PropTypes.number
}

export default Badge
