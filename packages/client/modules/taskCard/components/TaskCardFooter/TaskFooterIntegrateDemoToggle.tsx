import {useState} from 'react'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import TeamHealthDemoIntegrationDialog, {
  TASK_INTEGRATION_BENEFITS
} from '../../../../components/TeamHealthDemo/TeamHealthDemoIntegrationDialog'
import {Tooltip} from '../../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../../ui/Tooltip/TooltipTrigger'

const TaskFooterIntegrateDemoToggle = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <CardButton onClick={() => setIsOpen(true)}>
            <IconLabel icon='widgets' />
          </CardButton>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Push to Integration</TooltipContent>
      </Tooltip>
      <TeamHealthDemoIntegrationDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Push tasks to your tools on a real team'
        intro='This is a sample meeting, so there is no tracker to push to. On your own team, connecting one gets you:'
        benefits={TASK_INTEGRATION_BENEFITS}
      />
    </>
  )
}

export default TaskFooterIntegrateDemoToggle
