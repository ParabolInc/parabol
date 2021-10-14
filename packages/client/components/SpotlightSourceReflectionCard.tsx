import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ElementHeight, ElementWidth, Spotlight, ZIndex} from '../types/constEnums'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import {SpotlightSourceReflectionCard_meeting$key} from '~/__generated__/SpotlightSourceReflectionCard_meeting.graphql'

const ReflectionWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: `calc(${Spotlight.SELECTED_HEIGHT_PERC / 2}% - ${ElementHeight.REFLECTION_CARD / 2}px)`,
  left: `calc(50% - ${ElementWidth.REFLECTION_CARD / 2}px)`,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT_LOCAL
})

interface Props {
  meeting: SpotlightSourceReflectionCard_meeting$key
  flipRef: (instance: HTMLDivElement) => void
}

const SpotlightSourceReflectionCard = (props: Props) => {
  const {flipRef} = props
  const meetingData = useFragment(
    graphql`
      fragment SpotlightSourceReflectionCard_meeting on RetrospectiveMeeting {
        ...DraggableReflectionCard_meeting
        spotlightReflection {
          ...DraggableReflectionCard_reflection
        }
      }
    `,
    props.meeting
  )
  const {spotlightReflection} = meetingData

  return (
      <ReflectionWrapper ref={flipRef}>
      {spotlightReflection && (
        <DraggableReflectionCard
          isDraggable
          reflection={spotlightReflection}
          meeting={meetingData}
          staticReflections={null}
        />
      )}
    </ReflectionWrapper>
  )
}

export default SpotlightSourceReflectionCard
