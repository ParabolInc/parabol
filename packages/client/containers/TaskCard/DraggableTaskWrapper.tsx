import styled from '@emotion/styled'
import {Draggable, DraggableProvided, DraggableStateSnapshot} from 'react-beautiful-dnd'

const DraggableStyles = styled('div')({
  // sometimes the default blue fuzzies show up around the containing div
  outline: 'none',
  padding: `6px 12px`
})

interface Props {
  draggableId: string
  index: number
  children(
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot
  ): React.ReactElement<HTMLElement>
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
        >
          {children(dragProvided, dragSnapshot)}
        </DraggableStyles>
      )}
    </Draggable>
  )
}

export default DraggableTaskWrapper
