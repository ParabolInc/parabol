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
import {NewMeetingPhaseTypeEnum} from '~/types/graphql'
import NewParabolTaskButton from './NewParabolTaskButton'
import NewParabolTaskInput from './NewParabolTaskInput'

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

  if (edges.length === 0)
    return viewer ? <IntegrationScopingNoResults msg={'No tasks match that query'} /> : null

  return (
    <>
      <ParabolScopingSelectAllTasks
        usedParabolTaskIds={usedParabolTaskIds}
        tasks={edges}
        meetingId={meetingId}
      />
      <ResultScroller>
        <NewParabolTaskInput
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
        {edges.map(({node}) => {
          return (
            <ParabolScopingSearchResultItem
              key={node.id}
              task={node}
              meetingId={meeting.id}
              isSelected={usedParabolTaskIds.has(node.id)}
            />
          )
        })}
        {lastItem}
      </ResultScroller>
      {!isEditing && <NewParabolTaskButton setIsEditing={setIsEditing} />}
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
