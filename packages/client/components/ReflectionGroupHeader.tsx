import React, {forwardRef, Ref, RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import ReflectionGroupTitleEditor from './ReflectionGroup/ReflectionGroupTitleEditor'
import {GROUP, VOTE} from '../utils/constants'
import ReflectionGroupVoting from './ReflectionGroupVoting'
import BaseTag from './Tag/BaseTag'
import {ReflectionGroupHeader_reflectionGroup} from '../__generated__/ReflectionGroupHeader_reflectionGroup.graphql'
import {ReflectionGroupHeader_meeting} from '../__generated__/ReflectionGroupHeader_meeting.graphql'
import plural from '../utils/plural'
import {PortalStatus} from '../hooks/usePortal'
import {ElementWidth, Gutters} from '../types/constEnums'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'

interface Props {
  meeting: ReflectionGroupHeader_meeting
  reflectionGroup: ReflectionGroupHeader_reflectionGroup
  isExpanded?: boolean
  portalStatus: PortalStatus
  titleInputRef: RefObject<HTMLInputElement>
  dataCy?: string
}

const GroupHeader = styled('div')<{
  isExpanded: boolean
  isWidthExpanded: boolean
  portalStatus: PortalStatus
}>(({isExpanded, isWidthExpanded, portalStatus}) => ({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 1,
  fontSize: 14,
  justifyContent: 'space-between',
  margin: isExpanded ? `0 ${Gutters.COLUMN_INNER_GUTTER}` : undefined,
  maxWidth: isWidthExpanded ? ElementWidth.REFLECTION_CARD * 2 : ElementWidth.REFLECTION_CARD,
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

const PencilIcon = styled(Icon)<{isExpanded?: boolean}>(({isExpanded}) => ({
  color: isExpanded ? '#FFFFFF' : PALETTE.TEXT_GRAY,
  display: 'block',
  fontSize: ICON_SIZE.MD18,
  opacity: 0.5,
  marginRight: 4,
  textAlign: 'center',
  top: 1,
  '&:hover': {
    cursor: 'pointer'
  }
}))

const StyledTag = styled(BaseTag)<{dialogClosed: boolean}>(({dialogClosed}) => ({
  backgroundColor: dialogClosed ? PALETTE.BACKGROUND_GRAY : '#FFFFFF',
  color: dialogClosed ? '#FFFFFF' : PALETTE.TEXT_MAIN,
  marginRight: 4
}))

const ReflectionGroupHeader = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {meeting, reflectionGroup, titleInputRef, portalStatus, dataCy} = props
  const isExpanded = !!props.isExpanded
  const {
    localStage,
    localPhase: {phaseType}
  } = meeting
  const {prompt, reflections} = reflectionGroup
  const {isWidthExpanded} = prompt
  const canEdit = (phaseType === GROUP || phaseType === VOTE) && !localStage.isComplete
  const onClick = () => {
    titleInputRef.current && titleInputRef.current.select()
  }

  return (
    <GroupHeader
      data-cy={dataCy}
      portalStatus={portalStatus}
      isExpanded={isExpanded}
      isWidthExpanded={isWidthExpanded}
      ref={ref}
    >
      <ReflectionGroupTitleEditor
        isExpanded={isExpanded && portalStatus !== PortalStatus.Exiting}
        reflectionGroup={reflectionGroup}
        meeting={meeting}
        readOnly={!canEdit}
        titleInputRef={titleInputRef}
      />
      {phaseType === GROUP && (
        <IconGroup>
          {canEdit && (
            <PencilIcon isExpanded={isExpanded} onClick={onClick}>
              edit
            </PencilIcon>
          )}
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
      prompt {
        isWidthExpanded
      }
      reflections {
        id
      }
    }
  `
})
