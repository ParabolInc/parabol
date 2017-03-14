import React, {Component, PropTypes} from 'react';
import UserActionListItem from './UserActionListItem';
import {DragLayer as dragLayer} from 'react-dnd';
import ui from 'universal/styles/ui';

const layerStyles = {
  left: 0,
  minHeight: '15rem',
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: '12.875rem',
  zIndex: ui.zActionItem,
};

function getItemStyles(props) {
  const {initialOffset, currentOffset} = props;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }
  const {x, y} = currentOffset;
  const transform = `translate3d(${x}px, ${y}px, 0px)`;
  return {
    ...layerStyles,
    transform,
    WebkitTransform: transform
  };
}

@dragLayer((monitor) => ({
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
        <div className={this.props.parentStyles} style={ui.cardDragStyle}>
          <UserActionListItem {...this.props} isPreview isDragging={false} />
        </div>
      </div>
    );
  }
}
