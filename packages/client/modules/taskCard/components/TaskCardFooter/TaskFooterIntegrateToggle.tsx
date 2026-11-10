import type {TaskFooterIntegrateMenuRoot_task$key} from '../../../../__generated__/TaskFooterIntegrateMenuRoot_task.graphql'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import isTeamHealthDemoRoute from '../../../../utils/isTeamHealthDemoRoute'
import TaskFooterIntegrateDemoToggle from './TaskFooterIntegrateDemoToggle'
import TaskSendControlRoot from './TaskSendControlRoot'

interface Props {
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenuRoot_task$key
  teamId: string
  useTaskChild: UseTaskChild
}

const TaskFooterIntegrateToggle = (props: Props) => {
  if (isTeamHealthDemoRoute()) return <TaskFooterIntegrateDemoToggle />
  return <TaskSendControlRoot {...props} />
}

export default TaskFooterIntegrateToggle
