import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {TaskFooterTeamAssignee_task$key} from '../../../../__generated__/TaskFooterTeamAssignee_task.graphql'
import CardButton from '../../../../components/CardButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import lazyPreload from '../../../../utils/lazyPreload'
import TaskFooterTeamAssigneeAddIntegrationDialog from '../OutcomeCardAssignMenu/TaskFooterTeamAssigneeAddIntegrationDialog'
import type {PendingTeamAssignment} from '../OutcomeCardAssignMenu/TaskFooterTeamAssigneeMenu'

interface Props {
  canAssign: boolean
  task: TaskFooterTeamAssignee_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterTeamAssigneeMenuRoot' */ '../TaskFooterTeamAssigneeMenuRoot'
    )
)

const TaskFooterTeamAssignee = (props: Props) => {
  const {canAssign, task: taskRef, useTaskChild} = props

  const task = useFragment(
    graphql`
      fragment TaskFooterTeamAssignee_task on Task {
        ...TaskFooterTeamAssigneeMenu_task
        id
        team {
          name
        }
      }
    `,
    taskRef
  )

  const {team, id: taskId} = task
  const {name: teamName} = team
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation} = useMutationProps()
  const [pendingTeam, setPendingTeam] = useState<PendingTeamAssignment | null>(null)

  const confirmAddIntegration = () => {
    if (!pendingTeam) return
    submitMutation()
    ChangeTaskTeamMutation(atmosphere, {taskId, teamId: pendingTeam.id}, {onError, onCompleted})
    setPendingTeam(null)
  }

  const trigger = (
    <CardButton
      className='-ml-2 block h-6 max-w-full truncate rounded-md border-0 px-2 text-left font-semibold text-fg-secondary text-xs leading-6 opacity-100 outline-0 hover:text-fg-primary focus:text-fg-primary'
      aria-label='Assign this task to another team'
      onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
    >
      <div className='w-fit'>{teamName}</div>
      {teamName}
    </CardButton>
  )

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='w-full'>
            {canAssign ? (
              <Menu trigger={trigger}>
                <MenuContent align='start'>
                  <Suspense fallback={null}>
                    <TaskFooterTeamAssigneeMenuRoot
                      task={task}
                      useTaskChild={useTaskChild}
                      onRequestIntegration={setPendingTeam}
                    />
                  </Suspense>
                </MenuContent>
              </Menu>
            ) : (
              trigger
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Reassign Team</TooltipContent>
      </Tooltip>
      {pendingTeam && (
        <TaskFooterTeamAssigneeAddIntegrationDialog
          isOpen
          onClose={() => setPendingTeam(null)}
          onConfirm={confirmAddIntegration}
          serviceName={pendingTeam.serviceName}
          teamName={pendingTeam.name}
        />
      )}
    </>
  )
}

export default TaskFooterTeamAssignee
