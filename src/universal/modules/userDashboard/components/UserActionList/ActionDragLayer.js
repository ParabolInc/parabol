import React, {Component, PropTypes} from 'react';
import UserActionListItem from './UserActionListItem';
import {DragLayer as dragLayer} from 'react-dnd';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';

const layerStyles = {
  left: 0,
  minHeight: '15rem',
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: ui.dashActionsWidth,
  zIndex: 500,
};

function getItemStyles(props) {
  const {initialOffset, currentOffset} = props;
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none'
    };
  }

  const {x, y} = currentOffset;
  // const transform = `translate3d(${x}px, ${y}px, 0px) rotate(-7deg)`;
  const transform = `translate3d(${x}px, ${y}px, 0px) scale(1.05)`;
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
    const dragStyle = {
      borderColor: appTheme.palette.mid50l,
      borderRadius: '.25rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, .15)'
    };
    return (
      <div style={getItemStyles(this.props)}>
        <div className={this.props.parentStyles} style={dragStyle}>
          <UserActionListItem {...this.props} isPreview isDragging={false}/>
        </div>
      </div>
    );
  }
}
