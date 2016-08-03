import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import OutcomeCard from 'universal/components/OutcomeCard/OutcomeCard';
import {ACTIVE, STUCK, DONE, FUTURE} from 'universal/utils/constants';
import FontAwesome from 'react-fontawesome';

const borderColor = 'rgba(0, 0, 0, .1)';
let styles = {};

const labels = {
  [ACTIVE]: 'Active',
  [STUCK]: 'Stuck',
  [DONE]: 'Done',
  [FUTURE]: 'Future'
};

const ProjectColumn = (props) => {
  const {status, projects} = props;
  const handleAddProject = (e) => {
    console.log('adding project!');
  };
  return (
    <div className={styles.column}>
      <div className={styles.columnHeading}>
        <span>{labels[status]}</span>
        <FontAwesome name="plus-square" onClick={handleAddProject}/>
      </div>
      <OutcomeCard status={status}/>
      <OutcomeCard status={status}/>
      <OutcomeCard status={status}/>
      <OutcomeCard status={status}/>
    </div>
  );
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
  }
});

export default look(ProjectColumn);
