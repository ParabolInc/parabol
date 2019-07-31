import PropTypes from 'prop-types'
import React, {Component} from 'react'
import NullableTask from '../../components/NullableTask/NullableTask'
import {DragLayer as dragLayer} from 'react-dnd'
import {cardRaisedShadow} from '../../styles/elevation'

const layerStyles = {
  left: 0,
  maxWidth: '17.5rem',
  minHeight: '15rem',
  pointerEvents: 'none',
  position: 'fixed',
  top: 0,
  zIndex: 600
}

function getItemStyles (props) {
  const {currentOffset} = props
  if (!currentOffset) {
    return {
      display: 'none'
    }
  }
  const {x, y} = currentOffset
  const transform = `translate3d(${x}px, ${y}px, 0px)`

  return {
    ...layerStyles,
    minWidth: 256,
    transform,
    WebkitTransform: transform
  }
}

const collect = (monitor) => ({
  currentOffset: monitor.getSourceClientOffset()
})
const arePropsEqual = () => true

const cardDragStyle = {
  boxShadow: cardRaisedShadow
}

class TaskDragLayer extends Component {
  static propTypes = {
    currentOffset: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number
    })
  }
  shouldComponentUpdate (nextProps) {
    const {x, y} = this.props.currentOffset
    const {currentOffset} = nextProps
    return !currentOffset || x !== currentOffset.x || y !== currentOffset.y
  }
  render () {
    return (
      <div style={getItemStyles(this.props)}>
        <div style={cardDragStyle}>
          <NullableTask {...this.props} hasDragStyles isPreview />
        </div>
      </div>
    )
  }
}

export default dragLayer(collect, {arePropsEqual})(TaskDragLayer)
