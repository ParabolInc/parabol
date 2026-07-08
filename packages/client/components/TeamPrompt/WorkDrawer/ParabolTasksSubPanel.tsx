import type {TaskStatusEnum} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import CreateTaskMutation from '../../../mutations/CreateTaskMutation'
import {TaskStatus} from '../../../types/constEnums'
import dndNoise from '../../../utils/dndNoise'
import AddTaskButton from '../../AddTaskButton'
import ParabolTasksResultsRoot from './ParabolTasksResultsRoot'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  meetingId: string
  teamId: string
  selectedStatuses: TaskStatusEnum[]
  dateRange: WorkDrawerDateRange | undefined
}

const ParabolTasksSubPanel = (props: Props) => {
  const {meetingId, teamId, selectedStatuses, dateRange} = props
  const atmosphere = useAtmosphere()

  const handleAddTask = () => {
    CreateTaskMutation(
      atmosphere,
      {
        newTask: {
          status: selectedStatuses[0] ?? TaskStatus.ACTIVE,
          meetingId,
          teamId,
          userId: atmosphere.viewerId,
          sortOrder: dndNoise()
        }
      },
      {}
    )
  }

  return (
    <>
      <ParabolTasksResultsRoot selectedStatuses={selectedStatuses} dateRange={dateRange} />
      <div className='flex items-center justify-center border-slate-200 border-t border-solid p-2'>
        <AddTaskButton onClick={handleAddTask} />
      </div>
    </>
  )
}

export default ParabolTasksSubPanel
