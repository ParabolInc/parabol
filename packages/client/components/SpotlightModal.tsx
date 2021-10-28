import styled from '@emotion/styled'
import React, {RefObject, Suspense, useEffect, useRef} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, fadeUp} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {
  Breakpoint,
  DragAttribute,
  ElementHeight,
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
import useGetRefVal from '../hooks/useGetRefVal'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

const Modal = styled('div')<{height: number | null}>(({height}) => ({
  animation: height ? `${fadeUp.toString()} 300ms ${DECELERATE} 300ms forwards` : undefined,
  backgroundColor: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  overflow: 'hidden',
  opacity: 0,
  height: '90vh',
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    // if results are remotely ungrouped, SpotlightGroups increases in height.
    // to prevent the modal height from changing, use initial modal height
    height: height || '100%',
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

const SourceDestination = styled('div')({
  height: ElementHeight.REFLECTION_CARD_MAX
})

const SourceWrapper = styled('div')<{offsetTop: number | null}>(({offsetTop}) => ({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  height: ElementHeight.REFLECTION_CARD_MAX,
  top: offsetTop || undefined,
  left: `calc(50% - ${ElementWidth.REFLECTION_CARD / 2}px)`,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT_SPOTLIGHT
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
  flipRef: (instance: HTMLDivElement) => void
  meeting: GroupingKanban_meeting
  phaseRef: RefObject<HTMLDivElement>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, flipRef, meeting, phaseRef} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const srcDestinationRef = useRef<HTMLDivElement>(null)
  const offsetTop = useGetRefVal(srcDestinationRef, 'offsetTop')
  const modalRefHeight = useGetRefVal(modalRef, 'clientHeight')
  const areResultsRendered = !!resultsRef.current?.clientHeight
  const modalHeight = areResultsRendered ? modalRefHeight : null
  const {id: meetingId, spotlightGroup} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const sourceReflectionsIds = sourceReflections?.map(({id}) => id)
  const spotlightGroupId = spotlightGroup?.id
  const sourceReflectionIdsRef = useRef<string[] | null>(null)
  const initSrcReflectionIdRef = useRef<string | null>(null)
  const topOfSrcGroupReflectionId = spotlightGroup?.reflections[0]?.id

  useEffect(() => {
    if (!spotlightGroup) return
    let timeout: number | undefined
    const {current: srcIds} = sourceReflectionIdsRef
    const {current: initSrcId} = initSrcReflectionIdRef
    if (!srcIds && topOfSrcGroupReflectionId && !initSrcId) {
      // when Spotlight opens, only show the top reflection in the source group
      sourceReflectionIdsRef.current = [topOfSrcGroupReflectionId]
      initSrcReflectionIdRef.current = topOfSrcGroupReflectionId
    }
    if (!initSrcId || !srcIds) return
    if (!topOfSrcGroupReflectionId || !sourceReflectionsIds?.includes(initSrcId)) {
      // the source was dropped on a result group
      timeout = window.setTimeout(() => {
        closeSpotlight()
      }, Times.REFLECTION_DROP_DURATION)
    } else if (
      sourceReflectionsIds.includes(initSrcId) &&
      topOfSrcGroupReflectionId !== initSrcId
    ) {
      // a group was added to the source
      sourceReflectionIdsRef.current = [...srcIds, topOfSrcGroupReflectionId]
    }
    return () => clearTimeout(timeout)
  }, [sourceReflections])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && !e.currentTarget.value) {
      closeSpotlight()
    }
  }
  return (
    <>
      <Modal ref={modalRef} height={modalHeight}>
        <SourceSection>
          <TopRow>
            <Title>Find cards with similar reflections</Title>
            <StyledCloseButton onClick={closeSpotlight}>
              <CloseIcon>close</CloseIcon>
            </StyledCloseButton>
          </TopRow>
          <SourceDestination ref={srcDestinationRef} />
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
            phaseRef={phaseRef}
            spotlightGroupId={spotlightGroupId}
          />
        </Suspense>
      </Modal>
      {areResultsRendered && (
        <SourceWrapper
          ref={flipRef}
          offsetTop={offsetTop}
          {...{[DragAttribute.DROPPABLE]: spotlightGroupId}}
        >
          {spotlightGroup && (
            <ReflectionGroup
              phaseRef={phaseRef}
              reflectionGroup={spotlightGroup}
              expandedReflectionGroupPortalParentId={'spotlight'}
              meeting={meeting}
              sourceReflectionIds={sourceReflectionIdsRef.current}
            />
          )}
        </SourceWrapper>
      )}
    </>
  )
}

export default SpotlightModal
