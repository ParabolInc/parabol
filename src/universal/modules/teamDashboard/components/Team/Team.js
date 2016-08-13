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
  const {activeMeetings, dispatch, projects, team, teamId, teamMembers, user} = props;
  const hasOverlay = team && team.meetingId;
  const teamMemberId = `${user.id}::${teamId}`;
  return (
    <DashLayout activeMeetings={activeMeetings} title="Team Dashboard">
      <DashSidebar
        activeArea="team"
        activeTeamId={teamId}
        dispatch={dispatch}
        user={user}
      />
      {hasOverlay &&
        <TeamDashModal teamId={teamId} />
      }
      <DashMain hasOverlay={hasOverlay}>
        <DashHeader>
          <DashHeaderInfo title={team.name}>
            <Link
              to={`/meeting/${teamId}`}
              style={linkStyle}
              title="Meeting Lobby"
            >
              <FontAwesome name="arrow-circle-right" style={faIconStyle} /> Meeting Lobby
            </Link>
            <Link
              to={`/meeting/${teamId}/settings`}
              style={linkStyle}
              title="Team Settings"
            >
              <FontAwesome name="cog" style={faIconStyle} /> Team Settings
            </Link>
          </DashHeaderInfo>
          <DashboardAvatars teamMembers={teamMembers}/>
        </DashHeader>
        <DashContent>
          <AgendaAndProjects teamId={teamId} projects={projects} teamMembers={teamMembers} teamMemberId={teamMemberId}/>
        </DashContent>
      </DashMain>
    </DashLayout>
  );
};

Team.propTypes = {
  dispatch: PropTypes.func.isRequired,
  projects: PropTypes.array,
  teamId: PropTypes.string.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    preferredName: PropTypes.string,
  })
};

export default Team;
