import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import Helmet from 'react-helmet'
import AgendaToggle from 'universal/modules/teamDashboard/components/AgendaToggle/AgendaToggle'
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput'
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from 'universal/modules/teamDashboard/containers/TeamTasksHeader/TeamTasksHeaderContainer'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import {desktopSidebarShadow, navDrawerShadow} from 'universal/styles/elevation'

const RootBlock = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  minWidth: ui.taskColumnsMinWidth,
  width: '100%',
  '@media screen and (min-width: 1200px)': {
    minWidth: 0
  }
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const dashTeamBreakpointUp = '@media (min-width: 123.25rem)'
const TasksHeader = styled('div')(({hideAgenda}) => ({
  display: 'flex',
  paddingRight: !hideAgenda && ui.dashAgendaWidth,
  paddingTop: '.75rem',
  justifyContent: 'flex-start',
  width: '100%',

  [dashTeamBreakpointUp]: {
    justifyContent: 'center',
    paddingTop: 0
  }
}))

const TasksContent = styled('div')(({hideAgenda}) => ({
  display: 'flex',
  flex: 1,
  margin: 0,
  paddingRight: !hideAgenda && ui.dashAgendaWidth,
  width: '100%',

  [dashTeamBreakpointUp]: {
    margin: '0 auto'
  }
}))

const Inner = styled('div')({
  display: 'flex',
  flex: 1,
  margin: 0,
  maxWidth: ui.taskColumnsMaxWidth,
  position: 'relative',
  width: '100%',

  [dashTeamBreakpointUp]: {
    margin: '0 auto'
  }
})

/* InnerOverflow is a patch fix to ensure correct
   behavior for task columns overflow in small viewports TA */
const InnerOverflow = styled('div')({
  display: 'flex',
  overflow: 'auto',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
})

const AgendaMain = styled('div')(({hideAgenda}) => ({
  backgroundColor: hideAgenda ? '' : ui.palette.white,
  boxShadow: hideAgenda ? 'none' : navDrawerShadow,
  bottom: hideAgenda ? 'auto' : '0',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  overflow: 'auto',
  position: 'absolute',
  right: 0,
  top: 0,
  width: ui.dashAgendaWidth,
  '@media screen and (min-width: 800px)': {
    boxShadow: hideAgenda ? 'none' : desktopSidebarShadow
  }
}))

const AgendaContent = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  height: '100%',
  flexDirection: 'column',
  width: '100%'
})

const AgendaAndTasks = (props) => {
  const {viewer} = props
  const {
    teamMember: {hideAgenda},
    team
  } = viewer
  const {teamId, teamName} = team
  return (
    <RootBlock>
      <Helmet title={`Team Dashboard | ${teamName}`} />

      {/* Tasks */}
      <TasksMain>
        <TasksHeader hideAgenda={hideAgenda}>
          <Inner>
            <TeamTasksHeaderContainer team={team} />
          </Inner>
        </TasksHeader>
        <TasksContent hideAgenda={hideAgenda}>
          <Inner>
            <InnerOverflow>
              <TeamColumnsContainer teamId={teamId} viewer={viewer} />
            </InnerOverflow>
          </Inner>
        </TasksContent>
      </TasksMain>

      {/* Agenda */}
      <AgendaMain hideAgenda={hideAgenda}>
        <AgendaToggle hideAgenda={hideAgenda} teamId={teamId} />
        {!hideAgenda && (
          <AgendaContent>
            <AgendaListAndInput agendaItemPhase={null} team={team} />
          </AgendaContent>
        )}
      </AgendaMain>
    </RootBlock>
  )
}

AgendaAndTasks.propTypes = {
  teamId: PropTypes.string,
  viewer: PropTypes.object
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
