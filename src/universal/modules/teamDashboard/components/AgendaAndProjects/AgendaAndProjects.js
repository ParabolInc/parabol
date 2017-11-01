import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer';
import TeamProjectsHeaderContainer from 'universal/modules/teamDashboard/containers/TeamProjectsHeader/TeamProjectsHeaderContainer';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import {createFragmentContainer} from 'react-relay';

const AgendaAndProjects = (props) => {
  const {viewer, teamId, teams, styles} = props;
  const {teamMember: {hideAgenda}} = viewer;
  const team = teams && teams.find(({id}) => id === teamId);
  const teamName = team && team.name;
  return (
    <div className={css(styles.root)}>
      <Helmet title={`${teamName} | Parabol`} />
      <div className={css(styles.headers)}>
        <div className={css(styles.agendaLayout)}>
          <AgendaHeader hideAgenda={hideAgenda} teamId={teamId} />
        </div>
        <div className={css(styles.projectsLayout)}>
          <TeamProjectsHeaderContainer teamId={teamId} />
        </div>
      </div>
      <div className={css(styles.agendaAndProjects)}>
        {!hideAgenda &&
          <div className={css(styles.agendaLayout)}>
            <AgendaListAndInputContainer canNavigate={false} context="dashboard" disabled={false} teamId={teamId} />
          </div>
        }
        <div className={css(styles.projectsLayout, !hideAgenda && styles.projectsLayoutShared)}>
          <TeamColumnsContainer teamId={teamId} viewer={viewer} />
        </div>
      </div>
    </div>
  );
};

AgendaAndProjects.propTypes = {
  styles: PropTypes.object,
  teamId: PropTypes.string,
  teams: PropTypes.array,
  viewer: PropTypes.object
};

const borderColor = ui.dashBorderColor;
const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  headers: {
    display: 'flex',
    width: '100%'
  },

  agendaAndProjects: {
    display: 'flex',
    flex: 1,
    width: '100%'
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
    flexDirection: 'column'
  },
  projectsLayoutShared: {
    // paddingLeft: '1rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(AgendaAndProjects),
  graphql`
    fragment AgendaAndProjects_viewer on User {
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...TeamColumnsContainer_viewer
    }
  `
);
