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
  width: 'calc((100vw - 40.125rem) / 4)',
  zIndex: ui.zCard
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
          <OutcomeOrNullCard {...this.props} isPreview/>
        </div>
      </div>
    );
  }
}
