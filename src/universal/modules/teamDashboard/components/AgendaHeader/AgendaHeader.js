import React from 'react';
import look, {StyleSheet} from 'react-look';

const AgendaHeader = () => {
  const {styles} = AgendaHeader;
  return (
    <div className={styles.root}>
      Agenda Queue ?
    </div>
  );
};

AgendaHeader.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaHeader);
