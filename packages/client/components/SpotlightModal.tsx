import styled from '@emotion/styled'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, fadeInOpacity} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {BezierCurve, Breakpoint, ElementWidth, Times, ZIndex} from '../types/constEnums'
import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import PlainButton from './PlainButton/PlainButton'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import ResultsRoot from './ResultsRoot'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import cloneReflection from '~/utils/retroGroup/cloneReflection'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

const Modal = styled('div')<{isLoadingResults: boolean}>(({isLoadingResults}) => ({
  animation: isLoadingResults
    ? undefined
    : `${fadeInOpacity.toString()} ${Times.SPOTLIGHT_MODAL_DURATION}ms ${DECELERATE} ${
        Times.SPOTLIGHT_MODAL_DELAY
      }ms forwards`,
  backgroundColor: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  opacity: 0,
  overflow: 'hidden',
  height: '90vh',
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    height: '100%',
    maxHeight: '90vh',
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SourceSection = styled('div')({
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  height: SPOTLIGHT_TOP_SECTION_HEIGHT,
  justifyContent: 'space-between',
  padding: 16,
  position: 'relative',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center'
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'center'
})

const TopRow = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const SourceWrapper = styled('div')<{isLoadingResults: boolean}>(({isLoadingResults}) => ({
  animation: isLoadingResults
    ? undefined
    : `${fadeInOpacity.toString()} 0ms ${DECELERATE} ${
        Times.SPOTLIGHT_MODAL_TOTAL_DURATION
      }ms forwards`,
  opacity: 0
}))

const SearchInput = styled('input')({
  appearance: 'none',
  border: `1px solid ${PALETTE.SKY_500}`,
  borderRadius: 4,
  boxShadow: `0 0 1px 1px ${PALETTE.SKY_300}`,
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 14,
  lineHeight: '24px',
  outline: 'none',
  padding: '6px 0 6px 39px',
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const SearchWrapper = styled('div')({
  position: 'relative',
  width: ElementWidth.REFLECTION_CARD
})

const Search = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  flex: 0,
  position: 'absolute',
  bottom: -32,
  width: ElementWidth.REFLECTION_CARD
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  top: 8
})

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  right: 16
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover,:focus': {
    color: PALETTE.SLATE_800
  }
})

interface Props {
  closeSpotlight: () => void
  meeting: GroupingKanban_meeting
  sourceRef: RefObject<HTMLDivElement>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, sourceRef} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const srcDestinationRef = useRef<HTMLDivElement | null>(null)
  const isLoadingResults = !resultsRef.current?.clientHeight
  const {id: meetingId, spotlightReflection} = meeting
  const spotlightReflectionId = spotlightReflection?.id

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && !e.currentTarget.value) {
      closeSpotlight()
    }
  }

  let clone: HTMLDivElement
  requestAnimationFrame(() => {
    if (srcDestinationRef.current && spotlightReflectionId && sourceRef.current) {
      const sourceBbox = sourceRef.current.getBoundingClientRect()
      const destinationBbox = srcDestinationRef.current.getBoundingClientRect()
      clone = cloneReflection(sourceRef.current, spotlightReflectionId)
      const {style} = clone
      const {left: startLeft, top: startTop} = sourceBbox
      const {left: endLeft, top: endTop} = destinationBbox
      style.left = `${startLeft}px`
      style.top = `${startTop}px`
      style.borderRadius = `4px`
      style.boxShadow = Elevation.CARD_SHADOW
      const roundedEndTop = Math.round(endTop) // fractional top throws off position
      style.overflow = `hidden`
      setTimeout(() => {
        style.transform = `translate(${endLeft - startLeft}px,${roundedEndTop - startTop}px)`
        style.transition = `all 300ms ${BezierCurve.DECELERATE}`
      }, 0)
    }
  })

  useEffect(() => {
    if (isLoadingResults) return
    const timeout = setTimeout(() => {
      if (clone) {
        document.body.removeChild(clone)
      }
    }, Times.SPOTLIGHT_MODAL_TOTAL_DURATION)
    return () => clearTimeout(timeout)
  }, [isLoadingResults])

  return (
    <Modal isLoadingResults={isLoadingResults}>
      <SourceSection>
        <TopRow>
          <Title>Find cards with similar reflections</Title>
          <StyledCloseButton onClick={closeSpotlight}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </TopRow>
        {/* wait for results to render to know the height of the modal */}
        {!isLoadingResults && (
          <SourceWrapper ref={srcDestinationRef} isLoadingResults={isLoadingResults}>
            {spotlightReflection && (
              <DraggableReflectionCard
                isDraggable
                reflection={spotlightReflection}
                meeting={meeting}
                staticReflections={null}
              />
            )}
          </SourceWrapper>
        )}
        <SearchWrapper>
          <Search>
            <StyledMenuItemIcon>
              <SearchIcon>search</SearchIcon>
            </StyledMenuItemIcon>
            <SearchInput
              onKeyDown={onKeyDown}
              autoFocus
              autoComplete='off'
              name='search'
              placeholder='Or search for keywords...'
              type='text'
            />
          </Search>
        </SearchWrapper>
      </SourceSection>
      <Suspense fallback={''}>
        <ResultsRoot
          resultsRef={resultsRef}
          meetingId={meetingId}
          phaseRef={modalRef}
          spotlightReflectionId={spotlightReflectionId}
        />
      </Suspense>
    </Modal>
  )
}

export default SpotlightModal
