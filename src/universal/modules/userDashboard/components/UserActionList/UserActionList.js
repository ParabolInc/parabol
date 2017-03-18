import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {cardBorderTop, overflowTouch} from 'universal/styles/helpers';
import UserActionListEmpty from './UserActionListEmpty';
import UserActionListHeader from './UserActionListHeader';
import UserActionListItemContainer from 'universal/modules/userDashboard/containers/UserActionListItem/UserActionListItemContainer';
import UserActionListTeamSelect from './UserActionListTeamSelect';
import {selectNewActionTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';
import shortid from 'shortid';
import {cashay} from 'cashay';
import getNextSortOrder from 'universal/utils/getNextSortOrder';
import {DropTarget as dropTarget} from 'react-dnd';
import {ACTION} from 'universal/utils/constants';
import handleActionHover from 'universal/dnd/handleActionHover';
import withDragState from 'universal/dnd/withDragState';
import handleDrop from 'universal/dnd/handleDrop';

const columnTarget = {
  drop: handleDrop,
  hover: handleActionHover
};

const UserActionList = (props) => {
  const {actions, connectDropTarget, dispatch, dragState, selectingNewActionTeam, styles, teams, userId} = props;
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
            sortOrder: getNextSortOrder(actions)
          }
        }
      };
      cashay.mutate('createAction', options);
    }
  };
  const parentStyles = css(
    styles.root,
    styles.block,
    styles.actionsBlock,
    styles.actions
  );
  dragState.clear();
  return connectDropTarget(
    <div className={css(styles.root)}>
      <div className={css(styles.block)}>
        <div className={css(styles.headerBlock)}>
          {selectingNewActionTeam ?
            <UserActionListTeamSelect
              actions={actions}
              dispatch={dispatch}
              teams={teams}
              userId={userId}
            /> :
            <UserActionListHeader onAddNewAction={createNewAction} />
          }
        </div>
        {actionCount ?
          <div className={css(styles.actionsBlock)}>
            <div className={css(styles.actions)}>
              {actions.map((action) =>
                <UserActionListItemContainer
                  key={`actionItem::${action.id}`}
                  actionId={action.id}
                  content={action.content}
                  form={`actionItem::${action.id}`}
                  parentStyles={parentStyles}
                  sortOrder={action.sortOrder}
                  ref={(c) => {
                    if (c) {
                      dragState.components.push(c);
                    }
                  }}
                  team={action.team.name}
                />
              )}
              <div className={css(styles.hr)} />
            </div>
            :
          </div> :
          <div className={css(styles.emptyBlock)}>{!selectingNewActionTeam && <UserActionListEmpty />}</div>
        }
      </div>
    </div>
  );
};

UserActionList.propTypes = {
  actions: PropTypes.array,
  dispatch: PropTypes.func,
  dragAction: PropTypes.func,
  selectingNewActionTeam: PropTypes.bool,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    padding: `0 ${ui.dashGutter}`,
    position: 'relative',
    width: ui.dashActionsWidth
  },

  block: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    width: '100%'
  },

  headerBlock: {
    backgroundColor: ui.actionCardBgColor,
    borderColor: ui.cardBorderColor,
    borderStyle: 'solid',
    borderWidth: '0 1px',
    borderRadius: `${ui.cardBorderRadius} ${ui.cardBorderRadius} 0 0`,
    paddingTop: '.25rem',
    width: '100%',

    '::after': {
      ...cardBorderTop,
      left: '0',
      right: '0',
      top: '0'
    },
  },

  actionsBlock: {
    flex: 1,
    position: 'relative'
  },

  actions: {
    ...overflowTouch,
    backgroundColor: ui.actionCardBgColor,
    borderColor: ui.cardBorderColor,
    borderRadius: `0 0 ${ui.cardBorderRadius} ${ui.cardBorderRadius}`,
    borderStyle: 'solid',
    borderWidth: '0 1px 1px',
    boxShadow: `inset 0 1px 0 ${ui.cardBorderColor}`,
    maxHeight: '100%',
    // @terry this is required for no scroll bars, but conflicts with overflowTouch
    // @matt this block is scrollable when it reaches the maxHeight of the container (based on viewport height)
    // overflow: 'hidden',
    padding: '0 0 .5rem',
    position: 'absolute',
    width: '100%'
  },

  hr: {
    backgroundColor: ui.cardBorderColor,
    height: '1px',
    width: '100%'
  },

  emptyBlock: {
    backgroundColor: ui.actionCardBgColor,
    borderColor: ui.cardBorderColor,
    borderRadius: `0 0 ${ui.cardBorderRadius} ${ui.cardBorderRadius}`,
    borderStyle: 'solid',
    borderWidth: '0 1px 1px'
  }
});

const dropTargetCb = (connectTarget) => ({
  connectDropTarget: connectTarget.dropTarget()
});

export default withDragState(
  dropTarget(ACTION, columnTarget, dropTargetCb)(
    withStyles(styleThunk)(UserActionList)
  )
);
