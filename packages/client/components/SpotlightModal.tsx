import styled from '@emotion/styled'
import React, {RefObject, Suspense, useMemo, useRef} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, fadeUp} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, ElementHeight, ElementWidth, ZIndex} from '../types/constEnums'
import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import PlainButton from './PlainButton/PlainButton'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import ResultsRoot from './ResultsRoot'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import {GroupingKanban_meeting} from '~/__generated__/GroupingKanban_meeting.graphql'
import useGetRefHeight from '../hooks/useGetRefHeight'

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
  maxHeight: '90vh',
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    // if results are remotely ungrouped, SpotlightGroups increases in height
    // to prevent the modal from changing height, use initial modal height
    height: height || '100%',
    maxHeight: '90vh',
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SourceSection = styled('div')({
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  height: `${SPOTLIGHT_TOP_SECTION_HEIGHT}px`,
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

const SourceDestination = styled('div')<{sourceHeight: number}>(({sourceHeight}) => ({
  height: sourceHeight
}))

const SourceWrapper = styled('div')<{offsetTop?: number}>(({offsetTop}) => ({
  position: 'absolute',
  top: offsetTop,
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
  sourceRef: RefObject<HTMLDivElement>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, flipRef, meeting, sourceRef} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const srcDestinationRef = useRef<HTMLDivElement>(null)
  const offsetTop = srcDestinationRef.current?.offsetTop
  const sourceHeight = useGetRefHeight(sourceRef, ElementHeight.REFLECTION_CARD)
  const areResultsRendered = useMemo(() => !!columnsRef.current?.clientHeight, [columnsRef.current])
  const modalRefHeight = useGetRefHeight(modalRef, 0, modalRef)
  const modalHeight = areResultsRendered ? modalRefHeight : null
  if (!meeting) return null
  const {id: meetingId, spotlightReflection} = meeting
  const spotlightReflectionId = spotlightReflection?.id

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
          <SourceDestination sourceHeight={sourceHeight} ref={srcDestinationRef} />
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
            columnsRef={columnsRef}
            meetingId={meetingId}
            phaseRef={modalRef}
            spotlightReflectionId={spotlightReflectionId}
          />
        </Suspense>
      </Modal>
      {areResultsRendered && (
        <SourceWrapper ref={flipRef} offsetTop={offsetTop}>
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
    </>
  )
}

export default SpotlightModal
