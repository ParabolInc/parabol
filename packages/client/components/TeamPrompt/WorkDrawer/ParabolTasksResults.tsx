import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import {
  ParabolTasksResultsQuery,
  TaskStatusEnum
} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {taskStatusLabels} from '../../../utils/taskStatus'
import NullableTask from '../../NullableTask/NullableTask'

interface Props {
  queryRef: PreloadedQuery<ParabolTasksResultsQuery>
  selectedStatus: TaskStatusEnum
}

const ParabolTasksResults = (props: Props) => {
  const {queryRef, selectedStatus} = props
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

  const selectedTasks = tasks.edges
    .map((edge) => edge.node)
    .filter((task) => task.userId === atmosphere.viewerId)
    .filter((task) => task.status === selectedStatus)

  return (
    <div className='flex h-full flex-col items-center gap-y-2 overflow-auto px-4 pt-1 pb-4'>
      {selectedTasks.length > 0 ? (
        selectedTasks.map((task) => (
          <NullableTask
            className='w-full rounded-sm border border-solid border-slate-100'
            key={task.id}
            area={'userDash'}
            task={task}
          />
        ))
      ) : (
        <div className='-mt-14 flex h-full flex-col items-center justify-center'>
          <img className='w-20' src={halloweenRetrospectiveTemplate} />
          <div className='mt-7'>
            You don’t have any <b>{taskStatusLabels[selectedStatus]}</b> tasks.
            <br />
            Try adding new tasks below.
          </div>
        </div>
      )}
    </div>
  )
}

export default ParabolTasksResults
