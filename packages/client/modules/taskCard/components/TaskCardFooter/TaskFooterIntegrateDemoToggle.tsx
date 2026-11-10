import {useState} from 'react'
import TeamHealthDemoIntegrationDialog, {
  TASK_INTEGRATION_BENEFITS
} from '../../../../components/TeamHealthDemo/TeamHealthDemoIntegrationDialog'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'
import {getConnectLabel} from '../../../../utils/getSendServices'
import TaskSendButton from './TaskSendButton'

interface Props {
  isCardActive: boolean
}

const TaskFooterIntegrateDemoToggle = ({isCardActive}: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const label = getConnectLabel()
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <TaskSendButton
            aria-label={label}
            isCardActive={isCardActive}
            services={[]}
            onClick={() => setIsOpen(true)}
          />
        </TooltipTrigger>
        <TooltipContent side='bottom'>{label}</TooltipContent>
      </Tooltip>
      <TeamHealthDemoIntegrationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Send tasks to your tools on a real team'
        intro='This is a sample meeting, so there is no tracker to send to. On your own team, connecting one gets you:'
        benefits={TASK_INTEGRATION_BENEFITS}
      />
    </>
  )
}

export default TaskFooterIntegrateDemoToggle
