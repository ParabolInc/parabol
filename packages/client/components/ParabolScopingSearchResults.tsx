import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import {ParabolScopingSearchResults_viewer} from '../__generated__/ParabolScopingSearchResults_viewer.graphql'
import {ParabolScopingSearchResults_meeting} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import ParabolScopingSelectAllTasks from './ParabolScopingSelectAllTasks'
import ParabolScopingSearchResultItem from './ParabolScopingSearchResultItem'
import useLoadMoreOnScrollBottom from '~/hooks/useLoadMoreOnScrollBottom'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import useRecordIdsWithStages from '~/hooks/useRecordIdsWithStages'
import {NewMeetingPhaseTypeEnum, TaskStatusEnum} from '~/types/graphql'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import useAtmosphere from '~/hooks/useAtmosphere'
import dndNoise from '~/utils/dndNoise'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import useMutationProps from '~/hooks/useMutationProps'

const ResultScroller = styled('div')({
  overflow: 'auto'
})
interface Props {
  relay: RelayPaginationProp
  viewer: ParabolScopingSearchResults_viewer | null
  meeting: ParabolScopingSearchResults_meeting
}

const ParabolScopingSearchResults = (props: Props) => {
  const {viewer, meeting, relay} = props
  const tasks = viewer?.tasks ?? null
  const incomingEdges = tasks?.edges ?? null
  const [edges, setEdges] = useState([] as readonly any[])
  const [isEditing, setIsEditing] = useState(false)
  const lastItem = useLoadMoreOnScrollBottom(relay, {}, 50)
  useEffect(() => {
    if (incomingEdges) setEdges(incomingEdges)
  }, [incomingEdges])
  const {id: meetingId, phases} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === NewMeetingPhaseTypeEnum.ESTIMATE)
  const usedParabolTaskIds = useRecordIdsWithStages(estimatePhase)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const addTask = () => {
    const {viewerId} = atmosphere
    const newTask = {
      status: TaskStatusEnum.active,
      sortOrder: dndNoise(),
      meetingId,
      userId: viewerId,
      teamId: meeting.teamId,
    }
    CreateTaskMutation(
      atmosphere,
      {newTask},
      {onError, onCompleted}
    )
  }

  const handleAddTaskClick = () => {
    setIsEditing(true)
    addTask()
  }

  if (edges.length === 0 && !isEditing)
    return viewer ?
      <>
        <IntegrationScopingNoResults msg={'No tasks match that query'} />
        <NewIntegrationRecordButton
          labelText={'New Task'}
          onClick={handleAddTaskClick}
        />
      </>
      :
      null

  return (
    <>
      <ParabolScopingSelectAllTasks
        usedParabolTaskIds={usedParabolTaskIds}
        tasks={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        {edges.map(({node}) => {
          return (
            <ParabolScopingSearchResultItem
              key={node.id}
              task={node}
              meetingId={meeting.id}
              isSelected={usedParabolTaskIds.has(node.id)}
              teamId={meeting.teamId}
              setIsEditing={setIsEditing}
            />
          )
        })}
        {lastItem}
      </ResultScroller>
      {!isEditing &&
      <NewIntegrationRecordButton
        labelText={'New Task'}
        onClick={handleAddTaskClick}
      />
      }
    </>
  )
}

export default createPaginationContainer(
  ParabolScopingSearchResults,
  {
    meeting: graphql`
      fragment ParabolScopingSearchResults_meeting on PokerMeeting {
        id
        phases {
          phaseType
          ...useRecordIdsWithStages_phase
        }
        teamId
      }
    `,
    viewer: graphql`
      fragment ParabolScopingSearchResults_viewer on User {
        tasks(
          first: $first
          after: $after
          userIds: $userIds
          teamIds: $teamIds
          archived: false
          statusFilters: $statusFilters
          filterQuery: $filterQuery
        ) @connection(key: "ParabolScopingSearchResults_tasks") {
          edges {
            ...ParabolScopingSelectAllTasks_tasks
            cursor
            node {
              ...ParabolScopingSearchResultItem_task
              id
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.tasks
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query ParabolScopingSearchResultsPaginationQuery(
        $first: Int!
        $after: DateTime
        $teamIds: [ID!]
        $userIds: [ID!]
        $statusFilters: [TaskStatusEnum!]
        $filterQuery: String
      ) {
        viewer {
          ...ParabolScopingSearchResults_viewer
        }
      }
    `
  }
)
