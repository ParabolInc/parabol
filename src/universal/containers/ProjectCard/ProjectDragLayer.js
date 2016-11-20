import React, {Component, PropTypes} from 'react';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {DragLayer as dragLayer} from 'react-dnd';
import appTheme from 'universal/styles/theme/appTheme';

const dragStyle = {
  backgroundColor: appTheme.palette.light10l,
  borderColor: appTheme.palette.mid70l,
  borderRadius: '.25rem',
  boxShadow: '0 1px 2px rgba(0, 0, 0, .15)'
};

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
  const {currentOffset} = props;
  if (!currentOffset) {
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

const collect = (monitor) => ({
  currentOffset: monitor.getSourceClientOffset(),
});
const arePropsEqual = (a) => true;

@dragLayer(collect, {arePropsEqual})
export default class ProjectDragLayer extends Component {
  shouldComponentUpdate(nextProps) {
    const {x, y} = this.props.currentOffset;
    const {currentOffset} = nextProps;
    return !currentOffset || x !== currentOffset.x || y !== currentOffset.y;
  }
  render() {
    return (
      <div style={getItemStyles(this.props)}>
        <div style={dragStyle}>
          <OutcomeOrNullCard {...this.props} isPreview/>
        </div>
      </div>
    );
  }
}
