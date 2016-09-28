import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import {cardBorderTop} from 'universal/styles/helpers';
import UserActionListEmpty from './UserActionListEmpty';
import UserActionListHeader from './UserActionListHeader';
import UserActionListItem from './UserActionListItem';
import UserActionListTeamSelect from './UserActionListTeamSelect';

const UserActionList = (props) => {
  const {styles} = UserActionList;

  // TODO: get the real actions array here:
  // const {actions, isAdding} = props;
  const {actions, isAdding, teams, userId} = props;

  // Sample actions array for dev hackery
  // const actions = [
    // {
    //   content: 'New action added on top of previous actions, after selecting a team if more than one team',
    //   id: '000',
    //   isEditing: true,
    //   team: 'Parabol',
    //   updatedAt: 'Just Now'
    // },
    // {
    //   content: 'PR merged',
    //   id: '001',
    //   isEditing: false,
    //   team: 'Parabol',
    //   updatedAt: 'Today'
    // },
    // {
    //   content: 'UI iterated',
    //   id: '002',
    //   isEditing: false,
    //   team: 'Parabol',
    //   updatedAt: 'Yesterday'
    // },
    // {
    //   content: 'Pivot completed',
    //   id: '003',
    //   isEditing: false,
    //   team: 'Parabol',
    //   updatedAt: 'Last Week'
    // },
    // {
    //   content: 'Pitch deck updated',
    //   id: '004',
    //   isEditing: false,
    //   team: 'Parabol',
    //   updatedAt: '5 Mins Ago'
    // }
  // ];
  const actionCount = actions.length;
  const createNewAction = () =>

    // TODO: if user is on many teams, show team select
    //       otherwise autoFocus a brand new item at the top of the list
    //       isAdding is now false and the Add New Control is showing.
    //       Why? As soon as they are done editing they can click the control again
    //       to add another action. (TA)

    // TODO: if it is the first action then the empty message dissappears,
    //       only showing the focused new action item. (TA)

    // TODO: if user blurs an empty textarea, delete the action (TA)
    console.log('UserActionList.createNewAction()');

  const handleCheck = () =>
    // TODO: item is set to [hidden for data insights?] —pop a toast to undo? (TA)
    console.log('UserActionList.handleCheck()');

  return (
    <div className={styles.root}>
      <div className={styles.block}>
        {isAdding ?
          <UserActionListTeamSelect teams={teams} actionCount={actionCount} userId={userId}/> :
          <UserActionListHeader onAddNewAction={createNewAction} />
        }
        {actionCount ?
          <div className={styles.actions}>
            {actions.map(item =>
              <UserActionListItem
                content={item.content}
                form={`actionItem::${item.id}`}
                actionId={item.id}
                isEditing={item.isEditing}
                onChecked={handleCheck}
                team={item.team}
              />
            )}
            <div className={styles.hr}></div>
          </div> :
          <div>{!isAdding && <UserActionListEmpty />}</div>
        }
      </div>
    </div>
  );
};

UserActionList.propTypes = {
  actions: PropTypes.array,
  isAdding: PropTypes.bool
};

UserActionList.defaultProps = {
  isAdding: true
};

UserActionList.styles = StyleSheet.create({
  root: {
    padding: `0 ${ui.dashGutter} ${ui.dashGutter}`,
    width: '100%'
  },

  block: {
    backgroundColor: ui.actionCardBgColor,
    borderColor: ui.cardBorderColor,
    borderRadius: ui.cardBorderRadius,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderTop: `1px solid ${ui.cardBorderColor}`,
    padding: '.1875rem 0 .5rem',
    position: 'relative',

    '::after': {
      ...cardBorderTop
    }
  },

  actions: {
    width: '100%'
  },

  hr: {
    backgroundColor: ui.cardBorderColor,
    height: '1px',
    width: '100%'
  }
});

export default look(UserActionList);

// {actions.map(item => <div key={`action${item.id}`}>{item.content} - {item.updatedAt.toString()}</div>)}
