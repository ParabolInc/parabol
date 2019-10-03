import {Team_team} from '../../../../__generated__/Team_team.graphql'
import React, {Component, lazy, Suspense} from 'react'
import styled from '@emotion/styled'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DashContent from '../../../../components/Dashboard/DashContent'
import DashHeader from '../../../../components/Dashboard/DashHeader'
import DashSearchControl from '../../../../components/Dashboard/DashSearchControl'
import DashboardAvatars from '../../../../components/DashboardAvatars/DashboardAvatars'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import IconLabel from '../../../../components/IconLabel'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import EditableTeamName from '../EditTeamName/EditableTeamName'
import TeamCallsToAction from '../TeamCallsToAction/TeamCallsToAction'
import {PALETTE} from '../../../../styles/paletteV2'
// import DebugButton from '../../../userDashboard/components/UserDashMain/DebugButton'

const StyledButton = styled(FlatButton)({
  paddingLeft: '1rem',
  paddingRight: '1rem'
})

const IconButton = styled(StyledButton)({
  color: PALETTE.TEXT_GRAY,
  marginRight: 16,
  padding: '3px 0',
  width: 32,
  ':hover,:focus,:active': {
    color: PALETTE.TEXT_MAIN
  }
})

const TeamDashHeaderInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%'
})

const BackIcon = styled(Icon)({
  color: 'inherit'
})

const MeetingInProgressModal = lazy(() =>
  import(/* webpackChunkName: 'MeetingInProgressModal' */ '../MeetingInProgressModal/MeetingInProgressModal')
)
const UnpaidTeamModalRoot = lazy(() =>
  import(/* webpackChunkName: 'UnpaidTeamModalRoot' */ '../../containers/UnpaidTeamModal/UnpaidTeamModalRoot')
)

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  team: Team_team | null
  isSettings: boolean
}

class Team extends Component<Props> {
  componentWillReceiveProps (nextProps) {
    const {team: oldTeam} = this.props
    if (oldTeam && oldTeam.contentFilter) {
      if (!nextProps.team || nextProps.team.id !== oldTeam.id) {
        this.setContentFilter('')
      }
    }
  }

  componentWillUnmount () {
    if (this.props.team && this.props.team.contentFilter) {
      this.setContentFilter('')
    }
  }

  setContentFilter (nextValue) {
    const {atmosphere, team} = this.props
    if (!team) return
    const {id: teamId} = team
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId)
      teamProxy && teamProxy.setValue(nextValue, 'contentFilter')
    })
  }

  updateFilter = (e) => {
    this.setContentFilter(e.target.value)
  }
  goToTeamSettings = () => {
    const {history, team} = this.props
    if (!team) return
    const {id: teamId} = team
    history.push(`/team/${teamId}/settings/`)
  }
  goToTeamDashboard = () => {
    const {history, team} = this.props
    if (!team) return
    const {id: teamId} = team
    history.push(`/team/${teamId}/`)
  }

  render () {
    const {children, isSettings, team} = this.props
    if (!team) return null
    const {id: teamId, isPaid, meetingId} = team
    const hasActiveMeeting = Boolean(meetingId)
    const hasOverlay = hasActiveMeeting || !isPaid

    return (
      <>
        <Suspense fallback={''}>
          <MeetingInProgressModal team={team} />
          {!isPaid && <UnpaidTeamModalRoot teamId={teamId} />}
        </Suspense>
        <DashHeader
          hasOverlay={hasOverlay}
          key={`team${isSettings ? 'Dash' : 'Settings'}Header`}
        >
          <TeamDashHeaderInner>
            {isSettings ? (
              <>
                <IconButton
                  aria-label='Back to Team Dashboard'
                  key='1'
                  onClick={this.goToTeamDashboard}
                >
                  <BackIcon>arrow_back</BackIcon>
                </IconButton>
                <EditableTeamName team={team} />
              </>
            ) : (
              <>
                <DashSearchControl
                  onChange={this.updateFilter}
                  placeholder='Search Tasks & Agenda'
                />
                <StyledButton aria-label='Team Settings' key='2' onClick={this.goToTeamSettings}>
                  <IconLabel icon='settings' label='Team Settings' />
                </StyledButton>
                <DashboardAvatars team={team} />
                <TeamCallsToAction teamId={teamId} />
              </>
            )}
          </TeamDashHeaderInner>
        </DashHeader>
        <DashContent hasOverlay={hasOverlay}>
          {children}
        </DashContent>
      </>
    )
  }
}

export default createFragmentContainer(withAtmosphere(withRouter(Team)), {
  team: graphql`
    fragment Team_team on Team {
      contentFilter
      id
      isPaid
      meetingId
      ...MeetingInProgressModal_team
      ...DashboardAvatars_team
      ...EditableTeamName_team
    }
  `
})
