import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import {NavLink} from 'react-router-dom'
import styled, {css} from 'react-emotion'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const StyledIcon = styled(Icon)({
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem',
  opacity: '.5',
  textAlign: 'left'
})

const navLinkcss = css({
  borderLeft: '.1875rem solid transparent',
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  fontSize: ui.navMenuFontSize,
  fontWeight: 600,
  lineHeight: ui.navMenuLineHeight,
  padding: '.625rem .5rem .625rem 2rem',
  transition: `background-color ${ui.transition[0]}`,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: ui.navMenuDarkBackgroundColorHover,
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none'
  },
  ':focus': {
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none'
  }
})

const activeNavLinkcss = css({
  backgroundColor: ui.navMenuDarkBackgroundColorActive,
  borderColor: `${ui.palette.white} !important`,
  cursor: 'default',
  textDecoration: 'none',
  ':hover': {
    backgroundColor: ui.navMenuDarkBackgroundColorActive,
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none'
  }
})

const Label = styled('div')({
  flex: 1,
  wordBreak: 'break-word'
})

const DashNavItem = (props) => {
  const {label, href, icon} = props

  return (
    <NavLink
      activeClassName={activeNavLinkcss}
      className={navLinkcss}
      exact={href === '/me'}
      title={label}
      to={href}
    >
      {icon && <StyledIcon>{icon}</StyledIcon>}
      <Label>{label}</Label>
    </NavLink>
  )
}

DashNavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string
}

export default DashNavItem
