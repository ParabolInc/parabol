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
  const {dispatch, team, teamMembers, user} = props;
  const membership = teamMembers.find(member => member.userId === user.id);
  const teamMemberId = membership && membership.id;
  return (
    <DashLayout title="Team Dashboard">
      <DashSidebar
        activeArea="team"
        activeTeamId={team.id}
        dispatch={dispatch}
        user={user}
      />
      <DashMain>
        <DashHeader>
          <DashHeaderInfo title={team.name}>
            <Link
              to={`/meeting/${team.id}`}
              style={linkStyle}
              title="Meeting Lobby"
            >
              <FontAwesome name="arrow-circle-right" style={faIconStyle} /> Meeting Lobby
            </Link>
            <Link
              to={`/meeting/${team.id}/settings`}
              style={linkStyle}
              title="Team Settings"
            >
              <FontAwesome name="cog" style={faIconStyle} /> Team Settings
            </Link>
          </DashHeaderInfo>
          <DashboardAvatars teamMembers={teamMembers}/>
        </DashHeader>
        <DashContent>
          {console.log(`teamMemberId: ${teamMemberId}`)}
          <AgendaAndProjects teamMemberId={teamMemberId}/>
        </DashContent>
      </DashMain>
    </DashLayout>
  );
};

Team.propTypes = {
  dispatch: PropTypes.func.isRequired,
  team: PropTypes.object.isRequired,
  teamMembers: PropTypes.array.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    preferredName: PropTypes.string,
  })
};

export default Team;
