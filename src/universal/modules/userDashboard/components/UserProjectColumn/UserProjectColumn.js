import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
import OutcomeCard from '../../../teamDashboard/components/TeamProjectCard/TeamProjectCard';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';


const borderColor = 'rgba(0, 0, 0, .1)';
let styles = {};

const labels = {
  [ACTIVE]: 'Active',
  [STUCK]: 'Stuck',
  [DONE]: 'Done',
  [FUTURE]: 'Future'
};

const UserProjectColumn = (props) => {
  const {status, projects} = props;
  return (
    <div className={styles.column}>
      <div className={styles.columnHeading}>
        <span>{labels[status]}</span>
      </div>
      {projects.map(project =>
        <OutcomeCard
          key={`userCard${project.id}`}
          isProject
          showByTeam
          form={project.id}
          content={project.content}
          status={project.status}
          updatedAt={project.updatedAt}
          projectId={project.id}
        />)
      }
    </div>
  );
};

UserProjectColumn.propTypes = {
  projects: PropTypes.array,
  status: PropTypes.string,
  teamMembers: PropTypes.array,
  teamMemberId: PropTypes.string
};

const columnStyles = {
  flex: 1,
  width: '25%'
};

const styleThunk = () => ({
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
    color: appTheme.palette.dark,
    fontWeight: 700,
    margin: '0 0 1rem'
  }
});

export default withStyles(styleThunk)(UserProjectColumn);
