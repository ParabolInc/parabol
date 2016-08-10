import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const AgendaList = (props) => {
  const {styles} = AgendaList;
  return (
    <div className={styles.root}>
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
  );
};

AgendaList.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaList);
