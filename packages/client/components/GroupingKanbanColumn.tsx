import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {useCoverable} from '~/hooks/useControlBarCovers'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {GroupingKanbanColumn_meeting} from '~/__generated__/GroupingKanbanColumn_meeting.graphql'
import {GroupingKanbanColumn_prompt} from '~/__generated__/GroupingKanbanColumn_prompt.graphql'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import {PALETTE} from '../styles/paletteV2'
import {
  BezierCurve,
  Breakpoint,
  DragAttribute,
  ElementWidth,
  MeetingControlBarEnum
} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import getNextSortOrder from '../utils/getNextSortOrder'
import FlatButton from './FlatButton'
import {SwipeColumn} from './GroupingKanban'
import Icon from './Icon'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import RetroPrompt from './RetroPrompt'

const Column = styled('div')<{isExpanded: boolean}>(({isExpanded}) => ({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  transition: `height 100ms ${BezierCurve.DECELERATE}`,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    margin: '0 8px',
    minWidth: 320
  }
}))

const ColumnHeader = styled('div')({
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  justifyContent: 'space-between',
  lineHeight: '24px',
  margin: '0 auto',
  maxWidth: ElementWidth.REFLECTION_CARD_PADDED,
  paddingTop: 12,
  width: '100%'
})

const ColumnBody = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  flex: 1,
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  minHeight: 200,
  padding: isDesktop ? '6px 12px' : '6px 8px',
  width: 'fit-content'
}))

const Prompt = styled(RetroPrompt)({
  alignItems: 'center',
  display: 'flex',
  marginRight: 8
})

const ColumnColorDrop = styled('div')<{groupColor: string}>(({groupColor}) => ({
  backgroundColor: groupColor,
  borderRadius: '50%',
  boxShadow: `0 0 0 1px ${PALETTE.BACKGROUND_MAIN}`,
  marginRight: 8,
  height: 8,
  width: 8
}))

const AddReflectionButton = styled(FlatButton)({
  border: 0,
  height: 24,
  lineHeight: '24px',
  padding: 0,
  width: 24
})

interface Props {
  isAnyEditing: boolean
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
  swipeColumn?: SwipeColumn
}

const GroupingKanbanColumn = (props: Props) => {
  const {isAnyEditing, isDesktop, meeting, reflectionGroups, phaseRef, prompt, swipeColumn} = props
  const {question, id: promptId, groupColor} = prompt
  const {id: meetingId, endedAt, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onClick = () => {
    if (submitting || isAnyEditing) return

    const input = {
      content: undefined,
      meetingId,
      promptId,
      sortOrder: getNextSortOrder(reflectionGroups)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }
  const ref = useRef<HTMLDivElement>(null)
  const canAdd = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete && !isAnyEditing
  const isExpanded =
    useCoverable(promptId, ref, MeetingControlBarEnum.HEIGHT, phaseRef) || !!endedAt
  return (
    <Column isExpanded={isExpanded} data-cy={`group-column-${question}`} ref={ref}>
      <ColumnHeader>
        <Prompt>
          <ColumnColorDrop groupColor={groupColor} />
          {question}
        </Prompt>
        {canAdd && (
          <AddReflectionButton
            dataCy={`add-reflection-${question}`}
            aria-label={'Add a reflection'}
            onClick={onClick}
            waiting={submitting}
          >
            <Icon>add</Icon>
          </AddReflectionButton>
        )}
      </ColumnHeader>
      <ColumnBody
        data-cy={`group-column-${question}-body`}
        isDesktop={isDesktop}
        {...{[DragAttribute.DROPZONE]: promptId}}
      >
        {reflectionGroups
          .filter((group) => {
            // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
            return group && group.reflections.length > 0
          })
          .map((reflectionGroup, idx) => {
            return (
              <ReflectionGroup
                dataCy={`${question}-group-${idx}`}
                key={reflectionGroup.id}
                meeting={meeting}
                phaseRef={phaseRef}
                reflectionGroup={reflectionGroup}
                swipeColumn={swipeColumn}
              />
            )
          })}
      </ColumnBody>
    </Column>
  )
}

export default createFragmentContainer(GroupingKanbanColumn, {
  meeting: graphql`
    fragment GroupingKanbanColumn_meeting on RetrospectiveMeeting {
      ...ReflectionGroup_meeting
      id
      endedAt
      localStage {
        isComplete
        phaseType
      }
      phases {
        stages {
          isComplete
          phaseType
        }
      }
    }
  `,
  reflectionGroups: graphql`
    fragment GroupingKanbanColumn_reflectionGroups on RetroReflectionGroup @relay(plural: true) {
      ...ReflectionGroup_reflectionGroup
      id
      sortOrder
      reflections {
        id
      }
    }
  `,
  prompt: graphql`
    fragment GroupingKanbanColumn_prompt on ReflectPrompt {
      id
      question
      groupColor
    }
  `
})
