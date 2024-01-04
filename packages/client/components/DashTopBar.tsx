import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {AppBar, Breakpoint, Layout, NavSidebar} from '~/types/constEnums'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DashTopBar_query$key} from '~/__generated__/DashTopBar_query.graphql'
import PinnedSnackbarNotifications from './PinnedSnackbarNotifications'
import TopBarAvatar from './TopBarAvatar'
import TopBarHelp from './TopBarHelp'
import TopBarNotifications from './TopBarNotifications'
import TopBarSearch from './TopBarSearch'
import TopBarSettings from './TopBarSettings'

const dashWidestBreakpoint = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

interface Props {
  queryRef: DashTopBar_query$key
}

const Wrapper = styled('header')({
  display: 'flex',
  height: AppBar.HEIGHT,
  justifyContent: 'space-between',
  width: '100%',
  [dashWidestBreakpoint]: {
    paddingRight: NavSidebar.WIDTH
  }
})

const TopBarIcons = styled('div')({
  alignItems: 'center',
  color: PALETTE.GRAPE_700,
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
  padding: '0 16px',
  width: '100%',
  [dashWidestBreakpoint]: {
    margin: '0 auto',
    maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH
  }
})

const DashTopBar = (props: Props) => {
  const {queryRef} = props
  const data = useFragment(
    graphql`
      fragment DashTopBar_query on Query {
        ...TopBarNotifications_query
        ...PinnedSnackbarNotifications_query
        viewer {
          ...TopBarAvatar_viewer
          ...TopBarSearch_viewer
          picture
        }
      }
    `,
    queryRef
  )

  return (
    <Wrapper>
      <TopBarMain>
        <TopBarSearch viewer={data.viewer} />
        <TopBarIcons>
          <TopBarHelp />
          <TopBarSettings />
          <TopBarNotifications queryRef={data} />
          <PinnedSnackbarNotifications queryRef={data} />
          <TopBarAvatar viewer={data.viewer || null} />
        </TopBarIcons>
      </TopBarMain>
    </Wrapper>
  )
}

export default DashTopBar
