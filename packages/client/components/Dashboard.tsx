import {Outlet} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useMemo, useRef} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import useNewFeatureSnackbar from '~/hooks/useNewFeatureSnackbar'
import useSnackNag from '~/hooks/useSnackNag'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {Breakpoint} from '~/types/constEnums'
import type {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import {useOpenSidebarForPagesTrash} from '../hooks/useOpenSidebarForPagesTrash'
import useSidebar from '../hooks/useSidebar'
import {SearchProvider} from '../modules/search/SearchContext'
import {GlobalSearchDialog} from '../modules/search/SearchDialog'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import ThemeSync from './ThemeSync'
import {DashboardOutletContext} from './useDashboardOutlet'

interface Props {
  queryRef: PreloadedQuery<DashboardQuery>
}

// no overflow: 'auto' on DashLayout because @hello-pangea/dnd only supports 1 scrolling parent
const dashLayoutClassName = 'flex h-full flex-col'

const skipLinkClassName =
  '-m-px absolute h-px w-px overflow-hidden [clip:rect(1px,1px,1px,1px)] [clip-path:inset(50%)] transition-[background-color] duration-100 ease-[ease] focus:[clip:auto]! focus:h-auto focus:w-auto focus:bg-gold-300 focus:px-11 focus:py-1 focus:text-slate-900 focus:underline focus:outline-none focus:[clip-path:inherit] focus:leading-[49px]'

const Dashboard = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($first: Int!, $after: DateTime, $nullId: ID) {
        ...DashTopBar_query
        ...MobileDashTopBar_query
        viewer {
          ...MeetingsDash_viewer
          ...MobileDashSidebar_viewer
          ...DashSidebar_viewer
          ...useNewFeatureSnackbar_viewer
          ...Page_viewer
          overLimitCopy
          theme
          teams {
            activeMeetings {
              ...useSnacksForNewMeetings_meetings
            }
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings).filter(Boolean)
  const {isOpen, toggle, handleMenuClick} = useSidebar()
  useOpenSidebarForPagesTrash(isOpen, toggle)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const overLimitCopy = viewer?.overLimitCopy
  const meetingsDashRef = useRef<HTMLDivElement>(null)
  const dashboardOutlet = useMemo(() => ({viewer, mainRef: meetingsDashRef}), [viewer])
  useSnackNag(overLimitCopy)
  useSnacksForNewMeetings(activeMeetings)
  useNewFeatureSnackbar(viewer)

  return (
    <SearchProvider>
      <ThemeSync theme={viewer.theme} />
      <GlobalSearchDialog />
      <div className={dashLayoutClassName}>
        <a className={skipLinkClassName} href='#main'>
          Skip to content
        </a>
        {isDesktop ? (
          <DashTopBar queryRef={data} toggle={toggle} isSidebarOpen={isOpen} />
        ) : (
          <MobileDashTopBar queryRef={data} toggle={toggle} />
        )}
        <div className='flex h-full flex-1 overflow-hidden'>
          {isDesktop ? (
            <DashSidebar viewerRef={viewer} isOpen={isOpen} />
          ) : (
            <SwipeableDashSidebar isOpen={isOpen} onToggle={toggle}>
              <MobileDashSidebar viewerRef={viewer} handleMenuClick={handleMenuClick} />
            </SwipeableDashSidebar>
          )}
          <main
            className='relative flex h-full min-h-0 flex-1 flex-col overflow-auto overscroll-none'
            id='main'
            ref={meetingsDashRef}
          >
            <DashboardOutletContext.Provider value={dashboardOutlet}>
              <Outlet />
            </DashboardOutletContext.Provider>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}

export default Dashboard
