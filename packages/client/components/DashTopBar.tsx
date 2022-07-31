import styled from '@emotion/styled'
import Menu from '@mui/icons-material/Menu'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {AppBar, Breakpoint, Layout, NavSidebar} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DashTopBar_query$key} from '~/__generated__/DashTopBar_query.graphql'
import parabolLogo from '../styles/theme/images/brand/lockup_color_mark_white_type.svg'
import PlainButton from './PlainButton/PlainButton'
import TopBarAvatar from './TopBarAvatar'
import TopBarHelp from './TopBarHelp'
import TopBarNotifications from './TopBarNotifications'
import TopBarSearch from './TopBarSearch'

const dashWidestBreakpoint = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

interface Props {
  toggle: () => void
  queryRef: DashTopBar_query$key
}

const Wrapper = styled('header')({
  backgroundColor: PALETTE.GRAPE_700,
  display: 'flex',
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%',
  [dashWidestBreakpoint]: {
    paddingRight: NavSidebar.WIDTH
  }
})

const LeftNavToggle = styled(PlainButton)({
  borderRadius: 100,
  fontSize: ICON_SIZE.MD24,
  lineHeight: '16px',
  margin: 12,
  padding: 4,
  ':focus': {
    boxShadow: `0 0 0 2px ${PALETTE.SKY_400}`
  }
})

const LeftNavHeader = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  flexShrink: 0,
  width: NavSidebar.WIDTH
})

const LogoWrapper = styled('button')({
  background: 'transparent',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  margin: '8px 0 8px -8px',
  padding: '8px 8px 4px 8px',
  ':focus': {
    boxShadow: `0 0 0 2px ${PALETTE.SKY_400}`,
    outline: 'none'
  }
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.SLATE_200,
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: 560,
  paddingRight: 16
})

const TopBarMain = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%',
  [dashWidestBreakpoint]: {
    margin: '0 auto',
    maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH
  }
})

const DashTopBar = (props: Props) => {
  const {toggle, queryRef} = props
  const data = useFragment(
    graphql`
      fragment DashTopBar_query on Query {
        ...TopBarNotifications_query
        viewer {
          ...TopBarAvatar_viewer
          ...TopBarSearch_viewer
          picture
        }
      }
    `,
    queryRef
  )
  const {history} = useRouter()
  const gotoHome = () => {
    history.push('/meetings')
  }
  return (
    <Wrapper>
      <LeftNavHeader>
        <LeftNavToggle onClick={toggle} aria-label='Toggle dashboard menu'>
          <Menu />
        </LeftNavToggle>
        <LogoWrapper onClick={gotoHome}>
          <img crossOrigin='' src={parabolLogo} alt='Parabol logo' />
        </LogoWrapper>
      </LeftNavHeader>
      <TopBarMain>
        <TopBarSearch viewer={data.viewer} />
        <TopBarIcons>
          <TopBarHelp />
          <TopBarNotifications queryRef={data || null} />
          <TopBarAvatar viewer={data.viewer || null} />
        </TopBarIcons>
      </TopBarMain>
    </Wrapper>
  )
}

export default DashTopBar
