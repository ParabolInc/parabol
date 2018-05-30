import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import {NavLink} from 'react-router-dom'
import DashNavItemBaseStyles from './DashNavItemBaseStyles'
import FontAwesome from 'react-fontawesome'
import styled, {css} from 'react-emotion'

const ItemIcon = styled(FontAwesome)({
  display: 'block',
  fontSize: ui.iconSize,
  height: ui.iconSize,
  lineHeight: ui.iconSize,
  opacity: '.5',
  textAlign: 'left',
  width: '1.625rem'
})

const navLinkcss = css({
  ...DashNavItemBaseStyles,
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
      {icon && <ItemIcon name={icon} />}
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
