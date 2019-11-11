import React from 'react'
import {createFragmentContainer} from 'react-relay'
import AgendaToggle from '../AgendaToggle/AgendaToggle'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {desktopSidebarShadow, navDrawerShadow} from '../../../../styles/elevation'
import {AgendaAndTasks_viewer} from '__generated__/AgendaAndTasks_viewer.graphql'
import {RightSidebar, ZIndex} from '../../../../types/constEnums'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'

const RootBlock = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%',
  '@media screen and (min-width: 1200px)': {
    minWidth: 0
  }
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto'
})

const dashTeamBreakpointUp = '@media (min-width: 123.25rem)'
const TasksHeader = styled('div')({
  display: 'flex',
  paddingTop: '.75rem',
  justifyContent: 'flex-start',
  width: '100%',

  [dashTeamBreakpointUp]: {
    justifyContent: 'center',
    paddingTop: 0
  }
})

const TasksContent = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: 0,
  minHeight: 0,
  width: '100%',

  [dashTeamBreakpointUp]: {
    margin: '0 auto'
  }
})

const AgendaMain = styled('div')<{hideAgenda: boolean | null}>(({hideAgenda}) => ({
  backgroundColor: hideAgenda ? '' : '#FFFFFF',
  boxShadow: hideAgenda ? 'none' : navDrawerShadow,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'hidden',
  position: hideAgenda ? 'absolute' : undefined,
  right: hideAgenda ? 0 : undefined,
  minWidth: RightSidebar.WIDTH,
  maxWidth: RightSidebar.WIDTH,
  '@media screen and (min-width: 800px)': {
    boxShadow: hideAgenda ? 'none' : desktopSidebarShadow
  },
  zIndex: ZIndex.SIDE_SHEET // make sure shadow is above cards
}))

const AgendaContent = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  height: '100%',
  flexDirection: 'column',
  width: '100%'
})

interface Props {
  viewer: AgendaAndTasks_viewer
}

const AgendaAndTasks = (props: Props) => {
  const {viewer} = props
  const team = viewer.team!
  const teamMember = viewer.teamMember!
  const {hideAgenda} = teamMember
  const {teamId, teamName} = team
  useDocumentTitle(`Team Dashboard | ${teamName}`)
  return (
    <RootBlock>
      {/* Tasks */}
      <TasksMain>
        <TasksHeader>
          <TeamTasksHeaderContainer team={team} />
        </TasksHeader>
        <TasksContent>
          <TeamColumnsContainer viewer={viewer} />
        </TasksContent>
      </TasksMain>

      {/* Agenda */}
      <AgendaMain hideAgenda={hideAgenda}>
        <AgendaToggle hideAgenda={hideAgenda} teamId={teamId} />
        {!hideAgenda && (
          <AgendaContent>
            <AgendaListAndInput team={team!} />
          </AgendaContent>
        )}
      </AgendaMain>
    </RootBlock>
  )
}

export default createFragmentContainer(AgendaAndTasks, {
  viewer: graphql`
    fragment AgendaAndTasks_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamName: name
        ...AgendaListAndInput_team
        ...TeamTasksHeaderContainer_team
      }
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...TeamColumnsContainer_viewer
    }
  `
})
