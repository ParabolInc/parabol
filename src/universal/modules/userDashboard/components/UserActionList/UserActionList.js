import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const UserActionList = (props) => {
  const {styles} = UserActionList;
  const {actions} = props;
  return (
    <div className={styles.root}>
      {actions.map(item => <div key={`action${item.id}`}>{item.content}</div>)}
    </div>
  );
};

UserActionList.propTypes = {
  actions: PropTypes.array
};

UserActionList.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(UserActionList);
