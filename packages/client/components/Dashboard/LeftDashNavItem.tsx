import styled from '@emotion/styled'
import {
  Add,
  ExitToApp,
  Forum,
  Group,
  PlaylistAddCheck,
  Timeline,
  Warning
} from '@mui/icons-material'
import React from 'react'
import PlainButton from '~/components/PlainButton/PlainButton'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint, NavSidebar} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'

const NavItem = styled(PlainButton)<{isActive: boolean}>(({isActive}) => ({
  alignItems: 'center',
  backgroundColor: isActive ? PALETTE.SLATE_300 : undefined,
  borderRadius: 4,
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  marginBottom: 8,
  marginTop: 8,
  padding: 8,
  textDecoration: 'none',
  transition: `background-color 100ms ease-in`,
  userSelect: 'none',
  width: '100%',
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    borderRadius: '0 4px 4px 0'
  },
  ':hover,:focus': {
    backgroundColor: PALETTE.SLATE_300
  }
}))

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  color: PALETTE.SLATE_700,
  marginRight: 16,
  opacity: 0.5
})

const Label = styled('div')({
  flex: 1,
  wordBreak: 'break-word'
})

interface Props {
  className?: string
  onClick?: () => void
  label: string
  href: string
  //FIXME 6062: change to React.ComponentType
  icon: string
}

const getIsActive = (href: string) => {
  const {pathname} = window.location
  const slashlessPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  if (href === '/me') return slashlessPath === href
  if (href.startsWith('/newteam')) {
    return href.startsWith(slashlessPath)
  }
  return slashlessPath.startsWith(href)
}

const LeftDashNavItem = (props: Props) => {
  const {className, label, icon, href, onClick} = props
  const {history} = useRouter()
  const isActive = getIsActive(href)
  const handleClick = () => {
    history.push(href)
    onClick?.()
  }
  return (
    <NavItem className={className} onClick={handleClick} isActive={isActive}>
      <StyledIcon>
        {
          {
            forum: <Forum />,
            timeline: <Timeline />,
            playlist_add_check: <PlaylistAddCheck />,
            add: <Add />,
            exit_to_app: <ExitToApp />,
            group: <Group />,
            warning: <Warning />
          }[icon]
        }
      </StyledIcon>
      <Label>{label}</Label>
    </NavItem>
  )
}

export default LeftDashNavItem
