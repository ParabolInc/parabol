import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import {DashSectionHeading} from 'universal/components/Dashboard';

const AgendaHeader = () => {
  const {styles} = AgendaHeader;
  return (
    <div className={styles.root}>
      <DashSectionHeading icon="calendar-check-o" label="Agenda Queue" />
    </div>
  );
};

AgendaHeader.const styleThunk = () => ({
  root: {
    padding: '1rem 1rem 1rem 2.375rem',
    width: '100%'
  }
});

export default withStyles(styleThunk)(AgendaHeader);
