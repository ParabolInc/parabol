import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {commitLocalUpdate, createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars'
import EditableTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditableTeamName'
import TeamCallsToAction from 'universal/modules/teamDashboard/components/TeamCallsToAction/TeamCallsToAction'
import UnpaidTeamModalRoot from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalRoot'
import ui from 'universal/styles/ui'
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {ACTION} from 'universal/utils/constants'
import styled from 'react-emotion'
import DashMain from 'universal/components/Dashboard/DashMain'
import DashHeader from 'universal/components/Dashboard/DashHeader'
import DashHeaderInfo from 'universal/components/Dashboard/DashHeaderInfo'
import DashSearchControl from 'universal/components/Dashboard/DashSearchControl'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import DashContent from 'universal/components/Dashboard/DashContent'

const TeamViewNavBlock = styled('div')({
  display: 'flex',
  flexWrap: 'nowrap'
})

const StyledButton = styled(FlatButton)({
  paddingLeft: '1rem',
  paddingRight: '1rem'
})

class Team extends Component {
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
    const {
      atmosphere,
      team: {teamId}
    } = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId)
      teamProxy.setValue(nextValue, 'contentFilter')
    })
  }

  updateFilter = (e) => {
    this.setContentFilter(e.target.value)
  }
  goToTeamSettings = () => {
    const {
      history,
      team: {teamId}
    } = this.props
    history.push(`/team/${teamId}/settings/`)
  }
  goToTeamDashboard = () => {
    const {
      history,
      team: {teamId}
    } = this.props
    history.push(`/team/${teamId}/`)
  }

  render () {
    const {children, hasMeetingAlert, isSettings, team} = this.props
    if (!team) return null
    const {teamId, teamName, isPaid, meetingId, newMeeting} = team
    const hasActiveMeeting = Boolean(meetingId)
    const hasOverlay = hasActiveMeeting || !isPaid
    const DashHeaderInfoTitle = isSettings ? <EditableTeamName team={team} /> : ''
    const modalLayout = hasMeetingAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain

    return (
      <DashMain>
        <MeetingInProgressModal
          isOpen={hasActiveMeeting}
          meetingType={newMeeting ? newMeeting.meetingType : ACTION}
          modalLayout={modalLayout}
          teamId={teamId}
          teamName={teamName}
          key={`${teamId}MeetingModal`}
        />
        <UnpaidTeamModalRoot
          isOpen={!isPaid}
          teamId={teamId}
          modalLayout={modalLayout}
          key={`${teamId}UnpaidModal`}
        />
        <DashHeader
          area={isSettings ? 'teamSettings' : 'teamDash'}
          hasOverlay={hasOverlay}
          key={`team${isSettings ? 'Dash' : 'Settings'}Header`}
        >
          <DashHeaderInfo title={DashHeaderInfoTitle}>
            {!isSettings && (
              <DashSearchControl
                onChange={this.updateFilter}
                placeholder='Search Team Tasks & Agenda'
              />
            )}
          </DashHeaderInfo>
          <TeamViewNavBlock>
            {isSettings ? (
              <StyledButton
                aria-label='Back to Team Dashboard'
                key='1'
                onClick={this.goToTeamDashboard}
              >
                <IconLabel icon='arrow-circle-left' label='Back to Team Dashboard' />
              </StyledButton>
            ) : (
              <StyledButton aria-label='Team Settings' key='2' onClick={this.goToTeamSettings}>
                <IconLabel icon='cog' label='Team Settings' />
              </StyledButton>
            )}
            <DashboardAvatars team={team} />
            {!isSettings && <TeamCallsToAction teamId={teamId} />}
          </TeamViewNavBlock>
        </DashHeader>
        <DashContent hasOverlay={hasOverlay} padding='0'>
          {children}
        </DashContent>
      </DashMain>
    )
  }
}

Team.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  isSettings: PropTypes.bool.isRequired,
  history: PropTypes.object,
  team: PropTypes.object
}

export default createFragmentContainer(
  withAtmosphere(withRouter(Team)),
  graphql`
    fragment Team_team on Team {
      contentFilter
      teamId: id
      teamName: name
      isPaid
      meetingId
      newMeeting {
        id
        meetingType
      }
      ...DashboardAvatars_team
      ...EditableTeamName_team
    }
  `
)
