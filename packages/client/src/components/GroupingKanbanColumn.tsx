import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useCoverable} from 'parabol-client/src/hooks/useControlBarCovers'
import React, {RefObject, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import {GroupingKanbanColumn_meeting} from 'parabol-client/src/__generated__/GroupingKanbanColumn_meeting.graphql'
import {GroupingKanbanColumn_prompt} from 'parabol-client/src/__generated__/GroupingKanbanColumn_prompt.graphql'
import {GroupingKanbanColumn_reflectionGroups} from 'parabol-client/src/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import {PALETTE} from '../styles/paletteV2'
import {
  BezierCurve,
  DragAttribute,
  ElementWidth,
  Gutters,
  MeetingControlBarEnum
} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import getNextSortOrder from '../utils/getNextSortOrder'
import FlatButton from './FlatButton'
import {SwipeColumn} from './GroupingKanban'
import Icon from './Icon'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import RetroPrompt from './RetroPrompt'

const Column = styled('div')<{isDesktop: boolean; isExpanded: boolean}>(
  ({isDesktop, isExpanded}) => ({
    alignItems: 'center',
    background: PALETTE.BACKGROUND_REFLECTION,
    borderRadius: 8,
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    margin: isDesktop ? '0 8px' : undefined,
    minWidth: isDesktop ? 320 : undefined,
    position: 'relative',
    transition: `height 100ms ${BezierCurve.DECELERATE}`
  })
)

const ColumnHeader = styled('div')({
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  justifyContent: 'space-between',
  lineHeight: '24px',
  margin: '0 auto',
  maxWidth: ElementWidth.REFLECTION_CARD_PADDED,
  padding: `12px 0 0 ${Gutters.REFLECTION_INNER_GUTTER_HORIZONTAL}`,
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
  marginRight: 8
})

const AddReflectionButton = styled(FlatButton)({
  border: 0,
  height: 24,
  lineHeight: '24px',
  padding: 0,
  width: 24
})

interface Props {
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
  swipeColumn?: SwipeColumn
}

const GroupingKanbanColumn = (props: Props) => {
  const {isDesktop, meeting, reflectionGroups, phaseRef, prompt, swipeColumn} = props
  const {question, id: promptId} = prompt
  const {id: meetingId, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const onClick = () => {
    if (submitting) return
    const input = {
      content: undefined,
      meetingId,
      retroPhaseItemId: promptId,
      sortOrder: getNextSortOrder(reflectionGroups)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }
  const ref = useRef<HTMLDivElement>(null)
  const canAdd = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  const isExpanded = useCoverable(promptId, ref, MeetingControlBarEnum.HEIGHT)
  return (
    <Column
      isExpanded={isExpanded}
      data-cy={`group-column-${question}`}
      isDesktop={isDesktop}
      ref={ref}
    >
      <ColumnHeader>
        <Prompt>{question}</Prompt>
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
    fragment GroupingKanbanColumn_prompt on RetroPhaseItem {
      id
      question
    }
  `
})
