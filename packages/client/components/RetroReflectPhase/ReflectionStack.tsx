import {PhaseItemColumn_meeting} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import React, {RefObject, useRef} from 'react'
import styled from '@emotion/styled'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from './ExpandedReflectionStack'
import ReflectionStackPlaceholder from './ReflectionStackPlaceholder'
import {cardBackgroundColor, cardBorderRadius} from '../../styles/cards'
import {cardShadow} from '../../styles/elevation'
import {ElementHeight, ReflectionStackPerspective} from '../../types/constEnums'
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

const HIDE_LINES_HACK_STYLES = {
  background: cardBackgroundColor,
  content: '""',
  height: 12,
  left: 0,
  position: 'absolute',
  right: 0,
  zIndex: 200
}

const CARD_IN_STACK = {
  backgroundColor: cardBackgroundColor,
  borderRadius: cardBorderRadius,
  boxShadow: cardShadow,
  cursor: 'pointer',
  overflow: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
  // hides partially overflown top lines of text
  '&::before': {
    ...HIDE_LINES_HACK_STYLES,
    top: 0
  },
  // hides partially overflown bottom lines of text
  '&::after': {
    ...HIDE_LINES_HACK_STYLES,
    bottom: 0
  },
  '& > div': {
    bottom: 0,
    boxShadow: 'none',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 100
  }
}

const ReflectionWrapper = styled('div')<{idx: number}>(
  ({idx}): any => {
    if (idx === 0) return {
      cursor: 'pointer',
      position: 'relative',
      zIndex: 2
    }
    const multiple = Math.min(idx, 2)
    return {
      ...CARD_IN_STACK,
      bottom: -ReflectionStackPerspective.Y * multiple,
      left: ReflectionStackPerspective.X * multiple,
      right: ReflectionStackPerspective.X * multiple,
      top: ReflectionStackPerspective.Y * multiple,
      zIndex: 2 - multiple
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
