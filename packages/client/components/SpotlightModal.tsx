import styled from '@emotion/styled'
import React, {RefObject, Suspense, useEffect, useLayoutEffect, useRef} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, fadeInOpacity} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {
  BezierCurve,
  Breakpoint,
  DragAttribute,
  ElementWidth,
  Times,
  ZIndex
} from '../types/constEnums'
import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import PlainButton from './PlainButton/PlainButton'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import ResultsRoot from './ResultsRoot'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'

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

const Source = styled('div')({})

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
  phaseRef: RefObject<HTMLDivElement>
  sourceRef: RefObject<HTMLDivElement>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, phaseRef, sourceRef} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const srcDestinationRef = useRef<HTMLDivElement | null>(null)
  const isLoadingResults = !resultsRef.current?.clientHeight
  const {id: meetingId, spotlightGroup, spotlightReflectionId} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const spotlightGroupId = spotlightGroup?.id
  const sourceReflectionIdsRef = useRef<string[] | null>(null)
  const isAnimatedRef = useRef(false) // change name

  useEffect(() => {
    if (!spotlightGroup) return
    const firstReflectionId = sourceReflections && sourceReflections[0]?.id
    let timeout: number | undefined
    const {current: ids} = sourceReflectionIdsRef
    // const sourceReflectionIds = sourceReflections.map((reflection) => reflection.id)
    // if (!sourceReflectionIdsRef.current && firstReflectionId) {
    //   // when Spotlight opens, only show the last reflection in the source group
    //   sourceReflectionIdsRef.current = [firstReflectionId]
    //   console.log('first if')
    // }
    if (!ids && firstReflectionId) {
      // when Spotlight opens, only show the last reflection in the source group
      sourceReflectionIdsRef.current = [firstReflectionId]
    }
    // TODO: uncomment for groups -> source issue
    // else if (firstReflectionId && secondReflectionId && ids?.includes(secondReflectionId)) {
    // if results are dragged onto the source, add result reflections to source group
    //   spotlightReflectionIds.current = [...ids, firstReflectionId]
    // }
    // else if (!sourceReflectionIdsRef.current?.includes(firstReflectionId)) {
    // else if (!spotlightReflectionId || !sourceReflectionIds.includes(spotlightReflectionId)) {
    else if (!firstReflectionId || !ids?.includes(firstReflectionId)) {
      timeout = window.setTimeout(() => {
        closeSpotlight()
      }, Times.REFLECTION_DROP_DURATION)
    }
    return () => clearTimeout(timeout)
  }, [sourceReflections])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && !e.currentTarget.value) {
      closeSpotlight()
    }
  }

  let clone: HTMLElement | null | undefined
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (
        srcDestinationRef.current &&
        spotlightGroupId &&
        sourceRef.current &&
        spotlightReflectionId &&
        !isAnimatedRef.current
      ) {
        const sourceBbox = sourceRef.current.getBoundingClientRect()
        const destinationBbox = srcDestinationRef.current.getBoundingClientRect()
        clone = document.getElementById(`clone-${spotlightReflectionId}`)
        if (!clone) return
        const {style} = clone
        const {left: startLeft, top: startTop} = sourceBbox
        const {left: endLeft, top: endTop} = destinationBbox
        const roundedEndTop = Math.round(endTop) // fractional top pixel throws off calc
        style.left = `${startLeft}px`
        style.top = `${startTop}px`
        style.borderRadius = `4px`
        style.boxShadow = 'none'
        style.opacity = '1'
        style.overflow = `hidden`
        style.paddingTop = '6px'
        setTimeout(() => {
          style.transform = `translate(${endLeft - startLeft}px,${roundedEndTop - startTop}px)`
          style.transition = `all ${Times.SPOTLIGHT_MODAL_DELAY}ms ${BezierCurve.DECELERATE}`
        }, 0)
        isAnimatedRef.current = true
      }
    })
  })

  useEffect(() => {
    if (isLoadingResults) return
    const timeout = setTimeout(() => {
      if (clone) {
        document.body.removeChild(clone)
      }
    }, Times.SPOTLIGHT_MODAL_TOTAL_DURATION)
    return () => {
      clearTimeout(timeout)
      const testaclone = document.getElementById(`clone-${spotlightReflectionId}`)
      if (testaclone) {
        document.body.removeChild(testaclone)
      }
    }
  }, [isLoadingResults])

  return (
    <Modal isLoadingResults={isLoadingResults}>
      <SourceSection {...{[DragAttribute.DROPZONE]: spotlightReflectionId}}>
        <TopRow>
          <Title>Find cards with similar reflections</Title>
          <StyledCloseButton onClick={closeSpotlight}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </TopRow>
        {/* wait for results to render to know the height of the modal */}
        {!isLoadingResults && (
          <Source ref={srcDestinationRef}>
            {spotlightGroup && (
              <ReflectionGroup
                phaseRef={phaseRef}
                reflectionGroup={spotlightGroup}
                meeting={meeting}
                sourceReflectionIds={sourceReflectionIdsRef.current}
              />
            )}
          </Source>
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
          spotlightGroupId={spotlightGroupId}
        />
      </Suspense>
    </Modal>
  )
}

export default SpotlightModal
