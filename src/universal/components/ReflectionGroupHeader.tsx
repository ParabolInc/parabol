import React, {Ref} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import styled from 'react-emotion'
import ReflectionGroupTitleEditor from 'universal/components/ReflectionGroup/ReflectionGroupTitleEditor'
import {GROUP, VOTE} from 'universal/utils/constants'
import ReflectionGroupVoting from 'universal/components/ReflectionGroupVoting'
import Tag from 'universal/components/Tag/Tag'
import {REFLECTION_CARD_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'
import {ReflectionGroupHeader_reflectionGroup} from '__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {ReflectionGroupHeader_meeting} from '__generated__/ReflectionGroupHeader_meeting.graphql'

type Props = {
  meeting: ReflectionGroupHeader_meeting
  reflectionGroup: ReflectionGroupHeader_reflectionGroup
  innerRef: Ref<any>
  isExpanded?: boolean
}

const GroupHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 1,
  fontSize: 14,
  justifyContent: 'space-between',
  maxWidth: REFLECTION_CARD_WIDTH,
  minHeight: 32,
  padding: '0 8px 8px 12px',
  position: 'relative',
  width: '100%'
})

const StyledTag = styled(Tag)({marginRight: 4})

const ReflectionGroupHeader = (props: Props) => {
  const {innerRef, meeting, reflectionGroup} = props
  const isExpanded = !!props.isExpanded
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = phaseType === GROUP && !localStage.isComplete
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
