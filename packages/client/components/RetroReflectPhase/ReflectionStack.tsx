import graphql from 'babel-plugin-relay/macro'
import * as React from 'react'
import {RefObject, useRef} from 'react'
import {useFragment} from 'react-relay'
import {ReflectionStack_meeting$key} from '~/__generated__/ReflectionStack_meeting.graphql'
import {PhaseItemColumn_meeting$data} from '../../__generated__/PhaseItemColumn_meeting.graphql'
import useExpandedReflections from '../../hooks/useExpandedReflections'
import {ElementWidth, ReflectionStackPerspective} from '../../types/constEnums'
import ReflectionCard from '../ReflectionCard/ReflectionCard'
import ExpandedReflectionStack from './ExpandedReflectionStack'
import ReflectionStackPlaceholder from './ReflectionStackPlaceholder'

interface Props {
  idx: number
  meeting: ReflectionStack_meeting$key
  phaseEditorRef: React.RefObject<HTMLDivElement>
  phaseRef: RefObject<HTMLDivElement>
  dataCy: string
  reflectionStack: readonly PhaseItemColumn_meeting$data['reflectionGroups'][0]['reflections'][0][]
  stackTopRef: RefObject<HTMLDivElement>
}

const ReflectionStack = (props: Props) => {
  const {phaseRef, idx, meeting: meetingRef, reflectionStack, stackTopRef, dataCy} = props
  const meeting = useFragment(
    graphql`
      fragment ReflectionStack_meeting on RetrospectiveMeeting {
        ...DraggableReflectionCard_meeting
        ...ReflectionCard_meeting
        id
      }
    `,
    meetingRef
  )
  const stackRef = useRef<HTMLDivElement>(null)
  const {setItemsRef, scrollRef, bgRef, portal, collapse, expand} = useExpandedReflections(
    stackRef,
    stackRef,
    reflectionStack.length
  )
  if (reflectionStack.length === 0) {
    return <ReflectionStackPlaceholder idx={idx} ref={stackTopRef} />
  }
  return (
    <React.Fragment>
      {portal(
        <ExpandedReflectionStack
          phaseRef={phaseRef}
          staticReflections={reflectionStack}
          reflections={reflectionStack}
          meeting={meeting}
          scrollRef={scrollRef}
          bgRef={bgRef}
          setItemsRef={setItemsRef}
          closePortal={collapse}
        />
      )}

      <div>
        <div
          data-cy={dataCy}
          onClick={expand}
          ref={stackRef}
          className='relative mb-6 flex flex-1 items-start justify-start select-none single-reflection-column:min-h-[104px]'
        >
          <div className='relative'>
            {reflectionStack.map((reflection, idx) => {
              const multiple = Math.min(idx, 2)
              const scaleX =
                (ElementWidth.REFLECTION_CARD - ReflectionStackPerspective.X * multiple * 2) /
                ElementWidth.REFLECTION_CARD
              const translateY = ReflectionStackPerspective.Y * multiple
              const transform = `translateY(${translateY}px) scaleX(${scaleX})`
              const zIndex = 3 - multiple
              return (
                <div
                  className='absolute bottom-0 left-0 cursor-pointer outline-0 first:relative'
                  style={{transform, zIndex}}
                  key={reflection.id}
                  ref={idx === 0 ? stackTopRef : undefined}
                  data-cy={`${dataCy}-card-wrapper-${idx}`}
                >
                  <ReflectionCard
                    dataCy={`${dataCy}-card-${idx}`}
                    meetingRef={meeting}
                    reflectionRef={reflection}
                    stackCount={reflectionStack.length}
                    isClipped={idx !== 0}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default ReflectionStack
