import React, {PropTypes} from 'react';
import FontAwesome from 'react-fontawesome';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashLayout,
  DashMain,
  DashSidebar
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
  const {team, myTeamMemberId, teamMembers} = props;
  const teamId = team.id;
  const teamName = team.name;
  const hasOverlay = Boolean(team && team.meetingId);
  return (
    <div>
      {hasOverlay && <TeamDashModal teamId={teamId} teamName={teamName}/>}
      <DashMain hasOverlay={hasOverlay}>
        <DashHeader>
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
        <DashContent>
          <AgendaAndProjects
            myTeamMemberId={myTeamMemberId}
            teamId={teamId}
            teamMembers={teamMembers}
          />
        </DashContent>
      </DashMain>
    </div>
  );
};

Team.propTypes = {
  myTeamMemberId: PropTypes.string,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
};

export default Team;
