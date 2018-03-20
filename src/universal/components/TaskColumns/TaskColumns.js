import PropTypes from 'prop-types';
import React, {Component} from 'react';
import TaskColumn from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumn';
import ui from 'universal/styles/ui';
import {columnArray, MEETING, meetingColumnArray} from 'universal/utils/constants';
import makeTasksByStatus from 'universal/utils/makeTasksByStatus';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';
import styled from 'react-emotion';

const RootBlock = styled('div')({
  display: 'flex',
  flex: '1',
  width: '100%'
});

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  margin: '0 auto',
  maxWidth: ui.taskColumnsMaxWidth,
  minWidth: ui.taskColumnsMinWidth,
  padding: `0 ${ui.taskColumnPaddingInnerSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    paddingLeft: ui.taskColumnPaddingInnerLarge,
    paddingRight: ui.taskColumnPaddingInnerLarge
  }
});

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
      area,
      getTaskById,
      isMyMeetingSection,
      myTeamMemberId,
      teams,
      teamMemberFilterId
    } = this.props;
    const {tasks} = this.state;
    const lanes = area === MEETING ? meetingColumnArray : columnArray;
    console.log(area);
    console.log('area');
    return (
      <RootBlock>
        <ColumnsBlock>
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
        </ColumnsBlock>
        <EditorHelpModalContainer />
      </RootBlock>
    );
  }
}

TaskColumns.propTypes = {
  area: PropTypes.string,
  getTaskById: PropTypes.func.isRequired,
  isMyMeetingSection: PropTypes.bool,
  myTeamMemberId: PropTypes.string,
  tasks: PropTypes.object.isRequired,
  teamMemberFilterId: PropTypes.string,
  teams: PropTypes.array
};

export default TaskColumns;
