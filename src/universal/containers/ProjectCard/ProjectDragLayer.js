import React, {Component, PropTypes} from 'react';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {DragLayer as dragLayer} from 'react-dnd';
import appTheme from 'universal/styles/theme/appTheme';

const layerStyles = {
  left: 0,
  minHeight: '15rem',
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  width: '12.875rem',
  zIndex: 1000000,
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

@dragLayer(monitor => ({
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
}))
export default class ProjectDragLayer extends Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    parentStyles: PropTypes.string
  };

  render() {
    const {isDragging} = this.props;
    if (!isDragging) {
      // return null;
    }
    const dragStyle = {
      backgroundColor: appTheme.palette.light10l,
      borderColor: appTheme.palette.mid70l,
      borderRadius: '.25rem',
      boxShadow: '0 1px 2px rgba(0, 0, 0, .15)'
    };
    return (
      <div style={getItemStyles(this.props)}>
        <div className={this.props.parentStyles} style={dragStyle}>
          <OutcomeOrNullCard {...this.props} isPreview isDragging={false}/>
        </div>
      </div>
    );
  }
}
