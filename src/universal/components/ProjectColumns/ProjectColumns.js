import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import {columnArray} from 'universal/utils/constants';

import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';

const borderColor = ui.dashBorderColor;
let styles = {};

const ProjectColumns = (props) => {
  // myTeamMemberId is undefined if this is coming from USER_DASH
  const {area, myTeamMemberId, projects} = props;
  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        {columnArray.map((status) =>
          <ProjectColumn
            key={`projectCol${status}`}
            area={area}
            myTeamMemberId={myTeamMemberId}
            projects={projects[status]}
            status={status}
          />
        )}
      </div>
    </div>
  );
};

ProjectColumns.propTypes = {
  area: PropTypes.string,
  myTeamMemberId: PropTypes.string,
  projects: PropTypes.object.isRequired
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
    display: 'flex',
    flex: '1',
    width: '100%'
  },

  columns: {
    display: 'flex !important',
    maxWidth: '80rem',
    width: '100%'
  }
});

export default look(ProjectColumns);
