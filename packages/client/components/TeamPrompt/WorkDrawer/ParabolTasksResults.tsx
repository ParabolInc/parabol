import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import type {
  ParabolTasksResultsQuery,
  TaskStatusEnum
} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {taskStatusLabels} from '../../../utils/taskStatus'
import NullableTask from '../../NullableTask/NullableTask'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  queryRef: PreloadedQuery<ParabolTasksResultsQuery>
  selectedStatuses: TaskStatusEnum[]
  dateRange: WorkDrawerDateRange | undefined
}

const ParabolTasksResults = (props: Props) => {
  const {queryRef, selectedStatuses, dateRange} = props
  const atmosphere = useAtmosphere()

  // :TODO: (jmtaber129): Add pagination of tasks.
  const query = usePreloadedQuery(
    graphql`
      query ParabolTasksResultsQuery($userId: ID!) {
        viewer {
          id
          tasks(first: 1000, userIds: [$userId])
            @connection(key: "UserColumnsContainer_tasks", filters: ["userIds"]) {
            edges {
              node {
                ...NullableTask_task
                id
                status
                updatedAt
                userId
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const {tasks} = query.viewer

  const startAt = dateRange ? new Date(dateRange.startAt).getTime() : null
  const endAt = dateRange ? new Date(dateRange.endAt).getTime() : null
  const selectedTasks = tasks.edges
    .map((edge) => edge.node)
    .filter((task) => task.userId === atmosphere.viewerId)
    .filter((task) => selectedStatuses.includes(task.status))
    .filter((task) => {
      if (startAt === null || endAt === null) return true
      const updatedAt = new Date(task.updatedAt).getTime()
      return updatedAt >= startAt && updatedAt <= endAt
    })

  return (
    <div className='flex flex-col items-center gap-y-2 px-4 pt-1 pb-4'>
      {selectedTasks.length > 0 ? (
        selectedTasks.map((task) => (
          <NullableTask
            className='w-full rounded-sm border border-slate-100 border-solid'
            key={task.id}
            area={'userDash'}
            task={task}
          />
        ))
      ) : (
        <div className='flex flex-col items-center pt-12'>
          <img className='w-20' src={halloweenRetrospectiveTemplate} />
          <div className='mt-7'>
            {selectedStatuses.length === 0 ? (
              <>Select a status to see your tasks.</>
            ) : (
              <>
                You don’t have any{' '}
                <b>{selectedStatuses.map((status) => taskStatusLabels[status]).join(', ')}</b> tasks
                in this range.
                <br />
                Try adding new tasks below.
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ParabolTasksResults
