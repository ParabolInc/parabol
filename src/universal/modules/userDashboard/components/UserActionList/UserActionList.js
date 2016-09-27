import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import {cardBorderTop} from 'universal/styles/helpers';
import UserActionListEmpty from './UserActionListEmpty';
import UserActionListHeader from './UserActionListHeader';
import UserActionListItem from './UserActionListItem';

const UserActionList = (props) => {
  const {styles} = UserActionList;
  // const {actions} = props;

  // Sample actions for dev hackery
  const actions = [
    {
      content: 'PR merged',
      id: '001',
      isEditing: false,
      team: 'Parabol',
      updatedAt: 'Today'
    },
    {
      content: 'UI iterated',
      id: '002',
      isEditing: true,
      team: 'Parabol',
      updatedAt: 'Yesterday'
    },
    {
      content: 'Pivot completed',
      id: '003',
      isEditing: false,
      team: 'Parabol',
      updatedAt: 'Last Week'
    },
    {
      content: 'Pitch deck updated',
      id: '004',
      isEditing: false,
      team: 'Parabol',
      updatedAt: '5 Mins Ago'
    }
  ];

  const handleCheck = () =>
    console.log('UserActionList.handleCheck()');

  return (
    <div className={styles.root}>
      <div className={styles.block}>
        <UserActionListHeader />
        {actions.length === 0 ?
          <UserActionListEmpty /> :
          <div>
            {actions.map(item =>
              <UserActionListItem
                content={item.content}
                id={item.id}
                isEditing={item.isEditing}
                onChecked={handleCheck}
                team={item.team}
                updatedAt={item.updatedAt.toString()}
              />
            )}
            <div className={styles.hr}></div>
          </div>
        }
      </div>
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

  hr: {
    backgroundColor: ui.cardBorderColor,
    height: '1px',
    width: '100%'
  }
});

export default look(UserActionList);

// {actions.map(item => <div key={`action${item.id}`}>{item.content} - {item.updatedAt.toString()}</div>)}
