import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
  // TODO: Robots, please substract chrome box values, kthxbai (TA)
  const calcWidth = (value) => `calc((100vw - ${value}) / 4)`;
  const widthValues = {
    meeting: {
      minWidth: '12.40625rem',
      width: calcWidth('25.375rem')
    },
    teamDash: {
      minWidth: '10.125rem',
      width: calcWidth('38.3125rem')
    },
    userDash: {
      minWidth: '13.90625rem',
      width: calcWidth('23.375rem')
    }
  };

  return {
    ...layerStyles,
    minWidth: widthValues[area].minWidth,
    transform,
    WebkitTransform: transform,
    width: widthValues[area].width
  };
}

const collect = (monitor) => ({
  currentOffset: monitor.getSourceClientOffset()
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
