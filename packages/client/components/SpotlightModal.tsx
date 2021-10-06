import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, fadeUp} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, ElementHeight, ElementWidth, ZIndex} from '../types/constEnums'
import {SpotlightModalQuery} from '../__generated__/SpotlightModalQuery.graphql'
import Icon from './Icon'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import PlainButton from './PlainButton/PlainButton'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import SpotlightGroups from './SpotlightGroups'
import useGetRefHeight from '../hooks/useGetRefHeight'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import useBreakpoint from '~/hooks/useBreakpoint'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

const ModalContainer = styled('div')<{modalHeight: number}>(({modalHeight}) => ({
  animation: `${fadeUp.toString()} 300ms ${DECELERATE} 300ms forwards`,
  background: '#FFFF',
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  opacity: 0,
  overflow: 'hidden',
  height: '85vh',
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    maxHeight: '90vh',
    height: modalHeight,
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SelectedReflectionSection = styled('div')({
  alignItems: 'flex-start',
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  flexWrap: 'wrap',
  height: `${SPOTLIGHT_TOP_SECTION_HEIGHT}px`,
  justifyContent: 'center',
  padding: 16,
  position: 'relative',
  width: '100%'
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'center'
})

const TopRow = styled('div')({
  width: `calc(100% - 48px)`, // 48px accounts for icon size
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const SourceWrapper = styled('div')<{sourceHeight: number}>(({sourceHeight}) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: `calc(${SPOTLIGHT_TOP_SECTION_HEIGHT / 2}px - ${sourceHeight / 2}px)`,
  left: `calc(50% - ${ElementWidth.REFLECTION_CARD / 2}px)`,
  zIndex: ZIndex.REFLECTION_IN_FLIGHT_LOCAL
}))

const SourceInner = styled('div')()

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

const SearchItem = styled(MenuItemLabel)({
  overflow: 'visible',
  padding: 0,
  position: 'absolute',
  bottom: -16,
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
  queryRef: PreloadedQuery<SpotlightModalQuery>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, flipRef, queryRef} = props
  const data = usePreloadedQuery<SpotlightModalQuery>(
    graphql`
      query SpotlightModalQuery($reflectionId: ID!, $searchQuery: String!, $meetingId: ID!) {
        viewer {
          ...SpotlightGroups_viewer
          meeting(meetingId: $meetingId) {
            ... on RetrospectiveMeeting {
              ...DraggableReflectionCard_meeting
              ...SpotlightGroups_meeting
              id
              teamId
              localPhase {
                phaseType
              }
              localStage {
                isComplete
                phaseType
              }
              phases {
                phaseType
                stages {
                  isComplete
                  phaseType
                }
              }
              spotlightReflection {
                id
                ...DraggableReflectionCard_reflection
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const {meeting} = viewer
  const sourceRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef(null)
  const columnsRef = useRef(null)
  const sourceHeight = useGetRefHeight(sourceRef, ElementHeight.REFLECTION_CARD)
  const minColumnsHeight = (ElementHeight.REFLECTION_CARD + ElementHeight.MEETING_CARD_MARGIN) * 4
  const columnsRefHeight = useGetRefHeight(columnsRef, 0, phaseRef)
  const isDesktop = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const groupsPadding = isDesktop ? 64 : 54
  const groupsHeight = Math.max(minColumnsHeight, columnsRefHeight) + groupsPadding
  const modalHeight = SPOTLIGHT_TOP_SECTION_HEIGHT + groupsHeight
  if (!meeting) return null
  const {spotlightReflection} = meeting

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && !e.currentTarget.value) {
      closeSpotlight()
    }
  }
  return (
    <>
      <ModalContainer ref={phaseRef} modalHeight={modalHeight}>
        <SelectedReflectionSection>
          <TopRow>
            <Title>Find cards with similar reflections</Title>
            <StyledCloseButton onClick={closeSpotlight}>
              <CloseIcon>close</CloseIcon>
            </StyledCloseButton>
          </TopRow>
          <SearchItem>
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
          </SearchItem>
        </SelectedReflectionSection>
        <Suspense fallback={''}>
          <SpotlightGroups
            meeting={meeting}
            columnsRef={columnsRef}
            phaseRef={phaseRef}
            viewer={viewer}
          />
        </Suspense>
      </ModalContainer>
      <SourceWrapper ref={flipRef} sourceHeight={sourceHeight}>
        <SourceInner ref={sourceRef}>
          {spotlightReflection && (
            <DraggableReflectionCard
              isDraggable
              reflection={spotlightReflection}
              meeting={meeting}
              staticReflections={null}
            />
          )}
        </SourceInner>
      </SourceWrapper>
    </>
  )
}

export default SpotlightModal
