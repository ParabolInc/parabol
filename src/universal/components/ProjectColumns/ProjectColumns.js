import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import ui from 'universal/styles/ui';
import {columnArray} from 'universal/utils/constants';
import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';

const ProjectColumns = (props) => {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  // TODO we only need userId, we can compute myTeamMemberId
  const {alignColumns, area, myTeamMemberId, projects, styles, teams, userId, zIndex} = props;
  const rootStyles = css(styles.root, styles[alignColumns]);
  const positionStyle = zIndex && {
    position: 'relative',
    zIndex
  };
  return (
    <div className={rootStyles} style={positionStyle}>
      <div className={css(styles.columns)}>
        {columnArray.map((status) =>
          <ProjectColumn
            key={`projectCol${status}`}
            area={area}
            myTeamMemberId={myTeamMemberId}
            projects={projects[status]}
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
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string,
  zIndex: PropTypes.string
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
