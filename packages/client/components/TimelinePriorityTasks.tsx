import {
  DragDropContext,
  Droppable,
  type DroppableProvided,
  type DropResult
} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {Whatshot} from '~/ui/icons'
import type {TimelinePriorityTasks_viewer$key} from '../__generated__/TimelinePriorityTasks_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useEventCallback from '../hooks/useEventCallback'
import UpdateTaskMutation from '../mutations/UpdateTaskMutation'
import {DroppableType} from '../types/constEnums'
import {ACTIVE, ACTIVE_TASK, SORT_STEP} from '../utils/constants'
import dndNoise from '../utils/dndNoise'
import NullableTask from './NullableTask/NullableTask'
import TimelineNoTasks from './TimelineNoTasks'

interface Props {
  viewer: TimelinePriorityTasks_viewer$key
}

const TimelinePriorityTasks = (props: Props) => {
  const {viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment TimelinePriorityTasks_viewer on User {
        tasks(first: 1000, userIds: $userIds) @connection(key: "UserColumnsContainer_tasks") {
          __typename
          edges {
            node {
              id
              content
              plaintextContent
              status
              sortOrder
              team {
                id
              }
              ...NullableTask_task
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {tasks} = viewer
  const atmosphere = useAtmosphere()
  const activeTasks = useMemo(() => {
    const {edges} = tasks
    const nodes = edges.map((edge) => edge.node)
    return nodes
      .filter((node) => node.status === ACTIVE)
      .sort((a, b) => (a.sortOrder < b.sortOrder ? 1 : -1))
    // try checking for length in case relay is screwing up & not invalidating (repro: sometimes cypress fails)
  }, [tasks, tasks.edges.length])

  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, destination, draggableId} = result
    if (!destination) return
    if (destination.index === source.index) return

    let sortOrder
    if (destination.index === 0) {
      sortOrder = dndNoise()
    } else if (destination.index === activeTasks.length) {
      sortOrder = activeTasks[activeTasks.length - 1]!.sortOrder - SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        ((activeTasks[destination.index + offset]?.sortOrder ?? 0) +
          (activeTasks[destination.index]?.sortOrder ?? 0)) /
          2 +
        dndNoise()
    }
    const updatedTask = {id: draggableId, sortOrder}
    UpdateTaskMutation(atmosphere, {updatedTask, area: 'userDash'}, {})
  })

  if (activeTasks.length === 0) return <TimelineNoTasks />
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={ACTIVE_TASK} type={DroppableType.TASK}>
        {(dropProvided: DroppableProvided) => (
          <div className='pt-2'>
            <div className='top-0 z-[2] py-4 font-semibold text-[14px] text-fg-secondary'>
              <Whatshot className='mr-1 h-[18px] w-[18px] align-bottom' />
              Active Tasks
            </div>
            <div className='w-full' {...dropProvided.droppableProps} ref={dropProvided.innerRef}>
              {activeTasks.map((task, idx) => (
                <NullableTask
                  key={task.id}
                  area='userDash'
                  task={task}
                  isDraggable
                  draggableIndex={idx}
                />
              ))}
              {dropProvided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default TimelinePriorityTasks
