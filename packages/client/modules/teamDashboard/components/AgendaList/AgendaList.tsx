import {DragDropContext, Draggable, Droppable, type DropResult} from '@hello-pangea/dnd'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {AgendaList_agendaItems$key} from '~/__generated__/AgendaList_agendaItems.graphql'
import type {AgendaList_meeting$key} from '~/__generated__/AgendaList_meeting.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEventCallback from '../../../../hooks/useEventCallback'
import type useGotoStageId from '../../../../hooks/useGotoStageId'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import {getSortOrder} from '../../../../shared/sortOrder'
import {cn} from '../../../../ui/cn'
import {AGENDA_ITEM} from '../../../../utils/constants'
import AgendaItem from '../AgendaItem/AgendaItem'
import AgendaListEmptyState from './AgendaListEmptyState'

interface Props {
  agendaItems: AgendaList_agendaItems$key
  dashSearch?: string
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  meeting: AgendaList_meeting$key | null | undefined
}

const AgendaList = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {agendaItems: agendaItemsRef, meeting: meetingRef, dashSearch, gotoStageId} = props
  const meeting = useFragment(
    graphql`
      fragment AgendaList_meeting on ActionMeeting {
        id
        endedAt
        ...AgendaItem_meeting
      }
    `,
    meetingRef
  )
  const agendaItems = useFragment(
    graphql`
      fragment AgendaList_agendaItems on AgendaItem @relay(plural: true) {
        id
        content
        sortOrder
        ...AgendaItem_agendaItem
      }
    `,
    agendaItemsRef
  )
  const meetingId = meeting?.id
  const endedAt = meeting?.endedAt
  const filteredAgendaItems = useMemo(() => {
    return dashSearch
      ? agendaItems.filter(({content}) => content && content.match(dashSearch))
      : agendaItems.filter(({content}) => content)
  }, [dashSearch, agendaItems])

  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, destination} = result
    if (!destination) return
    const destinationItem = agendaItems[destination.index]
    const sourceItem = agendaItems[source.index]
    if (
      destination.droppableId !== AGENDA_ITEM ||
      source.droppableId !== AGENDA_ITEM ||
      destination.index === source.index ||
      !destinationItem ||
      !sourceItem
    ) {
      return
    }

    const sortOrder = getSortOrder(agendaItems, source.index, destination.index)
    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: sourceItem.id, sortOrder}},
      {meetingId}
    )
  })

  if (!filteredAgendaItems || filteredAgendaItems.length === 0) {
    return <AgendaListEmptyState isComplete={!!endedAt} isMeeting={!!meeting} />
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={AGENDA_ITEM}>
        {(provided) => {
          return (
            <div
              ref={provided.innerRef}
              className={cn('flex h-full w-full flex-col pr-2', !meeting && 'overflow-auto')}
            >
              {filteredAgendaItems.map((item, idx) => {
                return (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={idx}
                    isDragDisabled={!!endedAt}
                  >
                    {(dragProvided, dragSnapshot) => {
                      return (
                        <div
                          className={cn(
                            'rounded-[0_4px_4px_0]',
                            dragSnapshot.isDragging && 'shadow-[var(--shadow-card-dragging)]'
                          )}
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                        >
                          <AgendaItem
                            key={item.id}
                            agendaItem={item}
                            gotoStageId={gotoStageId}
                            isDragging={dragSnapshot.isDragging}
                            meeting={meeting}
                          />
                        </div>
                      )
                    }}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )
        }}
      </Droppable>
    </DragDropContext>
  )
}

export default AgendaList
