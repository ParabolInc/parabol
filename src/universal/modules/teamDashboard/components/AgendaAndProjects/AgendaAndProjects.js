import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import layoutStyle from 'universal/styles/layout';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';

const {combineStyles} = StyleSheet;

const AgendaAndProjects = (props) => {
  const {styles} = AgendaAndProjects;
  const {teamId} = props.params;
  return (
    <div className={styles.root}>
      <div className={styles.agendaLayout}>
        <TeamAgenda teamId={teamId}/>
      </div>
      <div className={styles.projectsLayout}>
        <div className={combineStyles(styles.root, styles.projects)}>
          <TeamProjectsHeader teamId={teamId}/>
          <TeamColumnsContainer
            teamId={teamId}
          />
        </div>
      </div>
    </div>
  );
};

AgendaAndProjects.propTypes = {
  teamId: PropTypes.string,
  teamMembers: PropTypes.array
};

AgendaAndProjects.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem 1rem 1rem 0',
    width: '100%'
  },

  projects: {
    flexDirection: 'column',
  },

  agendaLayout: {
    width: layoutStyle.dashAgendaWidth
  },

  projectsLayout: {
    width: '80%'
  }
});

export default look(AgendaAndProjects);
