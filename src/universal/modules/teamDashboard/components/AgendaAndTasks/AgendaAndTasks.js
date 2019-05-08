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

const RootBlock = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'relative',
  width: '100%'
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const TasksHeader = styled('div')(({hideAgenda}) => ({
  display: 'flex',
  paddingRight: !hideAgenda && ui.dashAgendaWidth,
  paddingTop: '.75rem',
  justifyContent: 'flex-start',
  width: '100%',

  [ui.dashTeamBreakpointUp]: {
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

  [ui.dashTeamBreakpointUp]: {
    margin: '0 auto'
  }
}))

const Inner = styled('div')({
  display: 'flex',
  flex: 1,
  margin: 0,
  maxWidth: ui.taskColumnsMaxWidth,
  width: '100%',

  [ui.dashTeamBreakpointUp]: {
    margin: '0 auto'
  }
})

const AgendaMain = styled('div')(({hideAgenda}) => ({
  backgroundColor: !hideAgenda && ui.palette.white,
  bottom: hideAgenda ? 'auto' : '0',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  position: 'absolute',
  right: 0,
  top: 0,
  width: ui.dashAgendaWidth
}))

const AgendaContent = styled('div')({
  display: 'flex',
  flex: 1,
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
            <TeamColumnsContainer teamId={teamId} viewer={viewer} />
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

export default createFragmentContainer(
  AgendaAndTasks,
  graphql`
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
)
