import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const AgendaList = (props) => {
  const {styles} = AgendaList;
  const {agenda} = props;
  return (
    <div className={styles.root}>
      {agenda.map(item => <div>{item.content}</div>)}
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
