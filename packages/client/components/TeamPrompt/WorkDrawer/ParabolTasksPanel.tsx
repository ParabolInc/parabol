import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {
  ParabolTasksPanel_user$key,
  TaskStatusEnum
} from '../../../__generated__/ParabolTasksPanel_user.graphql'
import {ParabolTasksPanel_meeting$key} from '../../../__generated__/ParabolTasksPanel_meeting.graphql'
import {TaskStatus} from '../../../types/constEnums'
import {meetingColumnArray} from '../../../utils/constants'
import {taskStatusLabels} from '../../../utils/taskStatus'
import useAtmosphere from '../../../hooks/useAtmosphere'
import CreateTaskMutation from '../../../mutations/CreateTaskMutation'
import dndNoise from '../../../utils/dndNoise'
import NullableTask from '../../NullableTask/NullableTask'
import halloweenRetrospectiveTemplate from '../../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import AddTaskButton from '../../AddTaskButton'
import clsx from 'clsx'

interface Props {
  userRef: ParabolTasksPanel_user$key
  meetingRef: ParabolTasksPanel_meeting$key
}

const ParabolTasksPanel = (props: Props) => {
  const {userRef, meetingRef} = props
  const user = useFragment(
    graphql`
      fragment ParabolTasksPanel_user on User @argumentDefinitions(userIds: {type: "[ID!]"}) {
        id
        tasks(first: 1000, after: $after, userIds: $userIds)
          @connection(key: "UserColumnsContainer_tasks", filters: ["userIds"]) {
          edges {
            node {
              ...NullableTask_task
              id
              status
            }
          }
        }
      }
    `,
    userRef
  )

  const meeting = useFragment(
    graphql`
      fragment ParabolTasksPanel_meeting on TeamPromptMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )

  const {id: userId, tasks} = user

  const atmosphere = useAtmosphere()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusEnum>(TaskStatus.DONE)
  const selectedTasks = tasks.edges
    .map((edge) => edge.node)
    .filter((task) => task.status === selectedStatus)

  const handleAddTask = () => {
    CreateTaskMutation(
      atmosphere,
      {
        newTask: {
          status: selectedStatus,
          meetingId: meeting.id,
          teamId: meeting.teamId,
          userId,
          sortOrder: dndNoise()
        }
      },
      {}
    )
  }

  return (
    <>
      <div>
        <div className='my-4 flex gap-2 px-4'>
          {meetingColumnArray.map((status) => (
            <div
              key={status}
              className={clsx(
                'flex-shrink-0 cursor-pointer rounded-full py-2 px-4 text-sm leading-3 text-slate-800',
                status === selectedStatus
                  ? 'bg-grape-700 font-semibold text-white focus:text-white'
                  : 'border border-slate-300 bg-white'
              )}
              onClick={() => setSelectedStatus(status)}
            >
              {taskStatusLabels[status]}
            </div>
          ))}
        </div>
      </div>
      <div className='flex h-full flex-col items-center gap-y-2 overflow-auto px-4 pt-1 pb-4'>
        {selectedTasks.length > 0 ? (
          selectedTasks.map((task) => (
            <NullableTask
              className='w-full rounded border border-solid border-slate-100'
              key={task.id}
              dataCy='foo'
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
      <div className='flex items-center justify-center border-t border-solid border-slate-200 p-2'>
        <AddTaskButton dataCy={`your-work-task`} onClick={handleAddTask} />
      </div>
    </>
  )
}

export default ParabolTasksPanel
