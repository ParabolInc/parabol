import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import {columnArray} from 'universal/utils/constants';

import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';
const combineStyles = StyleSheet.combineStyles;
const borderColor = ui.dashBorderColor;
let styles = {};

const ProjectColumns = (props) => {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  // TODO we only need userId, we can compute myTeamMemberId
  const {alignColumns, area, myTeamMemberId, projects, teams, userId} = props;
  const rootStyles = combineStyles(styles.root, styles[alignColumns]);
  return (
    <div className={rootStyles}>
      <div className={styles.columns}>
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
  projects: PropTypes.object.isRequired
};

ProjectColumns.defaultProps = {
  alignColumns: 'left'
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
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

export default look(ProjectColumns);
