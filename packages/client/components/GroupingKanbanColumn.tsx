import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {RefObject, useMemo, useRef} from 'react'
import {useFragment} from 'react-relay'
import {GroupingKanbanColumn_meeting$key} from '~/__generated__/GroupingKanbanColumn_meeting.graphql'
import {GroupingKanbanColumn_prompt$key} from '~/__generated__/GroupingKanbanColumn_prompt.graphql'
import {GroupingKanbanColumn_reflectionGroups$key} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import {useCoverable} from '~/hooks/useControlBarCovers'
import useDeepEqual from '~/hooks/useDeepEqual'
import useSubColumns from '~/hooks/useSubColumns'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import CreateReflectionMutation from '../mutations/CreateReflectionMutation'
import {BezierCurve, DragAttribute, ElementWidth, MeetingControlBarEnum} from '../types/constEnums'
import getNextSortOrder from '../utils/getNextSortOrder'
import {SwipeColumn} from './GroupingKanban'
import GroupingKanbanColumnHeader from './GroupingKanbanColumnHeader'
import ReflectionGroup from './ReflectionGroup/ReflectionGroup'

const ColumnScrollContainer = styled('div')({
  display: 'flex',
  // must hide X on firefox v84
  overflowX: 'hidden',
  overflowY: 'auto',
  height: '100%'
})

const ColumnBody = styled('div')<{isDesktop: boolean; isWidthExpanded: boolean}>(
  ({isDesktop, isWidthExpanded}) => ({
    alignContent: 'flex-start',
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    maxHeight: 'fit-content',
    minHeight: 200,
    padding: `${isWidthExpanded ? 12 : 6}px ${isDesktop ? 12 : 8}px`,
    transition: `all 100ms ${BezierCurve.DECELERATE}`,
    minWidth: ElementWidth.REFLECTION_COLUMN
  })
)

export type OpenSpotlight = (
  reflectionGroupId: string,
  reflectionRef: RefObject<HTMLDivElement>
) => void

interface Props {
  columnsRef: RefObject<HTMLDivElement>
  isAnyEditing: boolean
  isDesktop: boolean
  meeting: GroupingKanbanColumn_meeting$key
  openSpotlight: OpenSpotlight
  phaseRef: RefObject<HTMLDivElement>
  prompt: GroupingKanbanColumn_prompt$key
  reflectionGroups: GroupingKanbanColumn_reflectionGroups$key
  reflectPromptsCount: number
  swipeColumn?: SwipeColumn
  showDragHintAnimation?: boolean
}

const GroupingKanbanColumn = (props: Props) => {
  const {
    columnsRef,
    isAnyEditing,
    isDesktop,
    meeting: meetingRef,
    openSpotlight,
    reflectionGroups: reflectionGroupsRef,
    phaseRef,
    prompt: promptRef,
    reflectPromptsCount,
    swipeColumn,
    showDragHintAnimation
  } = props
  const meeting = useFragment(
    graphql`
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
    meetingRef
  )
  const reflectionGroups = useFragment(
    graphql`
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
    reflectionGroupsRef
  )
  const prompt = useFragment(
    graphql`
      fragment GroupingKanbanColumn_prompt on ReflectPrompt {
        id
        question
        groupColor
        sortOrder
      }
    `,
    promptRef
  )
  const {question, id: promptId, groupColor} = prompt
  const {id: meetingId, endedAt, localStage} = meeting
  const {isComplete, phaseType} = localStage
  const {submitting, onError, submitMutation, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const columnRef = useRef<HTMLDivElement>(null)
  const columnBodyRef = useRef<HTMLDivElement>(null)
  const isLengthExpanded =
    useCoverable(promptId, columnRef, MeetingControlBarEnum.HEIGHT, phaseRef, columnsRef) ||
    !!endedAt
  const groups = useDeepEqual(reflectionGroups)
  // group may be undefined because relay could GC before useMemo in the Kanban recomputes >:-(
  const filteredReflectionGroups = useMemo(
    () => groups.filter((group) => group.reflections.length > 0),
    [groups]
  )
  const [isWidthExpanded, subColumnIndexes, toggleWidth] = useSubColumns(
    columnBodyRef,
    phaseRef,
    reflectPromptsCount,
    filteredReflectionGroups,
    columnsRef
  )
  const canAdd = phaseType === 'group' && !isComplete && !isAnyEditing

  const onClick = () => {
    if (submitting || isAnyEditing) return
    const input = {
      content: undefined,
      meetingId,
      promptId,
      sortOrder: getNextSortOrder(filteredReflectionGroups)
    }
    submitMutation()
    CreateReflectionMutation(atmosphere, {input}, {onError, onCompleted})
  }
  return (
    <div
      className={`relative mr-2 ml-2 flex h-full min-w-[320px] flex-1 flex-col content-start rounded-lg bg-slate-300 p-0 transition-all duration-100 ease-out first-of-type:ml-4 last-of-type:mr-4 single-reflection-column:max-w-min ${isLengthExpanded ? '' : 'single-reflection-column:h-[calc(100%-56px)]'} max-w-min`}
      ref={columnRef}
      data-cy={`group-column-${question}`}
    >
      <GroupingKanbanColumnHeader
        canAdd={canAdd}
        groupColor={groupColor}
        isWidthExpanded={isWidthExpanded}
        onClick={onClick}
        question={question}
        phaseType={phaseType}
        submitting={submitting}
        toggleWidth={toggleWidth}
      />
      <ColumnScrollContainer>
        {subColumnIndexes.map((subColumnIdx) => {
          return (
            <ColumnBody
              data-cy={subColumnIdx === 0 ? `group-column-${question}-body` : undefined}
              isDesktop={isDesktop}
              isWidthExpanded={isWidthExpanded}
              key={`${promptId}-${subColumnIdx}`}
              ref={subColumnIdx === 0 ? columnBodyRef : undefined}
              {...{[DragAttribute.DROPZONE]: `${promptId}-${subColumnIdx}`}}
            >
              {filteredReflectionGroups
                .filter((group) => (isWidthExpanded ? group.subColumnIdx === subColumnIdx : true))
                .map((reflectionGroup, idx) => {
                  return (
                    <ReflectionGroup
                      dataCy={`${question}-group-${idx}`}
                      key={reflectionGroup.id}
                      meetingRef={meeting}
                      openSpotlight={openSpotlight}
                      phaseRef={phaseRef}
                      reflectionGroupRef={reflectionGroup}
                      swipeColumn={swipeColumn}
                      showDragHintAnimation={
                        showDragHintAnimation && subColumnIdx === 0 && idx === 0
                      }
                    />
                  )
                })}
            </ColumnBody>
          )
        })}
      </ColumnScrollContainer>
    </div>
  )
}

export default GroupingKanbanColumn
