import React, {KeyboardEvent} from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import {SpotlightModal_meeting} from '~/__generated__/SpotlightModal_meeting.graphql'
import {SpotlightModal_reflection} from '~/__generated__/SpotlightModal_reflection.graphql'
import {PALETTE} from '../styles/paletteV3'
import MenuItemLabel from './MenuItemLabel'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import {Breakpoint, ElementWidth} from '../types/constEnums'
import PlainButton from './PlainButton/PlainButton'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import useBreakpoint from '../hooks/useBreakpoint'
import SpotlightEmptyState from './SpotlightEmptyState'

const ModalContainer = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  background: '#FFFF',
  width: isDesktop ? '80vw' : '90vw',
  height: '80vh',
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  borderRadius: 8
}))

const SelectedReflection = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '33.3%',
  background: PALETTE.SLATE_100,
  padding: 16,
  position: 'relative',
  alignItems: 'flex-start',
  borderRadius: '8px 8px 0px 0px'
})

const SimilarReflectionGroups = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  height: '66.6%',
  width: '100%',
  padding: 16
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  height: 'fit-content',
  width: '100%',
  textAlign: 'center'
})

const Content = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  alignItems: 'center'
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
  width: '100%'
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

const CardWrapper = styled('div')({
  paddingTop: 16
})

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  top: 8,
  right: 8
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
  meeting: SpotlightModal_meeting
  reflection: SpotlightModal_reflection
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, reflection} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') closeSpotlight()
  }
  const spotlightReflection = {...reflection, inSpotlight: true}
  const reflectionGroupsCount = 0
  return (
    <ModalContainer onKeyDown={handleKeyDown} isDesktop={isDesktop}>
      <SelectedReflection>
        <Content>
          <Title>Find cards with similar reflections</Title>
          <CardWrapper>
            <DraggableReflectionCard
              isReadOnly
              staticIdx={0}
              reflection={spotlightReflection}
              meeting={meeting}
            />
          </CardWrapper>
        </Content>
        <SearchItem>
          <StyledMenuItemIcon>
            <SearchIcon>search</SearchIcon>
          </StyledMenuItemIcon>
          <SearchInput
            autoFocus
            autoComplete='off'
            name='search'
            placeholder='Or search for keywords...'
            type='text'
          />
        </SearchItem>
        <StyledCloseButton onClick={closeSpotlight}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </SelectedReflection>
      <SimilarReflectionGroups>
        <Content>{reflectionGroupsCount === 0 ? <SpotlightEmptyState /> : null}</Content>
      </SimilarReflectionGroups>
    </ModalContainer>
  )
}

export default createFragmentContainer(SpotlightModal, {
  reflection: graphql`
    fragment SpotlightModal_reflection on RetroReflection {
      ...ColorBadge_reflection
      id
      isViewerCreator
      isEditing
      meetingId
      reflectionGroupId
      promptId
      content
      reactjis {
        ...ReactjiSection_reactjis
        id
        isViewerReactji
      }
      sortOrder
    }
  `,
  meeting: graphql`
    fragment SpotlightModal_meeting on RetrospectiveMeeting {
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
    }
  `
})
