import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {columnArray} from 'universal/utils/constants';

import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';

const borderColor = 'rgba(0, 0, 0, .1)';
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
  projects: PropTypes.object
};

const columnStyles = {
  flex: 1,
  width: '25%'
};

styles = StyleSheet.create({
  root: {
    borderTop: `1px solid ${borderColor}`,
    margin: '1rem 0',
    width: '100%'
  },

  columns: {
    display: 'flex !important',
    maxWidth: '80rem',
    width: '100%'
  },

  columnFirst: {
    ...columnStyles,
    padding: '1rem 1rem 0 0'
  },

  column: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 1rem 0'
  },

  columnLast: {
    ...columnStyles,
    borderLeft: `1px solid ${borderColor}`,
    padding: '1rem 0 0 1rem',
  },

  columnHeading: {
    color: theme.palette.dark,
    fontWeight: 700,
    margin: '0 0 1rem'
  },

  cardBlock: {
    marginBottom: '1rem',
    width: '100%'
  }
});

export default look(ProjectColumns);
