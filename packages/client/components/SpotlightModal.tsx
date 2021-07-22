import React from 'react'
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
import purpleLines from '../styles/theme/images/purpleLines.svg'
import DraggableReflectionCard from './ReflectionGroup/DraggableReflectionCard'
import useBreakpoint from '../hooks/useBreakpoint'

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
  width: 'fit-content',
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  alignItems: 'center'
})

const Message = styled('div')({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: 14,
  lineHeight: '20px',
  color: PALETTE.SLATE_700
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
  margin: 0,
  top: 8
})

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
})

const CardWrapper = styled('div')({
  height: 'fit-content',
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

const EmptyState = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  flexWrap: 'wrap'
})

const MessageWrapper = styled('div')({
  display: 'flex',
  padding: '0px 8px',
  flexDirection: 'column',
  height: 'fit-content'
})

const Emoji = styled('div')({
  textAlign: 'center',
  paddingBottom: 4,
  width: '100%'
})

const Img = styled('img')<{isFlipped?: boolean}>(({isFlipped}) => ({
  display: 'block',
  width: 24,
  height: 24,
  transform: isFlipped ? `scaleX(-1)` : `scaleX(1)`
}))

interface Props {
  closePortal: () => void
  meeting: SpotlightModal_meeting
  reflection: SpotlightModal_reflection
}

const SpotlightModal = (props: Props) => {
  const {closePortal, meeting, reflection} = props
  const reflectionGroupsCount = 0
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closePortal()
  }
  return (
    <ModalContainer onKeyDown={handleKeyDown} isDesktop={isDesktop}>
      <SelectedReflection>
        <Content>
          <Title>Find cards with similar reflections</Title>
          <CardWrapper>
            <DraggableReflectionCard
              isReadOnly
              hideSpotlight
              isDraggable={false}
              staticIdx={0}
              staticReflections={[reflection]}
              reflection={reflection}
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
        <StyledCloseButton onClick={closePortal}>
          <CloseIcon>close</CloseIcon>
        </StyledCloseButton>
      </SelectedReflection>
      <SimilarReflectionGroups>
        <Content>
          {reflectionGroupsCount === 0 ? (
            <EmptyState>
              <Emoji>😔</Emoji>
              <Img src={purpleLines} />
              <MessageWrapper>
                <Message>No reflections match this card.</Message>
                <Message>Try searching for specific keywords.</Message>
              </MessageWrapper>
              <Img isFlipped src={purpleLines} />
            </EmptyState>
          ) : null}
        </Content>
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
      localStage {
        isComplete
        phaseType
      }
      localPhase {
        phaseType
      }
      phases {
        phaseType
        stages {
          id
          isComplete
          phaseType
        }
      }
    }
  `
})
