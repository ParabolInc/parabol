import React, {Component, PropTypes} from 'react';
import UserActionListItem from './UserActionListItem';
import {DragLayer as dragLayer} from 'react-dnd';
import ui from 'universal/styles/ui';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 500,
  left: 0,
  top: 0,
  width: ui.dashActionsWidth,
  minHeight: '15rem',
};

function getItemStyles(props) {
  const {initialOffset, currentOffset} = props;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }

  const {x, y} = currentOffset;
  const transform = `translate3d(${x}px, ${y}px, 0px) rotate(-7deg)`;
  return {
    ...layerStyles,
    transform,
    WebkitTransform: transform
  };
}

@dragLayer(monitor => ({
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
}))
export default class ActionDragLayer extends Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    parentStyles: PropTypes.string
  };

  render() {
    const {isDragging} = this.props;
    if (!isDragging) {
      return null;
    }
    return (
      <div style={getItemStyles(this.props)}>
        <div className={this.props.parentStyles}>
          <UserActionListItem {...this.props} isPreview isDragging={false}/>
        </div>
      </div>
    );
  }
}
