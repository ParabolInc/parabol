import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
} from 'universal/components/Dashboard';
import {Link} from 'react-router';
import DashboardAvatars from 'universal/components/DashboardAvatars/DashboardAvatars';
import AgendaAndProjects from 'universal/modules/teamDashboard/components/AgendaAndProjects/AgendaAndProjects';
import TeamDashModal from '../TeamDashModal/TeamDashModal';

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

const Team = (props) => {
  const {team, teamMembers} = props;
  const teamId = team.id;
  const teamName = team.name;
  const hasOverlay = Boolean(team && team.meetingId);
  return (
    <DashMain>
      {hasOverlay && <TeamDashModal teamId={teamId} teamName={teamName}/>}
      <DashHeader hasOverlay={hasOverlay}>
        <DashHeaderInfo title={teamName}>
          <Link
            to={`/meeting/${teamId}`}
            style={linkStyle}
            title="Meeting Lobby"
          >
            <FontAwesome name="arrow-circle-right" style={faIconStyle}/> Meeting Lobby
          </Link>
          <Link
            to={`/meeting/${teamId}/settings`}
            style={linkStyle}
            title="Team Settings"
          >
            <FontAwesome name="cog" style={faIconStyle}/> Team Settings
          </Link>
        </DashHeaderInfo>
        <DashboardAvatars teamMembers={teamMembers}/>
      </DashHeader>
      <DashContent hasOverlay={hasOverlay} padding="0">
        <AgendaAndProjects
          teamId={teamId}
        />
      </DashContent>
    </DashMain>
  );
};

Team.propTypes = {
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default Team;
