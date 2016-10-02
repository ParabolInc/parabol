import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import ui from 'universal/styles/ui';
import UserActionHeader from 'universal/modules/userDashboard/components/UserActionHeader/UserActionHeader';
import UserActionListContainer from 'universal/modules/userDashboard/containers/UserActionList/UserActionListContainer';

const UserActions = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.root)}>
      <UserActionHeader/>
      <UserActionListContainer/>
    </div>
  );
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: `0 0 ${ui.dashGutter}`,
    width: '100%'
  }
});

export default withStyles(styleThunk)(UserActions);
