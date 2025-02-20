import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {lazy, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Route, Switch} from 'react-router'
import useBreakpoint from '~/hooks/useBreakpoint'
import useNewFeatureSnackbar from '~/hooks/useNewFeatureSnackbar'
import useSnackNag from '~/hooks/useSnackNag'
import useSnacksForNewMeetings from '~/hooks/useSnacksForNewMeetings'
import {PALETTE} from '~/styles/paletteV3'
import {Breakpoint} from '~/types/constEnums'
import {DashboardQuery} from '../__generated__/DashboardQuery.graphql'
import useSidebar from '../hooks/useSidebar'
import DashTopBar from './DashTopBar'
import DashSidebar from './Dashboard/DashSidebar'
import MobileDashSidebar from './Dashboard/MobileDashSidebar'
import MobileDashTopBar from './MobileDashTopBar'
import RequestToJoinComponent from './RequestToJoin'
import SwipeableDashSidebar from './SwipeableDashSidebar'

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

const Page = lazy(() => import(/* webpackChunkName: 'Page' */ '../modules/pages/Page'))
const MakePage = lazy(() => import(/* webpackChunkName: 'MakePage' */ '../modules/pages/MakePage'))

const ShareTopicRouterRoot = lazy(
  () => import(/* webpackChunkName: 'ShareTopicRouterRoot' */ './ShareTopicRouterRoot')
)

interface Props {
  queryRef: PreloadedQuery<DashboardQuery>
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
  const {queryRef} = props
  const data = usePreloadedQuery<DashboardQuery>(
    graphql`
      query DashboardQuery($first: Int!, $after: DateTime) {
        ...DashTopBar_query
        ...MobileDashTopBar_query
        viewer {
          ...MeetingsDash_viewer
          ...MobileDashSidebar_viewer
          ...DashSidebar_viewer
          ...useNewFeatureSnackbar_viewer
          ...useTipTapPageEditor_viewer
          overLimitCopy
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
    <DashLayout>
      <SkipLink href='#main'>Skip to content</SkipLink>
      {isDesktop ? (
        <DashTopBar queryRef={data} toggle={toggle} />
      ) : (
        <MobileDashTopBar queryRef={data} toggle={toggle} />
      )}
      <DashPanel>
        {isDesktop ? (
          <DashSidebar viewerRef={viewer} isOpen={isOpen} />
        ) : (
          <SwipeableDashSidebar isOpen={isOpen} onToggle={toggle}>
            <MobileDashSidebar viewerRef={viewer} handleMenuClick={handleMenuClick} />
          </SwipeableDashSidebar>
        )}
        <DashMain id='main' ref={meetingsDashRef}>
          <Switch>
            <Route
              path='(/meetings)'
              render={(routeProps) => (
                <MeetingsDash {...routeProps} meetingsDashRef={meetingsDashRef} viewer={viewer} />
              )}
            />
            <Route path='/me' component={UserDashboard} />
            <Route
              exact
              path='/team/:teamId/requestToJoin'
              render={(routeProps) => (
                <RequestToJoinComponent key={routeProps.match.params.teamId} {...routeProps} />
              )}
            />
            <Route path='/team/:teamId' component={TeamRoot} />
            <Route path='/newteam/:defaultOrgId?' component={NewTeam} />
            <Route
              path='/pages/:pageSlug'
              render={(routeProps) => <Page {...routeProps} viewerRef={viewer} />}
            />
            <Route path='/pages' component={MakePage} />
            <Route path='/new-summary/:meetingId/share/:stageId' component={ShareTopicRouterRoot} />
            <Route path='/new-summary/:meetingId/:urlAction?' component={NewMeetingSummary} />
          </Switch>
        </DashMain>
      </DashPanel>
    </DashLayout>
  )
}

export default Dashboard
