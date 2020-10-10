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
  const lastItem = useLoadMoreOnScrollBottom(relay, {}, 50)
  useEffect(() => {
    if (incomingEdges) setEdges(incomingEdges)
  }, [incomingEdges])
  const {id: meetingId, phases} = meeting
  const usedParabolTaskIds = useRecordIdsWithStages(
    phases,
    NewMeetingPhaseTypeEnum.ESTIMATE,
    'task'
  )

  if (edges.length === 0)
    return viewer ? <IntegrationScopingNoResults msg={'No tasks match that query'} /> : null

  return (
    <>
      <ParabolScopingSelectAllTasks
        usedParabolTaskIds={usedParabolTaskIds}
        tasks={edges}
        meetingId={meetingId}
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
          ... on EstimatePhase {
            stages {
              ... on EstimateStageParabol {
                task {
                  id
                }
              }
            }
          }
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
          status: $status
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
        $status: TaskStatusEnum
        $filterQuery: String
      ) {
        viewer {
          ...ParabolScopingSearchResults_viewer
        }
      }
    `
  }
)
