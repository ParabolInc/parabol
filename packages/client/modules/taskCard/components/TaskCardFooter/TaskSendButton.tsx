import {forwardRef} from 'react'
import ProviderLogo from '../../../../components/ProviderLogo'
import {
  getClientIntegration,
  type TaskClientIntegration
} from '../../../../integrations/platform/registry'
import {Button, type ButtonProps} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {ArrowDropDown} from '../../../../ui/icons'

interface Props extends ButtonProps {
  services: readonly TaskClientIntegration[]
}

const TaskSendButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {services, className, ...rest} = props
  return (
    <Button
      {...rest}
      ref={ref}
      variant='outline'
      className={cn(
        'h-6 gap-[3px] rounded-sm py-0 pr-px pl-1 text-fg-secondary data-[state=open]:bg-surface-hover',
        className
      )}
    >
      {services.map((service) => (
        <ProviderLogo key={service} logo={getClientIntegration(service).logo} className='h-4 w-4' />
      ))}
      <ArrowDropDown className='h-4 w-4' />
    </Button>
  )
})

export default TaskSendButton
