import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {Suspense, useRef} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {DECELERATE, makeVisible} from '../styles/animation'
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
  animation: `${makeVisible.toString()} 300ms ${DECELERATE} 300ms forwards`,
  background: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  overflow: 'hidden',
  height: '85vh',
  width: '90vw',
  visibility: 'hidden',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    maxHeight: '90vh',
    height: modalHeight,
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SourceSection = styled('div')({
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  flexWrap: 'wrap',
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

// const FixedContainer = styled('div')({
//   border: '2px solid green',
//   width: '100vw',
//   position: 'fixed',
//   // position: 'absolute',
//   display: 'flex',
//   justifyContent: 'center'
// })

const SourceWrapper = styled('div')({
  visibility: 'visible',
  display: 'flex',
  justifyContent: 'center'
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
  const phaseRef = useRef(null)
  const columnsRef = useRef(null)
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
    <ModalContainer ref={phaseRef} modalHeight={modalHeight}>
      <SourceSection>
        <TopRow>
          <Title>Find cards with similar reflections</Title>
          <StyledCloseButton onClick={closeSpotlight}>
            <CloseIcon>close</CloseIcon>
          </StyledCloseButton>
        </TopRow>
        <SourceWrapper ref={flipRef}>
          {spotlightReflection && (
            <DraggableReflectionCard
              isDraggable
              reflection={spotlightReflection}
              meeting={meeting}
              staticReflections={null}
            />
          )}
        </SourceWrapper>
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
        <SpotlightGroups
          meeting={meeting}
          columnsRef={columnsRef}
          phaseRef={phaseRef}
          viewer={viewer}
        />
      </Suspense>
    </ModalContainer>
  )
}

export default SpotlightModal
