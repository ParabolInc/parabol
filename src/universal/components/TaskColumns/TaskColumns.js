import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {columnArray, meetingColumnArray, MEETING} from 'universal/utils/constants';
import TaskColumn from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumn';
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer';

const TaskColumns = (props) => {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  // TODO we only need userId, we can compute myTeamMemberId
  const {
    alignColumns,
    area,
    isMyMeetingSection,
    myTeamMemberId,
    tasks,
    queryKey,
    styles,
    teams,
    userId
  } = props;
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
            lastColumn={idx === (lanes.length - 1)}
            myTeamMemberId={myTeamMemberId}
            tasks={tasks[status]}
            queryKey={queryKey}
            status={status}
            teams={teams}
            userId={userId}
          />)
        )}
      </div>
      <EditorHelpModalContainer />
    </div>
  );
};

TaskColumns.propTypes = {
  alignColumns: PropTypes.oneOf([
    'center',
    'left',
    'right'
  ]),
  area: PropTypes.string,
  isMyMeetingSection: PropTypes.bool,
  myTeamMemberId: PropTypes.string,
  tasks: PropTypes.object.isRequired,
  queryKey: PropTypes.string,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
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
