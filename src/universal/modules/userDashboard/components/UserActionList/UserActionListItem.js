import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import {textOverflow} from 'universal/styles/helpers';
import OutcomeCardTextarea from 'universal/modules/outcomeCard/components/OutcomeCardTextarea/OutcomeCardTextarea';
import {Field} from 'redux-form';
import {ACTION} from 'universal/utils/constants';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';

const actionSource = {
  beginDrag(props) {
    return {
      id: props.actionId,
      sortOrder: props.sortOrder,
      dragAction: props.dragAction
    };
  }
};

const actionTarget = {
  hover(targetProps, monitor, component) {
    const {sortOrder: targetSortOrder, actionId: targetId} = targetProps;
    const sourceProps = monitor.getItem();
    const {dragAction, id: sourceId, sortOrder: sourceSortOrder} = sourceProps;
    if (sourceId === targetId) return;
    // make dragging a little nicer
    const targetBoundingRect = findDOMNode(component).getBoundingClientRect();
    const targetMiddleY = targetBoundingRect.top + targetBoundingRect.height / 2;
    const clientOffsetY = monitor.getClientOffset().y;
    if (sourceSortOrder > targetSortOrder && clientOffsetY > targetMiddleY) {
      return;
    }
    if (sourceSortOrder < targetSortOrder && clientOffsetY < targetMiddleY) {
      return;
    }
    dragAction(sourceId, sourceSortOrder, targetSortOrder, sourceProps);
  }
};


const UserActionListItem = (props) => {
  const {connectDragSource, connectDropTarget, isDragging, content, handleActionUpdate, handleChecked, handleSubmit, actionId, isActive, styles, team} = props;
  const checkboxStyles = css(styles.checkbox, isActive && styles.checkboxDisabled);
  const rootStyles = css(
    styles.root,
    isDragging && styles.dragging
  );
  return connectDropTarget(connectDragSource(
    <div className={rootStyles} key={`action${actionId}`}>
      <form>
        <Field
          className={checkboxStyles}
          component="input"
          disabled={isActive}
          name={`complete${actionId}`}
          onClick={handleChecked}
          type="checkbox"
        />
        <Field
          name={actionId}
          component={OutcomeCardTextarea}
          doFocus={!content}
          handleSubmit={handleSubmit(handleActionUpdate)}
          isActionListItem
        />
      </form>
      <div className={css(styles.team)}>{team}</div>
    </div>
  ));
};

UserActionListItem.propTypes = {
  actionId: PropTypes.string,
  content: PropTypes.string,
  dispatch: PropTypes.func,
  form: PropTypes.string,
  handleSubmit: PropTypes.func,
  handleActionUpdate: PropTypes.func,
  handleChecked: PropTypes.func,
  id: PropTypes.string,
  isActive: PropTypes.bool,
  onChecked: PropTypes.func,
  styles: PropTypes.object,
  team: PropTypes.string
};

const basePadding = '.375rem';
const labelHeight = '1.5rem';
const styleThunk = () => ({
  root: {
    borderTop: `1px solid ${ui.cardBorderColor}`,
    position: 'relative',
    width: '100%'
  },

  checkbox: {
    cursor: 'pointer',
    left: basePadding,
    position: 'absolute',
    top: '.4375rem',
    zIndex: 200
  },

  dragging: {
    opacity: 0,
  },

  checkboxDisabled: {
    cursor: 'not-allowed'
  },

  team: {
    ...textOverflow,
    bottom: 0,
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s1,
    fontWeight: 700,
    height: labelHeight,
    lineHeight: labelHeight,
    padding: `0 ${basePadding}`,
    position: 'absolute',
    right: 0,
    textAlign: 'right',
    width: '100%',
    zIndex: 200
  }
});

const dragSourceCb = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

const dropTargetCb = (connect) => ({
  connectDropTarget: connect.dropTarget()
});

export default DragSource(ACTION, actionSource, dragSourceCb)(
  DropTarget(ACTION, actionTarget, dropTargetCb)(
    withStyles(styleThunk)(
      UserActionListItem
    )
  )
);

