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
  ManageAccounts,
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
  color: isActive ? PALETTE.SLATE_900 : PALETTE.SLATE_800,
  display: 'flex',
  fontSize: NavSidebar.FONT_SIZE,
  fontWeight: 600,
  lineHeight: NavSidebar.LINE_HEIGHT,
  marginBottom: 2,
  marginTop: 2,
  paddingBottom: 5,
  paddingRight: 8,
  paddingTop: 5,
  textDecoration: 'none',
  transition: `background-color 100ms ease-in`,
  userSelect: 'none',
  width: '100%',
  ':hover': {
    backgroundColor: PALETTE.SLATE_300
  }
}))

const StyledIcon = styled('div')<{isActive: boolean}>(({isActive}) => ({
  fontSize: 18,
  height: 18,
  width: 18,
  color: isActive ? PALETTE.SLATE_700 : PALETTE.SLATE_600,
  marginRight: 11
}))

const Label = styled('div')({
  flex: 1,
  wordBreak: 'break-word'
})

const iconLookup = {
  magic: <AutoAwesome fontSize='inherit' />,
  arrowBack: <ArrowBack fontSize='inherit' />,
  creditScore: <CreditScore fontSize='inherit' />,
  forum: <Forum fontSize='inherit' />,
  playlist_add_check: <PlaylistAddCheck fontSize='inherit' />,
  add: <Add fontSize='inherit' />,
  exit_to_app: <ExitToApp fontSize='inherit' />,
  manageAccounts: <ManageAccounts fontSize='inherit' />,
  group: <Group fontSize='inherit' />,
  groups: <Groups fontSize='inherit' />,
  warning: <Warning fontSize='inherit' />,
  work: <WorkOutline fontSize='inherit' />,
  timeline: <Timeline fontSize='inherit' />,
  key: <Key fontSize='inherit' />
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
  iconClassName?: string
}

const LeftDashNavItem = (props: Props) => {
  const {className, label, icon, href, navState, onClick, iconClassName} = props
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
      <StyledIcon className={iconClassName} isActive={!!match && (match?.isExact || !props.exact)}>
        {iconLookup[icon]}
      </StyledIcon>
      <Label>{label}</Label>
    </NavItem>
  )
}

export default LeftDashNavItem
