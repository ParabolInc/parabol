import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import {DashContent, DashHeader, DashHeaderInfo, DashMain} from 'universal/components/Dashboard';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import UnpaidTeamModalContainer from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalContainer';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal';

// use the same object so the EditTeamName doesn't rerender so gosh darn always
const initialValues = {teamName: ''};

const Team = (props) => {
  const {
    children,
    hasMeetingAlert,
    isSettings,
    history,
    styles,
    team
  } = props;
  if (!team) return <LoadingView />;

  const {teamId, teamName, isPaid, meetingId} = team;
  const hasActiveMeeting = Boolean(meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ?
    <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : teamName;
  const modalLayout = hasMeetingAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;
  const goToMeetingLobby = () =>
    history.push(`/meeting/${teamId}/`);
  const goToTeamSettings = () =>
    history.push(`/team/${teamId}/settings/`);
  const goToTeamDashboard = () =>
    history.push(`/team/${teamId}`);
  return (
    <DashMain>
      <MeetingInProgressModal
        isOpen={hasActiveMeeting}
        modalLayout={modalLayout}
        teamId={teamId}
        teamName={teamName}
        key={`${teamId}MeetingModal`}
      />
      <UnpaidTeamModalContainer
        isOpen={!isPaid}
        teamId={teamId}
        modalLayout={modalLayout}
        teamName={teamName}
        key={`${teamId}UnpaidModal`}
      />
      <DashHeader hasOverlay={hasOverlay}>
        <DashHeaderInfo title={DashHeaderInfoTitle}>
          {!isSettings &&
          <Button
            buttonStyle="solid"
            colorPalette="warm"
            depth={1}
            icon="users"
            iconPlacement="left"
            label="Meeting Lobby"
            onClick={goToMeetingLobby}
            buttonSize="small"
          />
          }
        </DashHeaderInfo>
        <div className={css(styles.teamLinks)}>
          {isSettings ?
            <Button
              key="1"
              buttonStyle="flat"
              colorPalette="cool"
              icon="arrow-circle-left"
              iconPlacement="left"
              isBlock
              label="Back to Team Dashboard"
              onClick={goToTeamDashboard}
              buttonSize="small"
            /> :
            <Button
              buttonSize="small"
              buttonStyle="flat"
              colorPalette="cool"
              icon="cog"
              iconPlacement="left"
              key="2"
              isBlock
              label="Team Settings"
              onClick={goToTeamSettings}
            />
          }
          <DashboardAvatars team={team} />
        </div>
      </DashHeader>
      <DashContent hasOverlay={hasOverlay} padding="0">
        {children}
      </DashContent>
    </DashMain>
  );
};

Team.propTypes = {
  children: PropTypes.any,
  hasMeetingAlert: PropTypes.bool,
  isSettings: PropTypes.bool.isRequired,
  history: PropTypes.object,
  styles: PropTypes.object,
  team: PropTypes.object
};

const styleThunk = () => ({
  teamLinks: {
    display: 'flex',
    flexWrap: 'nowrap'
  }
});

export default createFragmentContainer(
  withRouter(withStyles(styleThunk)(Team)),
  graphql`
    fragment Team_team on Team {
      teamId: id
      teamName: name
      isPaid
      meetingId
      ...DashboardAvatars_team
    }
  `
);
