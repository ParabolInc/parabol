import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import AgendaToggle from 'universal/modules/teamDashboard/components/AgendaToggle/AgendaToggle';
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
      <div className={css(styles.inner)}>

        {/* Task Columns */}
        <div className={css(styles.taskColumns)}>
          <div className={css(styles.taskColumnsHeader)}>
            <TeamTasksHeaderContainer team={team} />
          </div>
          <div className={css(styles.taskColumnsContent)}>
            <TeamColumnsContainer teamId={teamId} viewer={viewer} />
          </div>
        </div>

        {/* Agenda Column */}
        <div className={css(styles.agendaColumn, hideAgenda && styles.agendaColumnHidden)}>
          <div className={css(styles.agendaColumnInner, hideAgenda && styles.agendaColumnInnerHidden)}>
            <div className={css(styles.agendaColumnHeader)}>
              <AgendaToggle hideAgenda={hideAgenda} teamId={teamId} />
            </div>
            {!hideAgenda &&
            <div className={css(styles.agendaColumnContent)}>
              <AgendaListAndInput canNavigate={false} context="dashboard" disabled={false} team={team} />
            </div>
            }
          </div>
        </div>

      </div>
    </div>
  );
};

AgendaAndTasks.propTypes = {
  styles: PropTypes.object,
  teamId: PropTypes.string,
  viewer: PropTypes.object
};

const breakpointDown = `@media (max-width: ${ui.dashTeamMaxWidthDown})`;
const breakpointUp = `@media (min-width: ${ui.dashTeamMaxWidthUp})`;

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    width: '100%'
  },

  inner: {
    display: 'flex',
    flex: 1,
    position: 'relative',
    width: '100%',

    [breakpointUp]: {
      margin: '0 auto',
      maxWidth: ui.dashTeamMaxWidth
    }
  },

  taskColumns: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  taskColumnsHeader: {
    // Define
  },

  taskColumnsContent: {
    display: 'flex',
    flex: 1
  },

  agendaColumn: {
    backgroundColor: ui.palette.white,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    maxWidth: ui.dashAgendaWidth,
    minWidth: ui.dashAgendaWidth,
    position: 'relative',
    width: '100%',

    [breakpointUp]: {
      backgroundColor: ui.backgroundColor,
      height: '100%',
      padding: '2rem 0'
    }
  },

  agendaColumnInner: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    [breakpointUp]: {
      backgroundColor: ui.palette.white,
      borderRadius: ui.cardBorderRadius,
      boxShadow: ui.shadow[2]
    }
  },

  agendaColumnInnerHidden: {
    [breakpointUp]: {
      backgroundColor: 'transparent',
      borderRadius: 0,
      boxShadow: 'hone'
    }
  },

  agendaColumnHidden: {
    [breakpointDown]: {
      backgroundColor: 'transparent',
      maxWidth: 'none',
      minWidth: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      width: 'auto'
    },
    [breakpointUp]: {
      // Define
    }
  },

  agendaColumnHeader: {
    [breakpointUp]: {
      // Define
    }
  },

  agendaColumnContent: {
    display: 'flex',
    flex: 1,

    [breakpointUp]: {
      // Define
    }
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
