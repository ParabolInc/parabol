import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import UserActionHeader from 'universal/modules/userDashboard/components/UserActionHeader/UserActionHeader';
import UserActionListContainer from 'universal/modules/userDashboard/containers/UserActionList/UserActionListContainer';

const UserActions = (props) => {
  const {styles} = UserActions;
  return (
    <div className={styles.root}>
      <UserActionHeader/>
      <UserActionListContainer/>
    </div>
  );
};

UserActions.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(UserActions);
