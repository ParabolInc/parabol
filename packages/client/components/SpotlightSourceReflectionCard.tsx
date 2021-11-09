import styled from '@emotion/styled'
import React, {RefObject} from 'react'
import {ElementHeight} from '../types/constEnums'
import {GroupingKanbanColumn_meeting$data} from '../__generated__/GroupingKanbanColumn_meeting.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const Source = styled('div')({
  minHeight: ElementHeight.REFLECTION_CARD
})

interface Props {
  meeting: GroupingKanbanColumn_meeting$data
  ref: RefObject<HTMLDivElement>
  modalRef: RefObject<HTMLDivElement>
  reflectionIdsToHideRef: RefObject<string[]>
}

const SpotlightSourceReflectionCard = (props: Props) => {
  const {meeting, ref, modalRef, reflectionIdsToHideRef} = props

  return (
    <Source ref={ref}>
      {meeting.spotlightGroup && (
        <ReflectionGroup
          phaseRef={modalRef}
          reflectionGroup={meeting.spotlightGroup}
          meeting={meeting}
          reflectionIdsToHide={reflectionIdsToHideRef.current}
        />
      )}
    </Source>
  )
}

export default SpotlightSourceReflectionCard
