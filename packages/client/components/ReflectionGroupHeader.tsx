import styled from '@emotion/styled'
import {Edit} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {forwardRef, Ref, RefObject} from 'react'
import {useFragment} from 'react-relay'
import {PortalStatus} from '../hooks/usePortal'
import {PALETTE} from '../styles/paletteV3'
import {ElementWidth, Gutters} from '../types/constEnums'
import {GROUP, VOTE} from '../utils/constants'
import plural from '../utils/plural'
import {ReflectionGroupHeader_meeting$key} from '../__generated__/ReflectionGroupHeader_meeting.graphql'
import {ReflectionGroupHeader_reflectionGroup$key} from '../__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import ReflectionGroupTitleEditor from './ReflectionGroup/ReflectionGroupTitleEditor'
import ReflectionGroupVoting from './ReflectionGroupVoting'
import BaseTag from './Tag/BaseTag'

interface Props {
  meeting: ReflectionGroupHeader_meeting$key
  reflectionGroup: ReflectionGroupHeader_reflectionGroup$key
  isExpanded?: boolean
  portalStatus: PortalStatus
  titleInputRef: RefObject<HTMLInputElement>
  dataCy?: string
}

const GroupHeader = styled('div')<{
  isExpanded: boolean
  portalStatus: PortalStatus
}>(({isExpanded, portalStatus}) => ({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 1,
  fontSize: 14,
  justifyContent: 'space-between',
  margin: isExpanded ? `0 ${Gutters.COLUMN_INNER_GUTTER}` : undefined,
  maxWidth: ElementWidth.REFLECTION_CARD,
  minHeight: 32,
  opacity: !isExpanded && portalStatus !== PortalStatus.Exited ? 0 : undefined,
  paddingLeft: Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL,
  paddingRight: 8,
  position: 'relative',
  width: '100%'
}))

const IconGroup = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

const PencilIcon = styled(Edit, {
  shouldForwardProp: (prop) => !['isExpanded'].includes(prop)
})<{isExpanded?: boolean}>(({isExpanded}) => ({
  color: isExpanded ? '#FFFFFF' : PALETTE.SLATE_600,
  display: 'block',
  height: 18,
  width: 18,
  opacity: 0.5,
  marginRight: 4,
  top: 1,
  '&:hover': {
    cursor: 'pointer'
  }
}))

const StyledTag = styled(BaseTag)<{dialogClosed: boolean}>(({dialogClosed}) => ({
  backgroundColor: dialogClosed ? PALETTE.SLATE_600 : '#FFFFFF',
  color: dialogClosed ? '#FFFFFF' : PALETTE.SLATE_700,
  marginRight: 4
}))

const ReflectionGroupHeader = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {
    meeting: meetingRef,
    reflectionGroup: reflectionGroupRef,
    titleInputRef,
    portalStatus,
    dataCy
  } = props
  const meeting = useFragment(
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
    `,
    meetingRef
  )
  const reflectionGroup = useFragment(
    graphql`
      fragment ReflectionGroupHeader_reflectionGroup on RetroReflectionGroup {
        ...ReflectionGroupTitleEditor_reflectionGroup
        ...ReflectionGroupVoting_reflectionGroup
        reflections {
          id
        }
      }
    `,
    reflectionGroupRef
  )
  const isExpanded = !!props.isExpanded
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {reflections} = reflectionGroup
  const canEdit = (phaseType === GROUP || phaseType === VOTE) && !localStage.isComplete
  const onClick = () => {
    titleInputRef.current && titleInputRef.current.select()
  }

  return (
    <GroupHeader data-cy={dataCy} portalStatus={portalStatus} isExpanded={isExpanded} ref={ref}>
      <ReflectionGroupTitleEditor
        isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
        reflectionGroup={reflectionGroup}
        meeting={meeting}
        readOnly={!canEdit}
        titleInputRef={titleInputRef}
      />
      {phaseType === GROUP && (
        <IconGroup>
          {canEdit && <PencilIcon isExpanded={isExpanded} onClick={onClick} />}
          <StyledTag
            dialogClosed={
              portalStatus === PortalStatus.Exited || portalStatus === PortalStatus.Exiting
            }
          >{`${reflections.length} ${plural(reflections.length, 'Card')}`}</StyledTag>
        </IconGroup>
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

export default ReflectionGroupHeader
