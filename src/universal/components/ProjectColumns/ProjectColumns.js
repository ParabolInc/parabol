import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {columnArray} from 'universal/utils/constants';
import ProjectColumn from 'universal/modules/teamDashboard/components/ProjectColumn/ProjectColumn';
import UserProjectColumn from 'universal/modules/userDashboard/components/UserProjectColumn/UserProjectColumn';

const borderColor = 'rgba(0, 0, 0, .1)';
let styles = {};

const makeProjectsByStatus = (projects) => {
  const projectsByStatus = columnArray.reduce((reduction, entity) => {
    reduction[entity] = [];
    return reduction;
  }, {});
  projects.forEach(project => {
    projectsByStatus[project.status].push(project);
  });
  columnArray.forEach(status => projectsByStatus[status].sort((a, b) => a.teamSort > b.teamSort));
  return projectsByStatus;
};

const ProjectColumns = (props) => {
  const {projects, teamMembers, teamMemberId} = props;
  const projectsByStatus = makeProjectsByStatus(projects);
  const isUserDash = !Boolean(teamMemberId);
  return (
    <div className={styles.root}>
      <div className={styles.columns}>
        {columnArray.map((status) =>
          isUserDash ?
            <UserProjectColumn
              key={`projectCol${status}`}
              status={status}
              projects={projectsByStatus[status]}
            /> :
            <ProjectColumn
              key={`projectCol${status}`}
              teamMembers={teamMembers}
              teamMemberId={teamMemberId}
              status={status}
              projects={projectsByStatus[status]}
            />
        )}
      </div>
    </div>
  );
};

ProjectColumns.propTypes = {
  projects: PropTypes.array,
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
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
