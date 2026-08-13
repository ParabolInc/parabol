import type * as React from 'react'
import {type ReactNode, type Ref, type RefObject, useEffect, useMemo} from 'react'
import {DragAttribute} from '../../types/constEnums'
import type {RefCallbackInstance} from '../../types/generics'
import type {OpenSpotlight} from '../GroupingKanbanColumn'
import ExpandedReflection from './ExpandedReflection'
import getBBox from './getBBox'

interface Props {
  closePortal: () => void
  header?: ReactNode
  phaseRef: RefObject<HTMLDivElement>
  staticReflections: readonly any[]
  reflections: readonly any[]
  meeting: any
  scrollRef: Ref<HTMLDivElement>
  bgRef: Ref<HTMLDivElement>
  setItemsRef: (idx: number) => (c: RefCallbackInstance) => void
  reflectionGroupId?: string
  openSpotlight?: OpenSpotlight
  isBehindSpotlight?: boolean
}

const ExpandedReflectionStack = (props: Props) => {
  const {
    header,
    staticReflections,
    phaseRef,
    scrollRef,
    setItemsRef,
    bgRef,
    closePortal,
    reflections,
    reflectionGroupId,
    meeting,
    openSpotlight,
    isBehindSpotlight
  } = props
  const phaseBBox = useMemo(() => {
    return getBBox(phaseRef.current)
  }, [phaseRef.current])
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const {activeElement, body} = document
      if (e.key === 'Escape' && activeElement === body) {
        closePortal()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [])
  if (!phaseBBox) return null

  const closeOnEdge = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closePortal()
  }
  return (
    <div className='absolute top-0 left-0 z-dialog h-full w-full'>
      {/* use phaseBBox to center in the phase, not the screen (ignores left nav & fac nav bar) */}
      <div
        className='absolute z-dialog flex items-center justify-center'
        style={{
          top: phaseBBox.top,
          left: phaseBBox.left,
          width: phaseBBox.width,
          height: phaseBBox.height
        }}
      >
        <div className='fixed h-full w-full' onClick={closePortal} />
        <div
          className='relative flex max-h-[calc(100vh-32px)] flex-col rounded'
          {...(isBehindSpotlight ? null : {[DragAttribute.DROPPABLE]: reflectionGroupId})}
        >
          {header}
          <div
            className='flex w-min flex-wrap overflow-y-auto overflow-x-hidden p-1.5'
            ref={scrollRef}
            onClick={closeOnEdge}
          >
            {reflections.map((reflection, idx) => {
              return (
                <ExpandedReflection
                  key={reflection.id}
                  reflection={reflection}
                  meeting={meeting}
                  openSpotlight={openSpotlight}
                  idx={idx}
                  setItemsRef={setItemsRef}
                  staticReflections={staticReflections}
                />
              )
            })}
          </div>
          {/* z-[-1] keeps the scrollbar visible */}
          <div ref={bgRef} className='absolute z-[-1] h-full w-full rounded bg-slate-700/80' />
        </div>
      </div>
    </div>
  )
}

export default ExpandedReflectionStack
