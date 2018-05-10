import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {commitLocalUpdate, createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import {Button} from 'universal/components';
import {DashContent, DashHeader, DashHeaderInfo, DashMain, DashSearchControl} from 'universal/components/Dashboard';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import TeamCallsToAction from 'universal/modules/teamDashboard/components/TeamCallsToAction/TeamCallsToAction';
import UnpaidTeamModalRoot from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalRoot';
import ui from 'universal/styles/ui';
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import {ACTION} from 'universal/utils/constants';
import styled from 'react-emotion';

// use the same object so the EditTeamName doesn't rerender so gosh darn always
const initialValues = {teamName: ''};

const TeamViewNavBlock = styled('div')({
  display: 'flex',
  flexWrap: 'nowrap'
});

class Team extends Component {
  componentWillReceiveProps(nextProps) {
    const {team: oldTeam} = this.props;
    if (oldTeam && oldTeam.contentFilter) {
      if (!nextProps.team || nextProps.team.id !== oldTeam.id) {
        this.setContentFilter('');
      }
    }
  }

  componentWillUnmount() {
    if (this.props.team && this.props.team.contentFilter) {
      this.setContentFilter('');
    }
  }
  setContentFilter(nextValue) {
    const {atmosphere, team: {teamId}} = this.props;
    commitLocalUpdate(atmosphere, (store) => {
      const teamProxy = store.get(teamId);
      teamProxy.setValue(nextValue, 'contentFilter');
    });
  }

  updateFilter = (e) => {
    this.setContentFilter(e.target.value);
  };
  goToTeamSettings = () => {
    const {history, team: {teamId}} = this.props;
    history.push(`/team/${teamId}/settings/`);
  };
  goToTeamDashboard = () => {
    const {history, team: {teamId}} = this.props;
    history.push(`/team/${teamId}/`);
  };

  render() {
    const {
      children,
      hasMeetingAlert,
      isSettings,
      team
    } = this.props;
    if (!team) return <LoadingView />;
    const {teamId, teamName, isPaid, meetingId, newMeeting} = team;
    const hasActiveMeeting = Boolean(meetingId);
    const hasOverlay = hasActiveMeeting || !isPaid;
    initialValues.teamName = teamName;
    const DashHeaderInfoTitle = isSettings ?
      <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : '';
    const modalLayout = hasMeetingAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;

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
            {!isSettings && <DashSearchControl onChange={this.updateFilter} placeholder="Search Team Tasks & Agenda" />}
          </DashHeaderInfo>
          <TeamViewNavBlock>
            {isSettings ?
              <Button
                key="1"
                buttonStyle="flat"
                colorPalette="dark"
                icon="arrow-circle-left"
                iconPlacement="left"
                isBlock
                label="Back to Team Dashboard"
                onClick={this.goToTeamDashboard}
                buttonSize="small"
              /> :
              <Button
                buttonSize="small"
                buttonStyle="flat"
                colorPalette="dark"
                icon="cog"
                iconPlacement="left"
                key="2"
                isBlock
                label="Team Settings"
                onClick={this.goToTeamSettings}
              />
            }
            <DashboardAvatars team={team} />
            {!isSettings &&
            <TeamCallsToAction teamId={teamId} />
            }
          </TeamViewNavBlock>
        </DashHeader>
        <DashContent hasOverlay={hasOverlay} padding="0">
          {children}
        </DashContent>
      </DashMain>
    );
  }
}

Team.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  isSettings: PropTypes.bool.isRequired,
  history: PropTypes.object,
  team: PropTypes.object
};

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
    }
  `
);
