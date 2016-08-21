import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamProjects from 'universal/modules/teamDashboard/components/TeamProjects/TeamProjects';

const AgendaAndProjects = (props) => {
  const {styles} = AgendaAndProjects;
  const {myTeamMemberId, teamId, teamMembers} = props;
  return (
    <div className={styles.root}>
      <div className={styles.agendaLayout}>
        <TeamAgenda teamId={teamId}/>
      </div>
      <div className={styles.projectsLayout}>
        <TeamProjects
          myTeamMemberId={myTeamMemberId}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  );
};

AgendaAndProjects.propTypes = {
  myTeamMemberId: PropTypes.string,
  teamId: PropTypes.string.isRequired,
  teamMembers: PropTypes.array
};

AgendaAndProjects.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem',
    width: '100%'
  },

  agendaLayout: {
    width: '20%'
  },

  projectsLayout: {
    width: '80%'
  }
});

export default look(AgendaAndProjects);
