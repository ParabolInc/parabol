import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import TaskColumn from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumn';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {columnArray, MEETING, meetingColumnArray} from 'universal/utils/constants';
import makeTasksByStatus from 'universal/utils/makeTasksByStatus';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';

class TaskColumns extends Component {
  componentWillMount() {
    const {tasks} = this.props;
    this.groupTasksByStatus(tasks);
  }

  componentWillReceiveProps(nextProps) {
    const {tasks} = nextProps;
    const {tasks: oldTasks} = this.props;
    if (tasks !== oldTasks) {
      this.groupTasksByStatus(tasks);
    }
  }

  groupTasksByStatus(tasks) {
    const nodes = tasks.edges.map(({node}) => node);
    this.setState({
      tasks: makeTasksByStatus(nodes)
    });
  }

  render() {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  // TODO we only need userId, we can compute myTeamMemberId
    const {
      alignColumns,
      area,
      getTaskById,
      isMyMeetingSection,
      myTeamMemberId,
      styles,
      teams,
      teamMemberFilterId
    } = this.props;
    const {tasks} = this.state;
    const rootStyles = css(styles.root, styles[alignColumns]);
    const lanes = area === MEETING ? meetingColumnArray : columnArray;
    return (
      <div className={rootStyles}>
        <div className={css(styles.columns)}>
          {lanes.map((status, idx) =>
            (<TaskColumn
              key={`taskCol${status}`}
              area={area}
              isMyMeetingSection={isMyMeetingSection}
              firstColumn={idx === 0}
              getTaskById={getTaskById}
              lastColumn={idx === (lanes.length - 1)}
              myTeamMemberId={myTeamMemberId}
              teamMemberFilterId={teamMemberFilterId}
              tasks={tasks[status]}
              status={status}
              teams={teams}
            />)
          )}
        </div>
        <EditorHelpModalContainer />
      </div>
    );
  }
}

TaskColumns.propTypes = {
  alignColumns: PropTypes.oneOf([
    'center',
    'left',
    'right'
  ]),
  area: PropTypes.string,
  getTaskById: PropTypes.func.isRequired,
  isMyMeetingSection: PropTypes.bool,
  myTeamMemberId: PropTypes.string,
  tasks: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamMemberFilterId: PropTypes.string,
  teams: PropTypes.array
};

TaskColumns.defaultProps = {
  alignColumns: 'left'
};

const styleThunk = () => ({
  root: {
    borderTop: `1px solid ${ui.dashBorderColor}`,
    display: 'flex',
    flex: '1',
    width: '100%'
  },

  center: {
    justifyContent: 'center'
  },

  left: {
    justifyContent: 'flex-start'
  },

  right: {
    justifyContent: 'flex-end'
  },

  columns: {
    display: 'flex !important',
    maxWidth: ui.taskColumnsMaxWidth,
    minWidth: ui.taskColumnsMinWidth,
    width: '100%'
  }
});

export default withStyles(styleThunk)(TaskColumns);
