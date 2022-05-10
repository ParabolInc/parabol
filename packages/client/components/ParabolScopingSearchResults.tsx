import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {PreloadedQuery, useFragment, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import useGetUsedServiceTaskIds from '~/hooks/useGetUsedServiceTaskIds'
import useMutationProps from '~/hooks/useMutationProps'
import CreateTaskMutation from '~/mutations/CreateTaskMutation'
import dndNoise from '~/utils/dndNoise'
import useAtmosphere from '../hooks/useAtmosphere'
import useLoadNextOnScrollBottom from '../hooks/useLoadNextOnScrollBottom'
import {ParabolScopingSearchResultsPaginationQuery} from '../__generated__/ParabolScopingSearchResultsPaginationQuery.graphql'
import {ParabolScopingSearchResultsQuery} from '../__generated__/ParabolScopingSearchResultsQuery.graphql'
import {ParabolScopingSearchResults_meeting$key} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import {ParabolScopingSearchResults_query$key} from '../__generated__/ParabolScopingSearchResults_query.graphql'
import IntegrationScopingNoResults from './IntegrationScopingNoResults'
import NewIntegrationRecordButton from './NewIntegrationRecordButton'
import ParabolScopingSearchResultItem from './ParabolScopingSearchResultItem'
import ParabolScopingSelectAllTasks from './ParabolScopingSelectAllTasks'

const ResultScroller = styled('div')({
  overflow: 'auto'
})
interface Props {
  queryRef: PreloadedQuery<ParabolScopingSearchResultsQuery>
  meetingRef: ParabolScopingSearchResults_meeting$key
}

const ParabolScopingSearchResults = (props: Props) => {
  const {queryRef, meetingRef} = props
  const viewerRef = usePreloadedQuery<ParabolScopingSearchResultsQuery>(
    graphql`
      query ParabolScopingSearchResultsQuery(
        $first: Int!
        $after: DateTime
        $userIds: [ID!]
        $teamIds: [ID!]
        $statusFilters: [TaskStatusEnum!]
        $filterQuery: String
      ) {
        ...ParabolScopingSearchResults_query
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )

  const meeting = useFragment(
    graphql`
      fragment ParabolScopingSearchResults_meeting on PokerMeeting {
        id
        phases {
          phaseType
          ...useGetUsedServiceTaskIds_phase
        }
        teamId
      }
    `,
    meetingRef
  )
  const paginationRes = usePaginationFragment<
    ParabolScopingSearchResultsPaginationQuery,
    ParabolScopingSearchResults_query$key
  >(
    graphql`
      fragment ParabolScopingSearchResults_query on Query
      @refetchable(queryName: "ParabolScopingSearchResultsPaginationQuery") {
        viewer {
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
      }
    `,
    viewerRef
  )
  const {data} = paginationRes
  const {viewer} = data
  const tasks = viewer?.tasks ?? null
  const incomingEdges = tasks?.edges ?? null
  const [edges, setEdges] = useState([] as readonly any[])
  const [isEditing, setIsEditing] = useState(false)
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 50)

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

export default ParabolScopingSearchResults
