import styled from '@emotion/styled'
import React, {RefObject, useEffect, useRef, useState} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {
  BezierCurve,
  Breakpoint,
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
import {PortalStatus} from '~/hooks/usePortal'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

const Modal = styled('div')<{hideModal: boolean}>(({hideModal}) => ({
  backgroundColor: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexDirection: 'column',
  height: '90vh',
  justifyContent: 'center',
  // We animate the source and then fade in the modal behind it. Source animation needs to know its
  // final position in the modal so render the modal with opacity 0 until source animation is complete.
  opacity: hideModal ? 0 : 1,
  transition: `opacity ${Times.SPOTLIGHT_MODAL_DURATION}ms ${BezierCurve.DECELERATE}`,
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    height: '100%',
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SourceSection = styled('div')({
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  minHeight: SPOTLIGHT_TOP_SECTION_HEIGHT,
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

const Source = styled('div')({
  minHeight: ElementHeight.REFLECTION_CARD
})

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
  padding: '6px 0 6px 40px',
  width: '100%',
  '::placeholder': {
    color: PALETTE.SLATE_600
  }
})

const SearchWrapper = styled('div')({
  width: ElementWidth.REFLECTION_CARD
})

const Search = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  position: 'absolute',
  bottom: -ElementHeight.REFLECTION_CARD / 2,
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
  portalStatus: number
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, sourceRef, portalStatus} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const [hideModal, setHideModal] = useState(true)
  const {id: meetingId, spotlightGroup, spotlightReflectionId} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const spotlightGroupId = spotlightGroup?.id
  const reflectionIdsToHideRef = useRef<string[] | null>(null)

  useEffect(() => {
    if (!spotlightGroup) return
    let timeout: number | undefined
    const sourceReflectionIds = sourceReflections?.map(({id}) => id)
    if (reflectionIdsToHideRef.current === null) {
      // if Spotlight group initially contains several reflections, only show reflection at the top of the stack
      reflectionIdsToHideRef.current =
        sourceReflections?.filter(({id}) => id !== spotlightReflectionId).map(({id}) => id) || []
    } else if (!spotlightReflectionId || !sourceReflectionIds?.includes(spotlightReflectionId)) {
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

  useEffect(() => {
    if (portalStatus !== PortalStatus.Entered) return
    const timeout = setTimeout(() => {
      setHideModal(false)
    }, Times.SPOTLIGHT_SOURCE_DURATION)
    return () => clearTimeout(timeout)
  }, [portalStatus])

  return (
    <Modal hideModal={hideModal} ref={modalRef}>
      <SourceSection>
        <TopRow>
          <Title>Find cards with similar reflections</Title>
          <StyledCloseButton onClick={closeSpotlight}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </TopRow>
        <Source ref={sourceRef}>
          {spotlightGroup && (
            <ReflectionGroup
              phaseRef={modalRef}
              reflectionGroup={spotlightGroup}
              meeting={meeting}
              reflectionIdsToHide={reflectionIdsToHideRef.current}
              expandedReflectionGroupPortalParentId='spotlight'
            />
          )}
        </Source>
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
      <ResultsRoot meetingId={meetingId} phaseRef={modalRef} spotlightGroupId={spotlightGroupId} />
    </Modal>
  )
}

export default SpotlightModal
