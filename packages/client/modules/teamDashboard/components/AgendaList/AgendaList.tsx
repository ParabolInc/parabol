import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import {AgendaList_agendaItems$key} from '~/__generated__/AgendaList_agendaItems.graphql'
import {AgendaList_meeting$key} from '~/__generated__/AgendaList_meeting.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEventCallback from '../../../../hooks/useEventCallback'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import {getSortOrder} from '../../../../shared/sortOrder'
import {navItemRaised} from '../../../../styles/elevation'
import {AGENDA_ITEM} from '../../../../utils/constants'
import AgendaItem from '../AgendaItem/AgendaItem'
import AgendaListEmptyState from './AgendaListEmptyState'

const AgendaListRoot = styled('div')<{isMeeting: boolean}>(({isMeeting}) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: isMeeting ? undefined : 'auto',
  paddingRight: 8,
  height: '100%', // trickle down height for overflow
  width: '100%'
}))

const DraggableAgendaItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  borderRadius: '0 4px 4px 0',
  boxShadow: isDragging ? navItemRaised : undefined
}))

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
            <AgendaListRoot ref={provided.innerRef} isMeeting={!!meeting}>
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
                        <DraggableAgendaItem
                          isDragging={dragSnapshot.isDragging}
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
                        </DraggableAgendaItem>
                      )
                    }}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </AgendaListRoot>
          )
        }}
      </Droppable>
    </DragDropContext>
  )
}

export default AgendaList
