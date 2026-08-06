import graphql from 'babel-plugin-relay/macro'
import type {RefObject} from 'react'
import {useFragment} from 'react-relay'
import type {SpotlightSourceGroup_meeting$key} from '../__generated__/SpotlightSourceGroup_meeting.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

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
    <div className='min-h-11' ref={sourceRef}>
      {spotlightGroup && (
        <ReflectionGroup
          phaseRef={modalRef}
          reflectionGroupRef={spotlightGroup}
          meetingRef={meeting}
          reflectionIdsToHide={reflectionIdsToHideRef.current}
        />
      )}
    </div>
  )
}

export default SpotlightSourceGroup
