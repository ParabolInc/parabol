import React, {forwardRef, Ref, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import ReflectionGroupTitleEditor from './ReflectionGroup/ReflectionGroupTitleEditor'
import {GROUP, VOTE} from '../utils/constants'
import ReflectionGroupVoting from './ReflectionGroupVoting'
import Tag from './Tag/Tag'
import {ReflectionGroupHeader_reflectionGroup} from '../__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {ReflectionGroupHeader_meeting} from '../__generated__/ReflectionGroupHeader_meeting.graphql'
import plural from '../utils/plural'
import {PortalStatus} from '../hooks/usePortal'
import {ElementWidth} from '../types/constEnums'

interface Props {
  meeting: ReflectionGroupHeader_meeting
  reflectionGroup: ReflectionGroupHeader_reflectionGroup
  isExpanded?: boolean
  portalStatus: PortalStatus
  titleInputRef: RefObject<HTMLInputElement>
}

const GroupHeader = styled('div')<{isExpanded: boolean, portalStatus: PortalStatus}>(({isExpanded, portalStatus}) => ({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 1,
  fontSize: 14,
  justifyContent: 'space-between',
  margin: isExpanded ? '0 16px' : undefined,
  maxWidth: ElementWidth.REFLECTION_CARD,
  minHeight: 32,
  opacity: !isExpanded && portalStatus !== PortalStatus.Exited ? 0 : undefined,
  paddingLeft: 8,
  paddingRight: 8,
  position: 'relative',
  width: '100%'
}))

const StyledTag = styled(Tag)({marginRight: 4})

const ReflectionGroupHeader = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {meeting, reflectionGroup, titleInputRef, portalStatus} = props
  const isExpanded = !!props.isExpanded
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = phaseType === GROUP && !localStage.isComplete
  return (
    <GroupHeader portalStatus={portalStatus} isExpanded={isExpanded} ref={ref}>
      <ReflectionGroupTitleEditor
        isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
        reflectionGroup={reflectionGroup}
        meeting={meeting}
        readOnly={!canEdit}
        titleInputRef={titleInputRef}
      />
      {phaseType === GROUP && (
        <StyledTag
          colorPalette={portalStatus === PortalStatus.Exited || portalStatus === PortalStatus.Exiting ? 'midGray' : 'white'}
          label={`${reflections.length} ${plural(reflections.length, 'Card')}`}
        />
      )}
      {phaseType === VOTE && (
        <ReflectionGroupVoting
          isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
          reflectionGroup={reflectionGroup}
          meeting={meeting}
        />
      )}
    </GroupHeader>
  )
})

export default createFragmentContainer(ReflectionGroupHeader, {
  meeting: graphql`
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
  `,
  reflectionGroup: graphql`
    fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
      ...ReflectionGroupTitleEditor_reflectionGroup
      ...ReflectionGroupVoting_reflectionGroup
      reflections {
        id
      }
    }
  `
})
