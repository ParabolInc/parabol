import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import ui from 'universal/styles/ui';
import {cardBorderTop} from 'universal/styles/helpers';
import UserActionListEmpty from './UserActionListEmpty';
import UserActionListHeader from './UserActionListHeader';
import UserActionListItemContainer from 'universal/modules/userDashboard/containers/UserActionListItem/UserActionListItemContainer';
import UserActionListTeamSelect from './UserActionListTeamSelect';
import {selectNewActionTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';
import shortid from 'shortid';
import {SORT_STEP} from 'universal/utils/constants';
import {cashay} from 'cashay';
const UserActionList = (props) => {
  const {styles} = UserActionList;

  // TODO: get the real actions array here:
  // const {actions, isAdding} = props;
  const {actions, dispatch, selectingNewActionTeam, teams, userId} = props;
  const actionCount = actions.length;
  const createNewAction = () => {
    if (teams.length > 1) {
      dispatch(selectNewActionTeam(true));
    } else {
      const teamId = teams[0] && teams[0].id;
      const options = {
        variables: {
          newAction: {
            id: `${teamId}::${shortid.generate()}`,
            teamMemberId: `${userId}::${teamId}`,
            sortOrder: actionCount + SORT_STEP
          }
        }
      };
      cashay.mutate('createAction', options);
    }
  };

  const handleCheck = () =>
    // TODO: item is set to [hidden for data insights?] —pop a toast to undo? (TA)
    console.log('UserActionList.handleCheck()');
  return (
    <div className={styles.root}>
      <div className={styles.block}>
        {selectingNewActionTeam ?
          <UserActionListTeamSelect dispatch={dispatch} teams={teams} actionCount={actionCount} userId={userId}/> :
          <UserActionListHeader onAddNewAction={createNewAction}/>
        }
        {actionCount ?
          <div className={styles.actions}>
            {actions.map(item =>
              <UserActionListItemContainer
                key={`actionItem::${item.id}`}
                content={item.content}
                form={`actionItem::${item.id}`}
                actionId={item.id}
                onChecked={handleCheck}
                team={item.team.name}
              />
            )}
            <div className={styles.hr}></div>
          </div> :
          <div>{!selectingNewActionTeam && <UserActionListEmpty />}</div>
        }
      </div>
    </div>
  );
};

UserActionList.propTypes = {
  actions: PropTypes.array,
  selectingNewActionTeam: PropTypes.bool
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
