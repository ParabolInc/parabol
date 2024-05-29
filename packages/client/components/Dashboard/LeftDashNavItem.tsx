import styled from '@emotion/styled'
import {
  Add,
  ArrowBack,
  AutoAwesome,
  CreditScore,
  ExitToApp,
  Forum,
  Group,
  Groups,
  Key,
  PlaylistAddCheck,
  Timeline,
  Warning,
  WorkOutline
} from '@mui/icons-material'
import React from 'react'
import {useHistory, useRouteMatch} from 'react-router'
import PlainButton from '~/components/PlainButton/PlainButton'
import {PALETTE} from '~/styles/paletteV3'
import {NavSidebar} from '~/types/constEnums'

const NavItem = styled(PlainButton)<{isActive: boolean}>(({isActive}) => ({
  alignItems: 'center',
  backgroundColor: isActive ? PALETTE.SLATE_300 : undefined,
  borderRadius: 4,
  color: PALETTE.SLATE_900,
  display: 'flex',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  padding: 8,
  textDecoration: 'none',
  transition: `background-color 100ms ease-in`,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  }
}))

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  color: PALETTE.SLATE_900,
  marginRight: 16,
  opacity: 0.5
})

const Label = styled('div')({
  flex: 1,
  wordBreak: 'break-word'
})

const iconLookup = {
  magic: <AutoAwesome />,
  arrowBack: <ArrowBack />,
  creditScore: <CreditScore />,
  forum: <Forum />,
  playlist_add_check: <PlaylistAddCheck />,
  add: <Add />,
  exit_to_app: <ExitToApp />,
  group: <Group />,
  groups: <Groups />,
  warning: <Warning />,
  work: <WorkOutline />,
  timeline: <Timeline />,
  key: <Key />
}

interface Props {
  className?: string
  onClick?: () => void
  label: string
  href: string
  navState?: unknown
  //FIXME 6062: change to React.ComponentType
  icon: keyof typeof iconLookup
  exact?: boolean
}

const LeftDashNavItem = (props: Props) => {
  const {className, label, icon, href, navState, onClick} = props
  const history = useHistory()
  const match = useRouteMatch(href)
  const handleClick = () => {
    history.push(href, navState)
    onClick?.()
  }
  return (
    <NavItem
      className={className}
      onClick={handleClick}
      isActive={!!match && (match?.isExact || !props.exact)}
    >
      <StyledIcon>{iconLookup[icon]}</StyledIcon>
      <Label>{label}</Label>
    </NavItem>
  )
}

export default LeftDashNavItem
