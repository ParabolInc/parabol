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
import {withRouter} from 'react-router';
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
    hasDashAlert,
    router,
    styles,
    team,
    teamMembers
  } = props;
  const {id: teamId, name: teamName, isPaid} = team;
  const hasActiveMeeting = Boolean(team && team.meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  const isSettings = router.isActive(`/team/${teamId}/settings`, false);
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ? <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : teamName;
  const modalLayout = hasDashAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;
  const goToMeetingLobby = () =>
    router.push(`/meeting/${teamId}/`);
  const goToTeamSettings = () =>
    router.push(`/team/${teamId}/settings/`);
  const goToTeamDashboard = () =>
    router.push(`/team/${teamId}`);
  return (
    <DashMain>
      <MeetingInProgressModal
        isOpen={hasActiveMeeting}
        modalLayout={modalLayout}
        teamId={teamId}
        teamName={teamName}
        key={teamId}
      />
      <UnpaidTeamModalContainer
        isOpen={!isPaid}
        teamId={teamId}
        modalLayout={modalLayout}
        teamName={teamName}
      />
      <DashHeader hasOverlay={hasOverlay}>
        <DashHeaderInfo title={DashHeaderInfoTitle}>
          {!isSettings &&
            <Button
              buttonStyle="solid"
              colorPalette="warm"
              icon="users"
              iconPlacement="left"
              label="Meeting Lobby"
              onClick={goToMeetingLobby}
              raised
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
  hasDashAlert: PropTypes.bool,
  router: PropTypes.object,
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
