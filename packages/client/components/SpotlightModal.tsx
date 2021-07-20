import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {MenuProps} from '../hooks/useMenu'
import Menu from './Menu'
import MenuItem from './MenuItem'
import {createFragmentContainer} from 'react-relay'
import {SpotlightModal_meeting} from '~/__generated__/SpotlightModal_meeting.graphql'
import {MeetingControlBarEnum, NavSidebar} from '../types/constEnums'
import {cardShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import ReflectionCard from './ReflectionCard/ReflectionCard'

interface Props {
  meeting: SpotlightModal_meeting
  reflection: SpotlightModal_reflection
}

const StyledMenu = styled(Menu)<{showSidebar: boolean}>(({showSidebar}) => ({
  position: 'fixed',
  minHeight: `calc(100vw - ${0}px)`,
  height: `calc(100vw - ${0}px)`,
  minWidth: `calc(100vw - ${showSidebar ? NavSidebar.WIDTH : 0}px)`,
  right: 0,
  // top: 0,
  border: '2px solid red',
  backgroundColor: '#FFFF',
  borderRadius: 4
}))

const SelectedReflection = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '50%',
  border: '2px solid red',
  background: PALETTE.SLATE_100,
  padding: 16
})

const RelevantReflections = styled('div')({
  display: 'flex',
  height: '50%',
  width: '100%',
  border: '2px solid red',
  padding: 16
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600
})

const ModalContainer = styled('div')<{showSidebar: boolean; topBarHeight: number}>(
  ({showSidebar, topBarHeight}) => ({
    background: '#FFFF',
    // border: '2px solid red',
    borderRadius: 8,
    boxShadow: cardShadow,
    width: `calc(100vw - ${(showSidebar ? NavSidebar.WIDTH : 0) + 24}px)`,
    height: `calc(100vh - ${MeetingControlBarEnum.HEIGHT + 16 + topBarHeight}px)`,
    right: 12,
    position: 'fixed',
    // left: 0
    top: `${topBarHeight}px`
  })
)

const SpotlightModal = (props: Props) => {
  const {meeting, reflection} = props
  const {showSidebar, topBarHeight} = meeting
  return (
    <ModalContainer showSidebar={showSidebar} topBarHeight={topBarHeight}>
      <SelectedReflection>
        <Title>Find cards with similar reflections</Title>
        <ReflectionCard reflection={reflection} meeting={meeting} />
      </SelectedReflection>
      <RelevantReflections>
        <Title>Test</Title>
      </RelevantReflections>
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
      showSidebar
      topBarHeight
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
