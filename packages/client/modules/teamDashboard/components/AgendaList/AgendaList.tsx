import {AgendaList_team} from '../../../../__generated__/AgendaList_team.graphql'
import React, {useMemo} from 'react'
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd'
// import SexyScrollbar from 'universal/components/Dashboard/SexyScrollbar'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import AgendaItem from '../AgendaItem/AgendaItem'
import AgendaListEmptyState from './AgendaListEmptyState'
import UpdateAgendaItemMutation from '../../../../mutations/UpdateAgendaItemMutation'
import {navItemRaised} from '../../../../styles/elevation'
import {AGENDA_ITEM, SORT_STEP} from '../../../../utils/constants'
import dndNoise from '../../../../utils/dndNoise'
import useEventCallback from '../../../../hooks/useEventCallback'
import useGotoStageId from '../../../../hooks/useGotoStageId'

const AgendaListRoot = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  // react-beautiful-dnd supports scrolling on 1 parent
  // this is where we need it, in order to scroll a long list
  overflow: 'auto',
  paddingRight: 8,
  height: '100%', // trickle down height for overflow
  width: '100%'
})

const DraggableAgendaItem = styled('div')<{isDragging: boolean}>(({isDragging}) => ({
  borderRadius: '0 4px 4px 0',
  boxShadow: isDragging ? navItemRaised : undefined
}))

interface Props {
  dashSearch?: string
  gotoStageId: ReturnType<typeof useGotoStageId> | undefined
  meetingId?: string | null
  team: AgendaList_team
}

const AgendaList = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {dashSearch, gotoStageId, meetingId, team} = props
  const {activeMeetings, agendaItems} = team
  const filteredAgendaItems = useMemo(() => {
    return dashSearch ? agendaItems.filter(({content}) => content.match(dashSearch)) : agendaItems
  }, [dashSearch, agendaItems])

  const onDragEnd = useEventCallback((result) => {
    const {source, destination} = result
    if (
      !destination ||
      destination.droppableId !== AGENDA_ITEM ||
      source.droppableId !== AGENDA_ITEM ||
      destination.index === source.index
    ) {
      return
    }
    const sourceItem = agendaItems[source.index]
    const destinationItem = agendaItems[destination.index]

    let sortOrder
    if (destination.index === 0) {
      sortOrder = destinationItem.sortOrder - SORT_STEP + dndNoise()
    } else if (destination.index === agendaItems.length - 1) {
      sortOrder = destinationItem.sortOrder + SORT_STEP + dndNoise()
    } else {
      const offset = source.index > destination.index ? -1 : 1
      sortOrder =
        (agendaItems[destination.index + offset].sortOrder + destinationItem.sortOrder) / 2 +
        dndNoise()
    }
    UpdateAgendaItemMutation(
      atmosphere,
      {updatedAgendaItem: {id: sourceItem.id, sortOrder}},
      {meetingId}
    )
  })

  if (filteredAgendaItems.length === 0) {
    return <AgendaListEmptyState isDashboard={!meetingId} />
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={AGENDA_ITEM}>
        {(provided) => {
          return (
            <AgendaListRoot ref={provided.innerRef}>
              {filteredAgendaItems.map((item, idx) => {
                return (
                  <Draggable key={item.id} draggableId={item.id} index={idx}>
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
                            idx={agendaItems.findIndex((agendaItem) => agendaItem === item)}
                            isDragging={dragSnapshot.isDragging}
                            activeMeetings={activeMeetings}
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
  team: graphql`
    fragment AgendaList_team on Team {
      agendaItems {
        id
        content
        # need this for the DnD
        sortOrder
        ...AgendaItem_agendaItem
      }
      activeMeetings {
        ...AgendaItem_activeMeetings
        id
      }
    }
  `
})

// <SexyScrollbar color='rgba(0, 0, 0, 0.3)' activeColor='rgba(0, 0, 0, 0.5)'>
//  {(scrollRef) => {
//    return (
//      <div ref={scrollRef}>
//        {/* wrap filteredAgendaItems here */}
//      </div>
//    )
//  }}
// </SexyScrollbar>
