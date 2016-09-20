import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import layout from 'universal/styles/layout';
import ui from 'universal/styles/ui';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer';
import TeamProjectsHeader from 'universal/modules/teamDashboard/components/TeamProjectsHeader/TeamProjectsHeader';

const borderColor = ui.dashBorderColor;
const {combineStyles} = StyleSheet;

const AgendaAndProjects = (props) => {
  const {styles} = AgendaAndProjects;
  const {teamId} = props.params;
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.agendaLayout}>
          <TeamAgenda teamId={teamId}/>
        </div>
        <div className={styles.projectsLayout}>
          <div className={combineStyles(styles.root, styles.projects)}>
            <TeamProjectsHeader/>
            <TeamColumnsContainer
              teamId={teamId}
            />
          </div>
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
    flexDirection: 'column',
    width: '100%'
  },

  inner: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },

  projects: {
    flex: 1,
    flexDirection: 'column',
  },

  agendaLayout: {
    borderRight: `2px solid ${borderColor}`,
    width: layout.dashAgendaWidth
  },

  projectsLayout: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    paddingLeft: '1rem'
  }
});

export default look(AgendaAndProjects);
