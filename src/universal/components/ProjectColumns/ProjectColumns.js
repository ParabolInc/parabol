import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {columnArray, meetingColumnArray, MEETING} from 'universal/utils/constants';
import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';

const ProjectColumns = (props) => {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  // TODO we only need userId, we can compute myTeamMemberId
  const {
    alignColumns,
    area,
    myTeamMemberId,
    projects,
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
        {lanes.map((status) =>
          <ProjectColumn
            key={`projectCol${status}`}
            area={area}
            myTeamMemberId={myTeamMemberId}
            projects={projects[status]}
            queryKey={queryKey}
            status={status}
            teams={teams}
            userId={userId}
          />
        )}
      </div>
    </div>
  );
};

ProjectColumns.propTypes = {
  alignColumns: PropTypes.oneOf([
    'center',
    'left',
    'right'
  ]),
  area: PropTypes.string,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object.isRequired,
  queryKey: PropTypes.string,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
};

ProjectColumns.defaultProps = {
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
    justifyContent: 'center',
  },

  left: {
    justifyContent: 'flex-start',
  },

  right: {
    justifyContent: 'flex-end',
  },

  columns: {
    display: 'flex !important',
    maxWidth: ui.projectColumnsMaxWidth,
    minWidth: ui.projectColumnsMinWidth,
    width: '100%'
  }
});

export default withStyles(styleThunk)(ProjectColumns);
