import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import UserActionListEmpty from '../UserActionListEmpty/UserActionListEmpty';

const UserActionList = (props) => {
  const {styles} = UserActionList;
  const {actions} = props;
  return (
    <div className={styles.root}>
      {actions.length === 0 ?
        <UserActionListEmpty /> :
        <div className={styles.root}>
          {actions.map(item => <div key={`action${item.id}`}>{item.content} - {item.updatedAt.toString()}</div>)}
        </div>
      }
    </div>
  );
};

UserActionList.propTypes = {
  actions: PropTypes.array
};

UserActionList.styles = StyleSheet.create({
  root: {
    padding: `0 ${ui.dashGutter} ${ui.dashGutter}`,
    width: '100%'
  }
});

export default look(UserActionList);
