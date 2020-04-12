import React from 'react'
import {NavLink} from 'react-router-dom'
import styled from '@emotion/styled'
import Icon from '../Icon'
import {ICON_SIZE} from '../../styles/typographyV2'
import {PALETTE} from '../../styles/paletteV2'
import {NavSidebar} from '../../types/constEnums'
import {ClassNames} from '@emotion/core'

const StyledIcon = styled(Icon)({
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  opacity: 0.5,
  textAlign: 'left'
})

const navLinkcss = {
  borderLeft: `${NavSidebar.LEFT_BORDER_WIDTH} solid transparent`,
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  padding: '10px 8px 10px 32px',
  transition: `background-color 100ms ease-in`,
  userSelect: 'none' as 'none',
  width: '100%',
  ':hover,:focus': {
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_HOVER,
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none'
  }
}

const activeNavLinkcss = {
  backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE,
  borderColor: '#FFFFFF !important',
  cursor: 'default',
  textDecoration: 'none',
  ':hover': {
    backgroundColor: PALETTE.BACKGROUND_NAV_DARK_ACTIVE,
    color: 'inherit',
    cursor: 'pointer',
    textDecoration: 'none'
  }
}

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
    <ClassNames>
      {({css}) => {
        return (
          <NavLink
            activeClassName={css(activeNavLinkcss)}
            className={css(navLinkcss)}
            isActive={myDashActive(href)}
            title={label}
            to={href}
            onClick={onClick}
          >
            {icon && <StyledIcon>{icon}</StyledIcon>}
            <Label>{label}</Label>
          </NavLink>
        )
      }}
    </ClassNames>
  )
}

export default DashNavItem
