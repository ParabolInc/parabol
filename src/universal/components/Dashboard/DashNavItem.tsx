import React from 'react'
import ui from 'universal/styles/ui'
import {NavLink} from 'react-router-dom'
import styled, {css} from 'react-emotion'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const StyledIcon = styled(Icon)({
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  marginRight: 8,
  opacity: 0.5,
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
  padding: '10px 8px 10px 32px',
  transition: `background-color 100ms ease-in`,
  userSelect: 'none',
  width: '100%',
  ':hover,:focus': {
    backgroundColor: ui.navMenuDarkBackgroundColorHover,
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

const myDashActive = (href) => (_match, location) => {
  const {pathname} = location
  const slashlessPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  if (href === '/me') {
    return slashlessPath.endsWith('/tasks') || slashlessPath.endsWith('/me')
  }
  return slashlessPath.startsWith(href)
}

interface Props {
  label: string
  href: string
  icon: string
  onClick: () => void
}

const DashNavItem = (props: Props) => {
  const {label, href, icon, onClick} = props
  return (
    <NavLink
      activeClassName={activeNavLinkcss}
      className={navLinkcss}
      isActive={myDashActive(href)}
      title={label}
      to={href}
      onClick={onClick}
    >
      {icon && <StyledIcon>{icon}</StyledIcon>}
      <Label>{label}</Label>
    </NavLink>
  )
}

export default DashNavItem
