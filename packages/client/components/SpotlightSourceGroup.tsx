import styled from '@emotion/styled'
import React, {RefObject} from 'react'
import {ElementHeight} from '../types/constEnums'
import {GroupingKanban_meeting$data} from '../__generated__/GroupingKanban_meeting.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const Source = styled('div')({
  minHeight: ElementHeight.REFLECTION_CARD
})

interface Props {
  meeting: GroupingKanban_meeting$data
  sourceRef: RefObject<HTMLDivElement>
  modalRef: RefObject<HTMLDivElement>
  reflectionIdsToHideRef: RefObject<string[]>
}

const SpotlightSourceGroup = (props: Props) => {
  const {meeting, sourceRef, modalRef, reflectionIdsToHideRef} = props
  const {spotlightGroup} = meeting

  return (
    <Source ref={sourceRef}>
      {spotlightGroup && (
        <ReflectionGroup
          phaseRef={modalRef}
          reflectionGroup={spotlightGroup}
          meeting={meeting}
          reflectionIdsToHide={reflectionIdsToHideRef.current}
        />
      )}
    </Source>
  )
}

export default SpotlightSourceGroup
