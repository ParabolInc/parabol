import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import EditTeamName from 'universal/modules/teamDashboard/components/EditTeamName/EditTeamName';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
} from 'universal/components/Dashboard';
import {Link, withRouter} from 'react-router';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import UnpaidTeamModalContainer from 'universal/modules/teamDashboard/containers/UnpaidTeamModal/UnpaidTeamModalContainer';
import ui from 'universal/styles/ui';
import MeetingInProgressModal from '../MeetingInProgressModal/MeetingInProgressModal';
import Button from 'universal/components/Button/Button';
import {cashay} from 'cashay';
import {Field, reduxForm} from 'redux-form';
import InputField from 'universal/components/InputField/InputField';

const faIconStyle = {
  fontSize: '14px',
  lineHeight: 'inherit',
  marginRight: '.25rem'
};

const linkStyle = {
  display: 'inline-block',
  height: '15px',
  lineHeight: '15px',
  marginRight: '1.5rem',
  textDecoration: 'none'
};

const buttonStyle = {
  textAlign: 'right'
};

const standardLinks = (teamId) => {
  return (
    <div>
      <Link
        to={`/meeting/${teamId}`}
        style={linkStyle}
        title="Meeting Lobby"
      >
        <FontAwesome name="arrow-circle-right" style={faIconStyle} /> Meeting Lobby
      </Link>
      <Link
        to={`/team/${teamId}/settings`}
        style={linkStyle}
        title="Team Settings"
      >
        <FontAwesome name="cog" style={faIconStyle} /> Team Settings
      </Link>
    </div>
  );
};

const settingsLinks = (teamId) => {
  return (
    <div>
      <Link
        to={`/team/${teamId}`}
        style={linkStyle}
        title="Back to Team Dashboard"
      >
        <FontAwesome name="arrow-circle-left" style={faIconStyle} /> Back to Team Dashboard
      </Link>
    </div>
  );
};


// use the same object so the EditTeamName doesn't rerender so gosh darn always
const initialValues = {teamName: ''};

const Team = (props) => {
  const {
    children,
    hasDashAlert,
    router,
    team,
    teamMembers,
    myTeamMember,
    handleSubmit
  } = props;
  console.log(props);
  const {id: teamId, name: teamName, isPaid} = team;
  const hasActiveMeeting = Boolean(team && team.meetingId);
  const hasOverlay = hasActiveMeeting || !isPaid;
  const isSettings = router.isActive(`/team/${teamId}/settings`, false);
  initialValues.teamName = teamName;
  const DashHeaderInfoTitle = isSettings ? <EditTeamName initialValues={initialValues} teamName={teamName} teamId={teamId} /> : teamName;
  const modalLayout = hasDashAlert ? ui.modalLayoutMainWithDashAlert : ui.modalLayoutMain;
  const archiveTeam = () => {
    const {id, name} = team;
    const variables = {
      updatedTeam: {
        id,
        name,
        isArchived: true
      }
    };
    cashay.mutate('archiveTeam', {variables});
    router.push('/me');
  };

  const potato = async (data) => {
    console.log(data);
  };
  handleSubmit(potato);
  const archiveTeamButton = (
    <div style={buttonStyle}>
      <Button
        colorPalette="warm"
        label="Archive Team"
        size="smallest"
        onClick={archiveTeam}
      />
      <Field
        autoFocus
        handleSubmit={handleSubmit(potato)}
        colorPalette="gray"
        component={InputField}
        name="preferredName"
        placeholder="Type the team name to confirm"
        type="text"
      />
    </div>
  );
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
          {isSettings ? settingsLinks(teamId) : standardLinks(teamId)}
        </DashHeaderInfo>
        {isSettings && myTeamMember.isLead && archiveTeamButton}
        <DashboardAvatars teamMembers={teamMembers} />
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
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default reduxForm({form: 'archiveTeamConfirmation'})(withRouter(Team));
