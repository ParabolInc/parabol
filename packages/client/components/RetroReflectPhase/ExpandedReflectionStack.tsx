import styled from '@emotion/styled'
import React, {ReactNode, Ref, RefObject, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {PALETTE} from '../../styles/paletteV3'
import {BBox} from '../../types/animations'
import {DragAttribute, ElementWidth, ZIndex} from '../../types/constEnums'
import {RefCallbackInstance} from '../../types/generics'
import {OpenSpotlight} from '../GroupingKanbanColumn'
import ExpandedReflection from './ExpandedReflection'
import getBBox from './getBBox'

const PortalBlock = styled('div')({
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: ZIndex.DIALOG
})

const Scrim = styled('div')({
  position: 'fixed',
  height: '100%',
  width: '100%'
})

const PhaseArea = styled('div')<{phaseBBox: BBox}>(({phaseBBox}) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  zIndex: ZIndex.DIALOG,
  // use phaseBBox to center in the phase, not the screen (ignores left nav & fac nav bar)
  top: phaseBBox.top,
  left: phaseBBox.left,
  width: phaseBBox.width,
  height: phaseBBox.height
}))

const ModalArea = styled('div')({
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 'calc(100vh - 32px)',
  position: 'relative'
})

const BackgroundBlock = styled('div')({
  position: 'absolute',
  background: PALETTE.SLATE_700_80,
  borderRadius: 4,
  height: '100%',
  width: '100%',
  zIndex: -1 // keep scrollbar visible
})

const ScrollBlock = styled('div')({
  width: 'min-content',
  display: 'flex',
  flexWrap: 'wrap',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: ElementWidth.REFLECTION_CARD_PADDING
})

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

  const {t} = useTranslation()

  const phaseBBox = useMemo(() => {
    return getBBox(phaseRef.current)
  }, [phaseRef.current])
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const {activeElement, body} = document
      if (e.key === t('ExpandedReflectionStack.Escape') && activeElement === body) {
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
    <PortalBlock>
      <PhaseArea phaseBBox={phaseBBox!}>
        <Scrim onClick={closePortal} />
        <ModalArea {...(isBehindSpotlight ? null : {[DragAttribute.DROPPABLE]: reflectionGroupId})}>
          {header}
          <ScrollBlock ref={scrollRef} onClick={closeOnEdge}>
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
          </ScrollBlock>
          <BackgroundBlock ref={bgRef} />
        </ModalArea>
      </PhaseArea>
    </PortalBlock>
  )
}

export default ExpandedReflectionStack
