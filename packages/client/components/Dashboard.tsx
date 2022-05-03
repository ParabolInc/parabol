import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useSnackNag from '~/hooks/useSnackNag'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import useSidebar from '../hooks/useSidebar'
import {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import SwipeableDashSidebar from './SwipeableDashSidebar'

interface Props {
  prepared: {
    queryRef: PreloadedQuery<DashboardQuery>
  }
  children: React.ReactNode
}

const DashLayout = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
})

const DashPanel = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  overflow: 'hidden'
})

const DashMain = styled('main')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  overflow: 'auto',
  position: 'relative'
})

const SkipLink = styled('a')({
  position: 'absolute',
  clip: 'rect(1px,1px,1px,1px)',
  clipPath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  width: '1px',
  transition: 'background-color 0.1s ease',

  ':focus': {
    clip: 'auto !important',
    clipPath: 'inherit',
    width: 'auto',
    height: 'auto',
    color: PALETTE.SLATE_900,
    backgroundColor: PALETTE.GOLD_300,
    padding: '4px 44px',
    lineHeight: '49px',
    textDecoration: 'underline',
    outline: 'none'
  }
})

const Dashboard = (props: Props) => {
  const {prepared, children} = props
  const {queryRef} = prepared
  const data = usePreloadedQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($first: Int!, $after: DateTime) {
        viewer {
          ...MeetingsDash_viewer
          ...MobileDashSidebar_viewer
          ...MobileDashTopBar_viewer
          ...DashTopBar_viewer
          ...DashSidebar_viewer
          overLimitCopy
          teams {
            activeMeetings {
              ...useSnacksForNewMeetings_meetings
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings).filter(Boolean)
  const {isOpen, toggle, handleMenuClick} = useSidebar()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const overLimitCopy = viewer?.overLimitCopy
  const meetingsDashRef = useRef<HTMLDivElement>(null)
  useSnackNag(overLimitCopy)
  useSnacksForNewMeetings(activeMeetings)
  return (
    <DashLayout>
      <SkipLink href='#main'>Skip to content</SkipLink>
      {isDesktop ? (
        <DashTopBar viewer={viewer} toggle={toggle} />
      ) : (
        <MobileDashTopBar viewer={viewer} toggle={toggle} />
      )}
      <DashPanel>
        {isDesktop ? (
          <DashSidebar viewer={viewer} isOpen={isOpen} />
        ) : (
          <SwipeableDashSidebar isOpen={isOpen} onToggle={toggle}>
            <MobileDashSidebar viewer={viewer} handleMenuClick={handleMenuClick} />
          </SwipeableDashSidebar>
        )}
        <DashMain id='main' ref={meetingsDashRef}>
          {/*todo: update to use Context or fix the Type here, ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18051*/}
          {children &&
            React.cloneElement(children as React.ReactElement, {viewer, meetingsDashRef})}
        </DashMain>
      </DashPanel>
    </DashLayout>
  )
}

export default Dashboard
