import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {
  type PreloadedQuery,
  useFragment,
  usePaginationFragment,
  usePreloadedQuery
} from 'react-relay'
import type {TeamArchive_team$key} from '~/__generated__/TeamArchive_team.graphql'
import getSafeRegex from '~/utils/getSafeRegex'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import type {TeamArchive_query$key} from '../../../../__generated__/TeamArchive_query.graphql'
import type {TeamArchiveArchivedTasksQuery} from '../../../../__generated__/TeamArchiveArchivedTasksQuery.graphql'
import type {TeamArchiveQuery} from '../../../../__generated__/TeamArchiveQuery.graphql'
import NullableTask from '../../../../components/NullableTask/NullableTask'
import useLoadNextOnScrollBottom from '../../../../hooks/useLoadNextOnScrollBottom'
import UserTasksHeader from '../../../userDashboard/components/UserTasksHeader/UserTasksHeader'
import getRallyLink from '../../../userDashboard/helpers/getRallyLink'
import TeamArchiveHeader from '../TeamArchiveHeader/TeamArchiveHeader'

interface Props {
  queryRef: PreloadedQuery<TeamArchiveQuery>
  returnToTeamId?: string
  teamRef?: TeamArchive_team$key
}

const TeamArchive = (props: Props) => {
  const {returnToTeamId, queryRef, teamRef} = props
  const queryData = usePreloadedQuery<TeamArchiveQuery>(
    graphql`
      query TeamArchiveQuery($first: Int!, $after: DateTime, $userIds: [ID!], $teamIds: [ID!]) {
        ...TeamArchive_query
      }
    `,
    queryRef
  )

  const paginationRes = usePaginationFragment<TeamArchiveArchivedTasksQuery, TeamArchive_query$key>(
    graphql`
      fragment TeamArchive_query on Query @refetchable(queryName: "TeamArchiveArchivedTasksQuery") {
        viewer {
          ...UserTasksHeader_viewer
          dashSearch
          archivedTasks: tasks(
            first: $first
            after: $after
            userIds: $userIds
            teamIds: $teamIds
            archived: true
          ) @connection(key: "TeamArchive_archivedTasks", filters: ["userIds", "teamIds"]) {
            edges {
              cursor
              node {
                id
                teamId
                userId
                content
                plaintextContent
                ...NullableTask_task
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
    queryData
  )

  const {data, hasNext} = paginationRes
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 40)
  const {viewer} = data
  const team = useFragment(
    graphql`
      fragment TeamArchive_team on Team {
        teamMemberFilter {
          id
        }
        teamMembers(sortBy: "preferredName") {
          id
        }
      }
    `,
    teamRef || null
  )

  const {teamMembers, teamMemberFilter} = team || {}
  const teamMemberFilterId = (teamMemberFilter && teamMemberFilter.id) || null
  const {archivedTasks, dashSearch} = viewer

  const teamMemberFilteredTasks = useMemo(() => {
    const edges = teamMemberFilterId
      ? archivedTasks?.edges.filter((edge) => {
          return (
            edge.node.userId &&
            toTeamMemberId(edge.node.teamId, edge.node.userId) === teamMemberFilterId
          )
        })
      : archivedTasks.edges
    return {...archivedTasks, edges: edges}
  }, [archivedTasks?.edges, teamMemberFilterId, teamMembers])

  const filteredTasks = useMemo(() => {
    if (!dashSearch) return teamMemberFilteredTasks
    const dashSearchRegex = getSafeRegex(dashSearch, 'i')
    const filteredEdges = teamMemberFilteredTasks.edges.filter((edge) =>
      edge.node.plaintextContent.match(dashSearchRegex)
    )
    return {...teamMemberFilteredTasks, edges: filteredEdges}
  }, [dashSearch, teamMemberFilteredTasks])

  const {edges} = filteredTasks

  return (
    <>
      {!returnToTeamId && <UserTasksHeader viewerRef={viewer} />}
      <div className='flex w-full flex-1 flex-col overflow-hidden'>
        {returnToTeamId && (
          <div className='pl-5'>
            <TeamArchiveHeader teamId={returnToTeamId} />
            <div className='w-full border-slate-300 border-t' />
          </div>
        )}
        <div className='mx-auto w-full max-w-[1360px] flex-1 overflow-auto p-4'>
          {edges.length ? (
            <>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] items-start gap-4'>
                {edges.map((edge) => (
                  <div key={edge.node.id}>
                    <NullableTask area='teamDash' task={edge.node} />
                  </div>
                ))}
              </div>
              {!hasNext && (
                <div className='mx-auto mt-4 w-fit rounded border border-slate-400 bg-white p-4 text-sm'>
                  {'🎉'} That's all folks! There are no further tasks in the archive.
                </div>
              )}
              {lastItem}
            </>
          ) : (
            <div className='mt-4 rounded border border-slate-400 bg-white p-4 text-sm'>
              {'🤓'}
              {' Hi there! There are zero archived tasks. '}
              {'Nothing to see here. How about a fun rally video? '}
              <span className='text-aqua-400'>{getRallyLink()}!</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default TeamArchive
