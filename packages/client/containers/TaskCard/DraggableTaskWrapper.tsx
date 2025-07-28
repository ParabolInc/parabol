import styled from '@emotion/styled'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from 'react-beautiful-dnd'
import {Elevation} from '../../styles/elevation'

const DraggableStyles = styled('div')(({isDragging}: {isDragging: boolean}) => ({
  // sometimes the default blue fuzzies show up around the containing div
  outline: 'none',
  padding: `6px 12px`,
  // apply the dragging shadow here so we don't need to pass the dragging state down
  '& > *': {
    boxShadow: isDragging ? Elevation.CARD_DRAGGING : undefined
  }
}))

interface Props {
  draggableId: string
  index: number
  children?: React.ReactNode
}

const DraggableTaskWrapper = (props: Props) => {
  const {draggableId, index, children} = props
  return (
    <Draggable draggableId={draggableId} index={index} disableInteractiveElementBlocking={false}>
      {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
        <DraggableStyles
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
          isDragging={!!dragSnapshot.draggingOver}
        >
          {children}
        </DraggableStyles>
      )}
    </Draggable>
  )
}

export default DraggableTaskWrapper
