import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor'
import type {ReflectionGroupHeader_meeting as Meeting} from '__generated__/ReflectionGroupHeader_meeting.graphql'
import type {ReflectionGroupHeader_reflectionGroup as ReflectionGroup} from '__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {GROUP, VOTE} from 'universal/utils/constants'
import ReflectionGroupVoting from 'universal/components/ReflectionGroupVoting'
import ui from 'universal/styles/ui'
import Tag from 'universal/components/Tag/Tag'

type Props = {
  meeting: Meeting,
  reflectionGroup: ReflectionGroup
}

const GroupHeader = styled('div')(({isExpanded, phaseType}) => ({
  display: 'flex',
  fontSize: '.875rem',
  justifyContent: isExpanded ? 'flex-start' : phaseType === VOTE ? 'space-between' : 'center',
  paddingBottom: 8,
  width: '100%'
}))

const TitleAndCount = styled('div')(({isExpanded}) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 1,
  justifyContent: !isExpanded && 'center',
  position: 'relative'
}))

const Spacer = styled('div')({width: ui.votingCheckmarksWidth})

const ReflectionGroupHeader = (props: Props) => {
  const {innerRef, isExpanded, meeting, reflectionGroup, isVisible} = props
  if (!isVisible) return null
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = phaseType === GROUP && localStage.isComplete === false
  return (
    <GroupHeader innerRef={innerRef} isExpanded={isExpanded} phaseType={phaseType}>
      {phaseType === VOTE && <Spacer />}
      <TitleAndCount>
        <ReflectionGroupTitleEditor
          isExpanded={isExpanded}
          reflectionGroup={reflectionGroup}
          meeting={meeting}
          readOnly={!canEdit}
        />
        {phaseType === GROUP && (
          <Tag
            colorPalette={isExpanded ? 'white' : 'midGray'}
            label={`${reflections.length} Cards`}
          />
        )}
        {phaseType === VOTE && (
          <ReflectionGroupVoting
            isExpanded={isExpanded}
            reflectionGroup={reflectionGroup}
            meeting={meeting}
          />
        )}
      </TitleAndCount>
    </GroupHeader>
  )
}

export default createFragmentContainer(
  ReflectionGroupHeader,
  graphql`
    fragment ReflectionGroupHeader_meeting on RetrospectiveMeeting {
      localStage {
        isComplete
      }
      localPhase {
        phaseType
      }
      ...ReflectionGroupTitleEditor_meeting
      ...ReflectionGroupVoting_meeting
    }

    fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupTitleEditor_reflectionGroup
      ...ReflectionGroupVoting_reflectionGroup
      reflections {
        id
      }
    }
  `
)
