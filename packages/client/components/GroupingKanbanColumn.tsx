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
  isLastColumn: boolean,
  maxSubColumnCount: number
}>(({isLengthExpanded, isWidthExpanded, isFirstColumn, isLastColumn, maxSubColumnCount}) => ({
  alignContent: 'flex-start',
  background: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  display: 'flex',
  flex: 1,
  flexDirection: isWidthExpanded ? 'row' : 'column',
  flexWrap: 'wrap',
  maxHeight: '100%',
  padding: isWidthExpanded ? '0 8px' : 0,
  position: 'relative',
  minWidth: isWidthExpanded ? ElementWidth.REFLECTION_COLUMN * maxSubColumnCount : ElementWidth.REFLECTION_COLUMN,
  transition: `all 100ms ${BezierCurve.DECELERATE}`,
  [makeMinWidthMediaQuery(Breakpoint.SINGLE_REFLECTION_COLUMN)]: {
    height: isLengthExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    margin: `0 ${isLastColumn ? 16 : 8}px 0px ${isFirstColumn ? 16 : 8}px`,
    maxWidth: isWidthExpanded ?  ElementWidth.REFLECTION_COLUMN * maxSubColumnCount  : ElementWidth.REFLECTION_COLUMN
  }
}))

const ColumnBody = styled('div')<{headerHeight: number, isDesktop: boolean; isWidthExpanded: boolean}>(
  ({headerHeight, isDesktop, isWidthExpanded, }) => ({
    alignContent: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxHeight: `calc(100% - ${headerHeight}px)`,
    justifyContent: 'space-around',
    minHeight: 200,
    overflowX: 'hidden',
    overflowY: 'auto',
    padding: `${isWidthExpanded ? 12 : 6}px ${isDesktop ? 12 : 8}px`,
    transition: `all 100ms ${BezierCurve.DECELERATE}`,
    width: ElementWidth.REFLECTION_COLUMN
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
  const columnRef = useRef<HTMLDivElement>(null)
  const columnBodyRef = useRef<HTMLDivElement>(null)
  const columnHeaderRef = useRef<HTMLDivElement>(null)
  const headerHeight = columnHeaderRef.current?.clientHeight || 0
  const [isWidthExpanded, maxSubColumnCount, toggleWidth] = useColumnWidth(reflectPromptsCount, columnBodyRef)
  const subColumnIndexes = isWidthExpanded ? [...Array(maxSubColumnCount).keys()] : [0]
  const isLengthExpanded =
    useCoverable(promptId, columnRef, MeetingControlBarEnum.HEIGHT, phaseRef, columnsRef) || !!endedAt
  const isFirstColumn = prompt.sortOrder === reflectPromptsCount - 1
  const isLastColumn = prompt.sortOrder === 0
  const groups = useDeepEqual(reflectionGroups)
  // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
  const filteredReflectionGroups = useMemo(
    () => groups.filter((group) => group.reflections.length > 0),
    [groups]
  )
  useSortSubColumns(isWidthExpanded, maxSubColumnCount, filteredReflectionGroups)
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
      maxSubColumnCount={maxSubColumnCount}
      ref={columnRef}
      data-cy={`group-column-${question}`}
    >
      <GroupingKanbanColumnHeader
        canAdd={canAdd}
        groupColor={groupColor}
        isWidthExpanded={isWidthExpanded}
        onClick={onClick}
        question={question}
        columnHeaderRef={columnHeaderRef}
        submitting={submitting}
        toggleWidth={toggleWidth}
      />
      {subColumnIndexes.map((subColumnIdx, idx) => {
        return (
          <ColumnBody
            data-cy={`group-column-${question}-body`}
            headerHeight={headerHeight}
            isDesktop={isDesktop}
            key={`${promptId}-${subColumnIdx}`}
            isWidthExpanded={isWidthExpanded}
            ref={idx === 0 ? columnBodyRef : undefined}
            {...{[DragAttribute.DROPZONE]: promptId}}
          >
            {filteredReflectionGroups
              .filter((group) => isWidthExpanded ? group.subColumnIdx === subColumnIdx : true)
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
      subColumnIdx
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
