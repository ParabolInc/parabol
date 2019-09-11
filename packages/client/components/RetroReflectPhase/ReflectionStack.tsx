import {PhaseItemColumn_meeting} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import React, {RefObject, useRef} from 'react'
import styled from '@emotion/styled'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from './ExpandedReflectionStack'
import ReflectionStackPlaceholder from './ReflectionStackPlaceholder'
import {cardBackgroundColor, cardBorderRadius} from '../../styles/cards'
import {cardShadow} from '../../styles/elevation'
import {ElementHeight, ElementWidth, ReflectionStackPerspective, Times} from '../../types/constEnums'
import useExpandedReflections from '../../hooks/useExpandedReflections'

interface Props {
  idx: number
  meetingId: string
  phaseEditorRef: React.RefObject<HTMLDivElement>
  phaseRef: React.RefObject<HTMLDivElement>
  readOnly: boolean
  reflectionStack: readonly PhaseItemColumn_meeting['reflectionGroups'][0]['reflections'][0][]
  stackTopRef: RefObject<HTMLDivElement>
}

const CardStack = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flex: 1,
  minHeight: ElementHeight.REFLECTION_CARD_MAX,
  justifyContent: 'center'
})

const CenteredCardStack = styled('div')({
  position: 'relative'
})

const ReflectionWrapper = styled('div')<{idx: number}>(
  ({idx}): any => {
    const multiple = Math.min(idx, 2)
    const scaleX = (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) / ElementWidth.REFLECTION_CARD
    const translateY = ReflectionStackPerspective.Y * multiple
    return {
      cursor: 'pointer',
      position: idx === 0 ? 'relative' : 'absolute',
      bottom: 0,
      left: 0,
      outline: 0,
      transform: `translateY(${translateY}px) scaleX(${scaleX})`,
      zIndex: 3 - multiple,
    }
  }
)

const ReflectionStack = (props: Props) => {
  const {phaseRef, idx, meetingId, readOnly, reflectionStack, stackTopRef} = props
  const stackRef = useRef<HTMLDivElement>(null)
  const {setItemsRef, scrollRef, bgRef, portal, collapse, expand} = useExpandedReflections(stackRef, reflectionStack.length)
  if (reflectionStack.length === 0) {
    return <ReflectionStackPlaceholder idx={idx} ref={stackTopRef} />
  }
  return (
    <React.Fragment>
      {portal(<ExpandedReflectionStack
        phaseRef={phaseRef}
        reflectionStack={reflectionStack}
        meetingId={meetingId}
        readOnly={readOnly}
        scrollRef={scrollRef}
        bgRef={bgRef}
        setItemsRef={setItemsRef}
        closePortal={collapse}
      />)}
      <div>
        <CardStack onClick={expand} ref={stackRef}>
          <CenteredCardStack>
            {reflectionStack.map((reflection, idx) => {
                return (
                  <ReflectionWrapper
                    key={reflection.id}
                    idx={idx}
                    ref={idx === 0 ? stackTopRef : undefined}
                  >
                    <ReflectionCard
                      meetingId={meetingId}
                      reflection={reflection}
                      readOnly={reflectionStack.length > 1 || readOnly || false}
                      userSelect={reflectionStack.length === 1 ? undefined : 'none'}
                      isClipped={idx !== 0}
                    />
                  </ReflectionWrapper>
                )
              })}
          </CenteredCardStack>
        </CardStack>
      </div>
    </React.Fragment>
  )
}

export default ReflectionStack
