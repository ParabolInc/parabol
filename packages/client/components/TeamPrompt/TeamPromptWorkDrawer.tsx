import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {
  TaskStatusEnum,
  TeamPromptWorkDrawerQuery
} from '../../__generated__/TeamPromptWorkDrawerQuery.graphql'
import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import NullableTask from '../NullableTask/NullableTask'
import {TaskStatus} from '../../types/constEnums'
import clsx from 'clsx'
import {meetingColumnArray} from '../../utils/constants'
import {taskStatusLabels} from '../../utils/taskStatus'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import AddTaskButton from '../AddTaskButton'
import CreateTaskMutation from '../../mutations/CreateTaskMutation'
import useAtmosphere from '../../hooks/useAtmosphere'
import dndNoise from '../../utils/dndNoise'

interface Props {
  queryRef: PreloadedQuery<TeamPromptWorkDrawerQuery>
  meetingRef: TeamPromptWorkDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {queryRef, meetingRef, onToggleDrawer} = props
  const data = usePreloadedQuery<TeamPromptWorkDrawerQuery>(
    graphql`
      query TeamPromptWorkDrawerQuery($after: DateTime, $userIds: [ID!]) {
        viewer {
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
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {tasks, id: viewerId} = viewer

  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        id
        teamId
      }
    `,
    meetingRef
  )
  const {id: meetingId, teamId} = meeting

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
          meetingId,
          teamId,
          userId: viewerId,
          sortOrder: dndNoise()
        }
      },
      {}
    )
  }

  return (
    <>
      <div className='px-4 pt-4'>
        <div className='flex justify-between'>
          <div className='text-base font-semibold'>Your Tasks</div>
          <div className='cursor-pointer text-slate-600 hover:opacity-50' onClick={onToggleDrawer}>
            <Close />
          </div>
        </div>
        <div className='my-4 flex gap-2'>
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

export default TeamPromptWorkDrawer
