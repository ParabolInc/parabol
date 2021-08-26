import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {AgendaAndTasksQuery} from '~/__generated__/AgendaAndTasksQuery.graphql'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import {desktopSidebarShadow, navDrawerShadow} from '../../../../styles/elevation'
import {AppBar, Breakpoint, RightSidebar, ZIndex} from '../../../../types/constEnums'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import ManageTeamList from '../ManageTeam/ManageTeamList'
import CloseSidebar from '../CloseSidebar/CloseSidebar'

const desktopBreakpointMediaQuery = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const desktopDashWidestMediaQuery = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

const RootBlock = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%'
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  [desktopDashWidestMediaQuery]: {
    paddingRight: RightSidebar.WIDTH
  }
})

const TasksHeader = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%'
})

const TasksContent = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: 0,
  minHeight: 0,
  width: '100%'
})

const Sidebar = styled('div')<{hideAgenda: boolean | null}>(({hideAgenda}) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: navDrawerShadow,
  display: hideAgenda ? 'none' : 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: AppBar.HEIGHT,
  minWidth: RightSidebar.WIDTH,
  maxWidth: RightSidebar.WIDTH,
  zIndex: ZIndex.SIDE_SHEET, // make sure shadow is above cards
  [desktopBreakpointMediaQuery]: {
    boxShadow: desktopSidebarShadow,
    position: 'relative',
    top: 0
  },
  [desktopDashWidestMediaQuery]: {
    position: 'fixed',
    top: AppBar.HEIGHT
  }
}))

const SidebarHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px'
})

const SidebarContent = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  // padding-bottom makes space for the Start New Meeting FAB
  padding: '0 0 80px',
  height: '100%',
  flexDirection: 'column',
  width: '100%'
})

const StyledLabelHeading = styled(LabelHeading)({
  fontSize: 14,
  textTransform: 'none'
})

interface Props {
  queryRef: PreloadedQuery<AgendaAndTasksQuery>
}

const AgendaAndTasks = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<AgendaAndTasksQuery>(
    graphql`
      query AgendaAndTasksQuery($teamId: ID!) {
        viewer {
          dashSearch
          team(teamId: $teamId) {
            id
            name
            ...AgendaListAndInput_team
            ...ManageTeamList_team
            ...TeamTasksHeaderContainer_team
          }
          teamMember(teamId: $teamId) {
            hideAgenda
            hideManageTeam
          }
          ...TeamColumnsContainer_viewer
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )

  const {viewer} = data
  const {dashSearch} = viewer
  const team = viewer.team!
  const teamMember = viewer.teamMember!
  const {hideAgenda, hideManageTeam} = teamMember
  const {id: teamId, name: teamName} = team
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)
  return (
    <RootBlock>
      <TasksMain>
        <TasksHeader>
          <TeamTasksHeaderContainer team={team} />
        </TasksHeader>
        <TasksContent>
          <TeamColumnsContainer viewer={viewer} />
        </TasksContent>
      </TasksMain>
      <Sidebar hideAgenda={hideAgenda}>
        {!hideAgenda && hideManageTeam && (
          <SidebarContent>
            <SidebarHeader>
              <StyledLabelHeading>{'Team Agenda'}</StyledLabelHeading>
              <CloseSidebar isAgenda teamId={teamId} />
            </SidebarHeader>
            <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
          </SidebarContent>
        )}
      </Sidebar>
      <Sidebar hideAgenda={hideManageTeam}>
        {!hideManageTeam && hideAgenda && (
          <SidebarContent>
            <SidebarHeader>
              <StyledLabelHeading>{'Manage Team'}</StyledLabelHeading>
              <CloseSidebar teamId={teamId} />
            </SidebarHeader>
            <ManageTeamList team={team} />
          </SidebarContent>
        )}
      </Sidebar>
    </RootBlock>
  )
}
export default AgendaAndTasks
