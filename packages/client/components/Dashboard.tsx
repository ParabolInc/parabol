import graphql from 'babel-plugin-relay/macro'
import {lazy, useRef} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Route, Routes, useParams} from 'react-router'
import useBreakpoint from '~/hooks/useBreakpoint'
import useNewFeatureSnackbar from '~/hooks/useNewFeatureSnackbar'
import useSnackNag from '~/hooks/useSnackNag'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {Breakpoint} from '~/types/constEnums'
import type {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import useSidebar from '../hooks/useSidebar'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import DashTopBar from './DashTopBar'
import MobileDashTopBar from './MobileDashTopBar'
import RequestToJoinComponent from './RequestToJoin'
import SwipeableDashSidebar from './SwipeableDashSidebar'
import ThemeSync from './ThemeSync'

const MeetingsDash = lazy(
  () => import(/* webpackChunkName: 'MeetingsDash' */ '../components/MeetingsDash')
)

const NewMeetingSummary = lazy(
  () =>
    import(
      /* webpackChunkName: 'NewMeetingSummaryRoot' */ '../modules/summary/components/NewMeetingSummaryRoot'
    )
)

const UserDashboard = lazy(
  () =>
    import(
      /* webpackChunkName: 'UserDashboard' */ '../modules/userDashboard/components/UserDashboard/UserDashboard'
    )
)
const TeamRoot = lazy(
  () => import(/* webpackChunkName: 'TeamRoot' */ '../modules/teamDashboard/components/TeamRoot')
)
const NewTeam = lazy(
  () =>
    import(
      /* webpackChunkName: 'NewTeamRoot' */ '../modules/newTeam/containers/NewTeamForm/NewTeamRoot'
    )
)

const PageRoot = lazy(() => import(/* webpackChunkName: 'PageRoot' */ '../modules/pages/PageRoot'))
const MakePage = lazy(() => import(/* webpackChunkName: 'MakePage' */ '../modules/pages/MakePage'))

const ShareTopicRouterRoot = lazy(
  () => import(/* webpackChunkName: 'ShareTopicRouterRoot' */ './ShareTopicRouterRoot')
)
const NotFound = lazy(() => import(/* webpackChunkName: 'NotFound' */ './NotFound/NotFound'))

import {SearchProvider} from '../modules/search/SearchContext'
import {GlobalSearchDialog} from '../modules/search/SearchDialog'

interface Props {
  queryRef: PreloadedQuery<DashboardQuery>
}

// no overflow: 'auto' on DashLayout because @hello-pangea/dnd only supports 1 scrolling parent
const dashLayoutClassName = 'flex h-full flex-col'

const skipLinkClassName =
  '-m-px absolute h-px w-px overflow-hidden [clip:rect(1px,1px,1px,1px)] [clip-path:inset(50%)] transition-[background-color] duration-100 ease-[ease] focus:[clip:auto]! focus:h-auto focus:w-auto focus:bg-gold-300 focus:px-11 focus:py-1 focus:text-slate-900 focus:underline focus:outline-none focus:[clip-path:inherit] focus:leading-[49px]'

const RequestToJoinRoute = () => {
  const {teamId} = useParams()
  return <RequestToJoinComponent key={teamId} />
}

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
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const overLimitCopy = viewer?.overLimitCopy
  const meetingsDashRef = useRef<HTMLDivElement>(null)
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
          <DashTopBar queryRef={data} toggle={toggle} />
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
            <Routes>
              <Route
                path='/meetings'
                element={<MeetingsDash meetingsDashRef={meetingsDashRef} viewer={viewer} />}
              />
              <Route path='/me/*' element={<UserDashboard />} />
              <Route path='/team/:teamId/requestToJoin' element={<RequestToJoinRoute />} />
              <Route path='/team/:teamId/*' element={<TeamRoot />} />
              <Route path='/newteam/:defaultOrgId' element={<NewTeam />} />
              <Route path='/newteam' element={<NewTeam />} />
              <Route path='/pages/:pageSlug' element={<PageRoot viewerRef={viewer} />} />
              <Route path='/pages' element={<MakePage />} />
              <Route
                path='/new-summary/:meetingId/share/:stageId'
                element={<ShareTopicRouterRoot />}
              />
              <Route path='/new-summary/:meetingId/:urlAction' element={<NewMeetingSummary />} />
              <Route path='/new-summary/:meetingId' element={<NewMeetingSummary />} />
              <Route path='*' element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}

export default Dashboard
