import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamProjects from 'universal/modules/teamDashboard/components/TeamProjects/TeamProjects';

const AgendaAndProjects = (props) => {
  const {styles} = AgendaAndProjects;
  const {dispatch, editing, projects, teamId, teamMembers, teamMemberId} = props;
  return (
    <div className={styles.root}>
      <div className={styles.agendaLayout}>
        <TeamAgenda teamId={teamId}/>
      </div>
      <div className={styles.projectsLayout}>
        <TeamProjects
          dispatch={dispatch}
          editing={editing}
          projects={projects}
          teamMembers={teamMembers}
          teamMemberId={teamMemberId}
        />
      </div>
    </div>
  );
};

AgendaAndProjects.propTypes = {
  dispatch: PropTypes.func.required,
  editing: PropTypes.object,
  projects: PropTypes.array,
  teamId: PropTypes.string.isRequired,
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
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
