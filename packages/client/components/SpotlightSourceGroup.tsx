import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {RefObject} from 'react'
import {useFragment} from 'react-relay'
import {SpotlightSourceGroup_meeting$key} from '../__generated__/SpotlightSourceGroup_meeting.graphql'
import {ElementHeight} from '../types/constEnums'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const Source = styled('div')({
  minHeight: ElementHeight.REFLECTION_CARD
})

interface Props {
  meetingRef: SpotlightSourceGroup_meeting$key
  sourceRef: RefObject<HTMLDivElement>
  modalRef: RefObject<HTMLDivElement>
  reflectionIdsToHideRef: RefObject<string[]>
}

const SpotlightSourceGroup = (props: Props) => {
  const {meetingRef, sourceRef, modalRef, reflectionIdsToHideRef} = props
  const meeting = useFragment(
    graphql`
      fragment SpotlightSourceGroup_meeting on RetrospectiveMeeting {
        spotlightGroup {
          ...ReflectionGroup_reflectionGroup
        }
        ...ReflectionGroup_meeting
      }
    `,
    meetingRef
  )
  const {spotlightGroup} = meeting

  return (
    <Source ref={sourceRef}>
      {spotlightGroup && (
        <ReflectionGroup
          phaseRef={modalRef}
          reflectionGroupRef={spotlightGroup}
          meetingRef={meeting}
          reflectionIdsToHide={reflectionIdsToHideRef.current}
        />
      )}
    </Source>
  )
}

export default SpotlightSourceGroup
