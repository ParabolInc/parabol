import React, {Component, PropTypes} from 'react';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import {DragLayer as dragLayer} from 'react-dnd';
import ui from 'universal/styles/ui';

const layerStyles = {
  left: 0,
  maxWidth: ui.cardMaxWidth,
  minHeight: '15rem',
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  zIndex: ui.zCard
};

function getItemStyles(props) {
  const {area, currentOffset} = props;
  if (!currentOffset) {
    return {
      display: 'none'
    };
  }
  const {x, y} = currentOffset;
  const transform = `translate3d(${x}px, ${y}px, 0px)`;
  // NOTE: Widths are calculated based on the results of UI constants, but yeah, manual (TA)
  const dashMinWidth = '9.9375rem';
  const meetingMinWidth = '12.4375rem';
  const minWidth = area === 'meeting' ? meetingMinWidth : dashMinWidth;
  const dashWidth = 'calc((100vw - 39.375rem) / 4)';
  const meetingWidth = 'calc((100vw - 25.25rem) / 4)';
  const width = area === 'meeting' ? meetingWidth : dashWidth;
  return {
    ...layerStyles,
    minWidth,
    transform,
    WebkitTransform: transform,
    width
  };
}

const collect = (monitor) => ({
  currentOffset: monitor.getSourceClientOffset(),
});
const arePropsEqual = () => true;

@dragLayer(collect, {arePropsEqual})
export default class ProjectDragLayer extends Component {
  static propTypes = {
    currentOffset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  };
  shouldComponentUpdate(nextProps) {
    const {x, y} = this.props.currentOffset;
    const {currentOffset} = nextProps;
    return !currentOffset || x !== currentOffset.x || y !== currentOffset.y;
  }
  render() {
    return (
      <div style={getItemStyles(this.props)}>
        <div style={ui.cardDragStyle}>
          <OutcomeOrNullCard {...this.props} isPreview />
        </div>
      </div>
    );
  }
}
