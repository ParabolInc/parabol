/* Copy and pasted from `./JiraScopingSelectAllIssues.tsx` */
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useUnusedRecords from '~/hooks/useUnusedRecords'
import useUpdatePokerScopeMutation from '~/mutations/useUpdatePokerScopeMutation'
import type {ParabolScopingSelectAllTasks_tasks$key} from '../__generated__/ParabolScopingSelectAllTasks_tasks.graphql'
import getSelectAllTitle from '../utils/getSelectAllTitle'
import Checkbox from './Checkbox'

interface Props {
  meetingId: string
  tasks: ParabolScopingSelectAllTasks_tasks$key
  usedServiceTaskIds: ReadonlySet<string>
}

const ParabolScopingSelectAllTasks = (props: Props) => {
  const {meetingId, usedServiceTaskIds, tasks: tasksRef} = props
  const tasks = useFragment(
    graphql`
      fragment ParabolScopingSelectAllTasks_tasks on TaskEdge @relay(plural: true) {
        node {
          id
          plaintextContent
          integrationHash
        }
      }
    `,
    tasksRef
  )
  const taskIds = tasks.map((taskEdge) => taskEdge.node.id)
  const [unusedTasks, allSelected] = useUnusedRecords(taskIds, usedServiceTaskIds)
  const [updatePokerScope, submitting] = useUpdatePokerScopeMutation()
  const onClick = () => {
    if (submitting) return
    const updateArr = allSelected ? Array.from(taskIds) : unusedTasks
    const action = allSelected ? 'DELETE' : 'ADD'
    const updates = updateArr.map(
      (serviceTaskId) =>
        ({
          service: 'PARABOL',
          serviceTaskId,
          action
        }) as const
    )
    const variables = {
      meetingId,
      updates
    }
    const contents = updates.map((update) => {
      const task = tasks.find((taskEdge) => taskEdge.node.id === update.serviceTaskId)
      return task?.node.plaintextContent ?? 'Unknown Story'
    })
    updatePokerScope({variables, contents, selectedAll: true})
  }
  if (tasks.length < 2) return null
  const title = getSelectAllTitle(unusedTasks.length, usedServiceTaskIds.size, 'task', allSelected)
  return (
    <div className='flex pl-4' onClick={onClick}>
      <Checkbox active={allSelected} />
      <div className='pb-4 pl-4 font-semibold'>{title}</div>
    </div>
  )
}

export default ParabolScopingSelectAllTasks
