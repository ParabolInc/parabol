import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain
} from 'universal/components/Dashboard';
import {withRouter} from 'react-router-dom';
import Button from 'universal/components/Button/Button';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import UnpaidTeamModalContainer from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalContainer';
import ui from 'universal/styles/ui';
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
    team,
    teamMembers
  } = props;
  const {id: teamId, name: teamName, isPaid} = team;
  const hasActiveMeeting = Boolean(team && team.meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ? <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : teamName;
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
              size="smallest"
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
              size="smallest"
            /> :
            <Button
              key="2"
              buttonStyle="flat"
              colorPalette="cool"
              icon="cog"
              iconPlacement="left"
              isBlock
              label="Team Settings"
              onClick={goToTeamSettings}
              size="smallest"
            />
          }
          <DashboardAvatars teamMembers={teamMembers} />
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
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired
};

const styleThunk = () => ({
  teamLinks: {
    display: 'flex',
    flexWrap: 'nowrap'
  }
});

export default withRouter(withStyles(styleThunk)(Team));
