import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd'
import {createFragmentContainer} from 'react-relay'
import {AgendaList_agendaItems} from '~/__generated__/AgendaList_agendaItems.graphql'
import {AgendaList_meeting} from '~/__generated__/AgendaList_meeting.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useEventCallback from '../../../../hooks/useEventCallback'
import useGotoStageId from '../../../../hooks/useGotoStageId'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import {navItemRaised} from '../../../../styles/elevation'
import {AGENDA_ITEM, SORT_STEP} from '../../../../utils/constants'
import dndNoise from '../../../../utils/dndNoise'
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
  agendaItems: AgendaList_agendaItems
  dashSearch?: string
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  meeting: AgendaList_meeting | null
}

const AgendaList = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {agendaItems, meeting, dashSearch, gotoStageId} = props
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

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationItem.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === agendaItems.length - 1) {
      sortOrder = destinationItem.sortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (agendaItems[destination.index + offset]!.sortOrder + destinationItem.sortOrder) / 2 +
        dndNoise()
    }
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

export default createFragmentContainer(AgendaList, {
  meeting: graphql`
    fragment AgendaList_meeting on ActionMeeting {
      id
      endedAt
      ...AgendaItem_meeting
    }
  `,
  agendaItems: graphql`
    fragment AgendaList_agendaItems on AgendaItem @relay(plural: true) {
      id
      content
      sortOrder
      ...AgendaItem_agendaItem
    }
  `
})
