import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import TeamAgenda from 'universal/modules/teamDashboard/components/TeamAgenda/TeamAgenda';
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer';
import TeamProjectsHeaderContainer from 'universal/modules/teamDashboard/containers/TeamProjectsHeader/TeamProjectsHeaderContainer';

const AgendaAndProjects = (props) => {
  const {params: {teamId}, styles} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.inner)}>
        <div className={css(styles.agendaLayout)}>
          <TeamAgenda teamId={teamId} />
        </div>
        <div className={css(styles.projectsLayout)}>
          <div className={css(styles.root, styles.projects)}>
            <TeamProjectsHeaderContainer
              teamId={teamId}
            />
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
  params: PropTypes.object,
  styles: PropTypes.object,
  teamId: PropTypes.string,
  teamMembers: PropTypes.array
};

const borderColor = ui.dashBorderColor;
const styleThunk = () => ({
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
    display: 'flex',
    flexDirection: 'column',
    maxWidth: ui.dashAgendaWidth,
    minWidth: ui.dashAgendaWidth
  },

  projectsLayout: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    paddingLeft: '1rem'
  }
});

export default withStyles(styleThunk)(AgendaAndProjects);
