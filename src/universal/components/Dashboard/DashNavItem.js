import PropTypes from 'prop-types'
import React from 'react'
import ui from 'universal/styles/ui'
import {NavLink} from 'react-router-dom'
import DashNavItemBaseStyles from './DashNavItemBaseStyles'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import styled, {css, cx} from 'react-emotion'

const linkStyles = css({
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

const linkActiveStyles = css({
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

const Icon = styled(StyledFontAwesome)({
  display: 'block',
  fontSize: ui.iconSize,
  height: ui.iconSize,
  lineHeight: ui.iconSize,
  opacity: '.5',
  textAlign: 'left',
  width: '1.625rem'
})

const DashNavItem = (props) => {
  const {label, href, icon} = props
  return (
    <NavLink
      activeClassName={cx(linkStyles, linkActiveStyles)}
      className={linkStyles}
      exact={href === '/me'}
      title={label}
      to={href}
    >
      {icon && <Icon name={icon} />}
      <Label>{label}</Label>
    </NavLink>
  )
}

DashNavItem.propTypes = {
  href: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string
}

// router for navlink unblock
export default DashNavItem
