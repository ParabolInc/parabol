import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInput from 'universal/modules/teamDashboard/components/AgendaListAndInput/AgendaListAndInput';
import TeamColumnsContainer from 'universal/modules/teamDashboard/containers/TeamColumns/TeamColumnsContainer';
import TeamTasksHeaderContainer from 'universal/modules/teamDashboard/containers/TeamTasksHeader/TeamTasksHeaderContainer';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const AgendaAndTasks = (props) => {
  const {viewer, styles} = props;
  const {teamMember: {hideAgenda}, team} = viewer;
  const {teamId, teamName} = team;
  return (
    <div className={css(styles.root)}>
      <Helmet title={`${teamName} | Parabol`} />
      <div className={css(styles.headers)}>
        <div className={css(styles.tasksLayout, styles.tasksLayoutHeader)}>
          <TeamTasksHeaderContainer team={team} />
        </div>
        <div className={css(styles.agendaLayout, !hideAgenda && styles.agendaLayoutOpen)}>
          <AgendaHeader hideAgenda={hideAgenda} teamId={teamId} />
        </div>
      </div>
      <div className={css(styles.agendaAndTasks)}>
        <div className={css(styles.tasksLayout, styles.tasksLayoutContent, !hideAgenda && styles.tasksLayoutShared)}>
          <TeamColumnsContainer teamId={teamId} viewer={viewer} />
        </div>
        {!hideAgenda &&
        <div className={css(styles.agendaLayout, !hideAgenda && styles.agendaLayoutOpen)}>
          <AgendaListAndInput canNavigate={false} context="dashboard" disabled={false} team={team} />
        </div>
        }
      </div>
    </div>
  );
};

AgendaAndTasks.propTypes = {
  styles: PropTypes.object,
  teamId: PropTypes.string,
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

  agendaAndTasks: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },

  agendaLayout: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: ui.dashAgendaWidth,
    minWidth: ui.dashAgendaWidth
  },

  agendaLayoutOpen: {
    backgroundColor: ui.palette.white
  },

  tasksLayout: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },

  tasksLayoutShared: {
    borderRight: `1px solid ${borderColor}`
  },

  tasksLayoutHeader: {
    borderRight: `1px solid ${borderColor}`
  },

  tasksLayoutContent: {
    borderTop: `1px solid ${borderColor}`
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(AgendaAndTasks),
  graphql`
    fragment AgendaAndTasks_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamName: name
        ...AgendaListAndInput_team
        ...TeamTasksHeaderContainer_team
      }
      teamMember(teamId: $teamId) {
        hideAgenda
      }
      ...TeamColumnsContainer_viewer
    }
  `
);
