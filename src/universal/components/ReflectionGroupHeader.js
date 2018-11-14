import React from 'react'
import {createFragmentContainer} from 'react-relay'
import styled from 'react-emotion'
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor'
import type {ReflectionGroupHeader_meeting as Meeting} from '__generated__/ReflectionGroupHeader_meeting.graphql'
import type {ReflectionGroupHeader_reflectionGroup as ReflectionGroup} from '__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {GROUP, VOTE} from 'universal/utils/constants'
import ReflectionGroupVoting from 'universal/components/ReflectionGroupVoting'
import Tag from 'universal/components/Tag/Tag'
import {REFLECTION_CARD_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'

type Props = {
  meeting: Meeting,
  reflectionGroup: ReflectionGroup
}

const GroupHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 1,
  fontSize: '.875rem',
  justifyContent: 'space-between',
  maxWidth: REFLECTION_CARD_WIDTH,
  padding: '0 .5rem .5rem .75rem',
  position: 'relative',
  width: '100%'
})

const StyledTag = styled(Tag)({marginRight: 4})

const ReflectionGroupHeader = (props: Props) => {
  const {innerRef, isExpanded, meeting, reflectionGroup} = props
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = phaseType === GROUP && localStage.isComplete === false
  return (
    <GroupHeader innerRef={innerRef}>
      <ReflectionGroupTitleEditor
        isExpanded={isExpanded}
        reflectionGroup={reflectionGroup}
        meeting={meeting}
        readOnly={!canEdit}
      />
      {phaseType === GROUP && (
        <StyledTag
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
