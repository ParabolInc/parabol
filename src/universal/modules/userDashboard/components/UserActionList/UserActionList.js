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

// const actionSource = {
//   beginDrag(props) {
//     return {
//       id: props.id,
//       index: props.index
//     };
//   }
// };
//
// const actionTarget = {
//   hover(props, monitor) {
//     return;
//     const {id: sourceId, index: sourceIndex, dragAction} = monitor.getItem();
//     // if (inTargetProps.notes.length > 0 || targetLaneId === sourceLaneId) {
//     //   return;
//     // }
//     dragAction({
//       sourceIndex,
//       targetIndex: props.index,
//     });
//   }
// };


// const actionTarget = {
//   hover(props, monitor, component) {
//     const {index: dragIdx} = monitor.getItem();
//     const {index: hoverIdx} = props;
//     if (dragIdx === hoverIdx) return;
//     // Determine rectangle on screen
//     const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
//
//     // Get vertical middle
//     const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
//
//     // Determine mouse position
//     const clientOffset = monitor.getClientOffset();
//
//     // Get pixels to the top
//     const hoverClientY = clientOffset.y - hoverBoundingRect.top;
//
//     // Only perform the move when the mouse has crossed half of the items height
//     // When dragging downwards, only move when the cursor is below 50%
//     // When dragging upwards, only move when the cursor is above 50%
//
//     // Dragging downwards
//     if (dragIdx < hoverIdx && hoverClientY < hoverMiddleY) {
//       return;
//     }
//
//     // Dragging upwards
//     if (dragIdx > hoverIdx && hoverClientY > hoverMiddleY) {
//       return;
//     }
//
//     // Time to actually perform the action
//     props.moveCard(dragIdx, hoverIdx);
//
//     // Note: we're mutating the monitor item here!
//     // Generally it's better to avoid mutations,
//     // but it's good here for the sake of performance
//     // to avoid expensive index searches.
//     monitor.getItem().index = hoverIdx;
//     // onMove({
//     //   sourceId,
//     //   sourceIndex,
//     //   targetIndex: 0,
//     //   monitor
//     // });
//   }
// };

const UserActionList = (props) => {
  const {actions, dispatch, dragAction, selectingNewActionTeam, styles, teams, userId} = props;
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
            sortOrder: getNextSortOrder(actions, 'sortOrder')
          }
        }
      };
      cashay.mutate('createAction', options);
    }
  };

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.block)}>
        <div className={css(styles.headerBlock)}>
          {selectingNewActionTeam ?
            <UserActionListTeamSelect actions={actions} dispatch={dispatch} teams={teams} actionCount={actionCount} userId={userId}/> :
            <UserActionListHeader onAddNewAction={createNewAction}/>
          }
        </div>
        {actionCount ?
          <div className={css(styles.actionsBlock)}>
            <div className={css(styles.actions)}>
              {actions.map(action =>
                <UserActionListItemContainer
                  key={`actionItem::${action.id}`}
                  actionId={action.id}
                  content={action.content}
                  dragAction={dragAction}
                  form={`actionItem::${action.id}`}
                  sortOrder={action.sortOrder}
                  team={action.team.name}
                />
              )}
              <div className={css(styles.hr)}></div>
            </div> :
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
    width: '100%'
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

const connectCb = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

export default
  withStyles(styleThunk)(
    UserActionList
);
