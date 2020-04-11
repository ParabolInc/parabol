import React, {RefObject, useRef} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {GroupingKanbanColumn_reflectionGroups} from '__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import {GroupingKanbanColumn_meeting} from '__generated__/GroupingKanbanColumn_meeting.graphql'
import {BezierCurve, DragAttribute, ElementWidth, Gutters} from '../types/constEnums'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import {GroupingKanbanColumn_prompt} from '__generated__/GroupingKanbanColumn_prompt.graphql'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import FlatButton from './FlatButton'
import RetroPrompt from './RetroPrompt'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import getNextSortOrder from '../utils/getNextSortOrder'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'
import {SwipeColumn} from './GroupingKanban'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'

// TODO share with TaskColumn
const Column = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  margin: isDesktop ? '0 8px' : undefined,
  minWidth: isDesktop ? 320 : undefined,
  position: 'relative',
  transition: `background 300ms ${BezierCurve.DECELERATE}`
}))

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
      sortOrder: getNextSortOrder(reflectionGroups),
      // TODO
      isAnonymous: true
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }
  const ref = useRef<HTMLDivElement>(null)
  const canAdd = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete
  return (
    <Column data-cy={`group-column-${question}`} isDesktop={isDesktop} ref={ref}>
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
