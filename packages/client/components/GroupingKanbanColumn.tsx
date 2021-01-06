import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import React, {RefObject, useRef, useMemo} from 'react'
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
  MeetingControlBarEnum,
  SubColumn
} from '../types/constEnums'
import {NewMeetingPhaseTypeEnum} from '../types/graphql'
import getNextSortOrder from '../utils/getNextSortOrder'
import {SwipeColumn} from './GroupingKanban'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'
import GroupingKanbanColumnHeader from './GroupingKanbanColumnHeader'
import useSortSubColumns from '~/hooks/useSortSubColumns'
import useColumnWidth from '~/hooks/useColumnWidth'
import useDeepEqual from '~/hooks/useDeepEqual'

const Column = styled('div')<{
  isLengthExpanded: boolean
  isWidthExpanded: boolean
  isFirstColumn: boolean
  isLastColumn: boolean
}>(({isLengthExpanded, isWidthExpanded, isFirstColumn, isLastColumn}) => ({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  display: 'flex',
  flex: 1,
  flexDirection: isWidthExpanded ? 'row' : 'column',
  flexWrap: 'wrap',
  height: '100%',
  padding: isWidthExpanded ? '0 8px' : 0,
  position: 'relative',
  transition: `all 100ms ${BezierCurve.DECELERATE}`,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    height: isLengthExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    margin: `0 ${isLastColumn ? 16 : 8}px 0px ${isFirstColumn ? 16 : 8}px`,
    maxWidth: isWidthExpanded
      ? ElementWidth.REFLCTION_COLUMN_EXPANDED
      : ElementWidth.REFLECTION_COLUMN
  }
}))

const ColumnBody = styled('div')<{isDesktop: boolean; isWidthExpanded: boolean}>(
  ({isDesktop, isWidthExpanded}) => ({
    alignContent: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: '100%',
    justifyContent: 'space-around',
    maxHeight: 'fit-content',
    minHeight: 200,
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: `${isWidthExpanded ? 12 : 6}px ${isDesktop ? 12 : 8}px`,
    transition: `all 100ms ${BezierCurve.DECELERATE}`,
    width: isWidthExpanded ? ElementWidth.REFLCTION_COLUMN_EXPANDED : ElementWidth.REFLECTION_COLUMN
  })
)

interface Props {
  columnsRef: RefObject<HTMLDivElement>
  isAnyEditing: boolean
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
  reflectPromptsCount: number
  swipeColumn?: SwipeColumn
}

const GroupingKanbanColumn = (props: Props) => {
  const {
    columnsRef,
    isAnyEditing,
    isDesktop,
    meeting,
    reflectionGroups,
    phaseRef,
    prompt,
    reflectPromptsCount,
    swipeColumn
  } = props
  const {question, id: promptId, groupColor} = prompt
  const {id: meetingId, endedAt, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const [isWidthExpanded, toggleWidth] = useColumnWidth(reflectPromptsCount)
  const subColumns = isWidthExpanded ? [SubColumn.LEFT, SubColumn.RIGHT] : ['']
  const ref = useRef<HTMLDivElement>(null)
  const isLengthExpanded =
    useCoverable(promptId, ref, MeetingControlBarEnum.HEIGHT, phaseRef, columnsRef) || !!endedAt
  const isFirstColumn = prompt.sortOrder === reflectPromptsCount - 1
  const isLastColumn = prompt.sortOrder === 0
  const groups = useDeepEqual(reflectionGroups)
  // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
  const filteredReflectionGroups = useMemo(
    () => groups.filter((group) => group.reflections.length > 0),
    [groups]
  )
  useSortSubColumns(isWidthExpanded, filteredReflectionGroups)
  const canAdd = phaseType === NewMeetingPhaseTypeEnum.group && !isComplete && !isAnyEditing

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

  return (
    <Column
      isLengthExpanded={isLengthExpanded}
      isWidthExpanded={isWidthExpanded}
      isFirstColumn={isFirstColumn}
      isLastColumn={isLastColumn}
      data-cy={`group-column-${question}`}
      ref={ref}
    >
      <GroupingKanbanColumnHeader
        canAdd={canAdd}
        groupColor={groupColor}
        isWidthExpanded={isWidthExpanded}
        onClick={onClick}
        question={question}
        submitting={submitting}
        toggleWidth={toggleWidth}
      />
      {subColumns.map((subColumn) => {
        return (
          <ColumnBody
            data-cy={`group-column-${question}-body`}
            isDesktop={isDesktop}
            key={`${promptId}-${subColumn}`}
            isWidthExpanded={isWidthExpanded}
            {...{[DragAttribute.DROPZONE]: promptId}}
          >
            {filteredReflectionGroups
              .filter((group) => (isWidthExpanded ? group.subColumn === subColumn : true))
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
        )
      })}
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
      reflections {
        id
      }
      sortOrder
      subColumn
    }
  `,
  prompt: graphql`
    fragment GroupingKanbanColumn_prompt on ReflectPrompt {
      id
      question
      groupColor
      sortOrder
    }
  `
})
