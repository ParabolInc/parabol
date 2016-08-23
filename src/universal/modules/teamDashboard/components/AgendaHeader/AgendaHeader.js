import React from 'react';
import look, {StyleSheet} from 'react-look';
import {DashPanelHeading} from 'universal/components/Dashboard';

const AgendaHeader = () => {
  const {styles} = AgendaHeader;
  return (
    <div className={styles.root}>
      <DashPanelHeading icon="check" label="Agenda Queue" />
    </div>
  );
};

AgendaHeader.styles = StyleSheet.create({
  root: {
    padding: '1rem 1rem 1rem 4rem',
    width: '100%'
  }
});

export default look(AgendaHeader);
