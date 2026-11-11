import {Draggable, type DraggableProvided, type DraggableStateSnapshot} from '@hello-pangea/dnd'
import isTempId from '../../utils/relay/isTempId'

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
    <Draggable
      draggableId={draggableId}
      index={index}
      isDragDisabled={isTempId(draggableId)}
      disableInteractiveElementBlocking={false}
    >
      {(dragProvided: DraggableProvided, dragSnapshot: DraggableStateSnapshot) => (
        <div
          className='px-3 py-1.5 outline-none'
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          {...dragProvided.dragHandleProps}
        >
          {children(dragProvided, dragSnapshot)}
        </div>
      )}
    </Draggable>
  )
}

export default DraggableTaskWrapper
