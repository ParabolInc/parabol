import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import {SpotlightModal_meeting} from '~/__generated__/SpotlightModal_meeting.graphql'
import {PALETTE} from '../styles/paletteV3'
import ReflectionCard from './ReflectionCard/ReflectionCard'
import {cardShadow} from '../styles/elevation'

interface Props {
  meeting: SpotlightModal_meeting
  reflection: SpotlightModal_reflection
}

const SelectedReflection = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  height: '40%',
  border: '2px solid red',
  background: PALETTE.SLATE_100,
  padding: 16
})

const RelevantReflections = styled('div')({
  display: 'flex',
  height: '60%',
  width: '100%',
  border: '2px solid red',
  padding: 16
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600
})

const ModalContainer = styled('div')({
  background: '#FFFF',
  borderRadius: 8,
  boxShadow: cardShadow,
  width: '80vw',
  height: '80vh'
})

const SpotlightModal = (props: Props) => {
  const {meeting, reflection} = props
  return (
    <ModalContainer>
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
