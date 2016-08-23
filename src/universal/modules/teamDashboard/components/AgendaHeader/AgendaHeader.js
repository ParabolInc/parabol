import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

const AgendaHeader = () => {
  const {styles} = AgendaHeader;
  return (
    <div className={styles.root}>
      Agenda Queue
    </div>
  );
};

AgendaHeader.styles = StyleSheet.create({
  root: {
    color: theme.palette.dark,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    fontSize: theme.typography.s5,
    padding: '1rem 1rem 1rem 4rem',
    width: '100%'
  }
});

export default look(AgendaHeader);
