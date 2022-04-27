import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useLoadMoreOnScrollBottom from '~/hooks/useLoadMoreOnScrollBottom'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import dndNoise from '~/utils/dndNoise'
import useAtmosphere from '../hooks/useAtmosphere'
import {ParabolScopingSearchResults_meeting} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import {ParabolScopingSearchResults_viewer} from '../__generated__/ParabolScopingSearchResults_viewer.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ParabolScopingSearchResultItem from './ParabolScopingSearchResultItem'
import ParabolScopingSelectAllTasks from './ParabolScopingSelectAllTasks'

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
    if (!incomingEdges) return
    const unintegratedTaskEdges = incomingEdges.filter(
      (edge) => edge.node && !edge.node.integrationHash
    )
    setEdges(unintegratedTaskEdges)
  }, [incomingEdges])
  const {id: meetingId, phases, teamId} = meeting
  const estimatePhase = phases.find(({phaseType}) => phaseType === 'ESTIMATE')!
  const usedServiceTaskIds = useGetUsedServiceTaskIds(estimatePhase)
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const addTask = () => {
    const {viewerId} = atmosphere
    const newTask = {
      status: 'active',
      sortOrder: dndNoise(),
      meetingId,
      userId: viewerId,
      teamId
    } as const
    CreateTaskMutation(atmosphere, {newTask}, {onError, onCompleted})
  }

  const handleAddTaskClick = () => {
    setIsEditing(true)
    addTask()
  }

  if (edges.length === 0 && !isEditing)
    return viewer ? (
      <>
        <IntegrationScopingNoResults msg={'No tasks match that query'} />
        <NewIntegrationRecordButton labelText={'New Task'} onClick={handleAddTaskClick} />
      </>
    ) : null

  return (
    <>
      <ParabolScopingSelectAllTasks
        usedServiceTaskIds={usedServiceTaskIds}
        tasks={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        {edges.map(({node}) => {
          return (
            <ParabolScopingSearchResultItem
              key={node.id}
              task={node}
              meetingId={meetingId}
              usedServiceTaskIds={usedServiceTaskIds}
              teamId={teamId}
              setIsEditing={setIsEditing}
            />
          )
        })}
        {lastItem}
      </ResultScroller>
      {!isEditing && (
        <NewIntegrationRecordButton labelText={'New Task'} onClick={handleAddTaskClick} />
      )}
    </>
  )
}

// TODO: migrate Pagination Container → usePaginationFragment
export default createPaginationContainer(
  ParabolScopingSearchResults,
  {
    meeting: graphql`
      fragment ParabolScopingSearchResults_meeting on PokerMeeting {
        id
        phases {
          phaseType
          ...useGetUsedServiceTaskIds_phase
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
              integrationHash
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
    getConnectionFromProps({viewer}) {
      return viewer?.tasks
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
