import {forwardRef} from 'react'
import ProviderLogo from '../../../../components/ProviderLogo'
import {
  getClientIntegration,
  type TaskClientIntegration
} from '../../../../integrations/platform/registry'
import {Button, type ButtonProps} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {Add, ArrowDropDown} from '../../../../ui/icons'

interface Props extends ButtonProps {
  services: readonly TaskClientIntegration[]
  suggestedServices: readonly TaskClientIntegration[]
  isCardActive: boolean
}

const TaskSendButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {services, suggestedServices, isCardActive, className, ...rest} = props
  const [primaryService] = services
  return (
    <Button
      {...rest}
      ref={ref}
      variant='flat'
      className={cn(
        'h-6 gap-0.5 rounded-sm px-1 text-fg-secondary hover:text-fg-primary data-[state=open]:bg-surface-hover',
        !isCardActive && 'opacity-0 focus-visible:opacity-100 data-[state=open]:opacity-100',
        className
      )}
    >
      {primaryService ? (
        <ProviderLogo logo={getClientIntegration(primaryService).logo} className='h-4 w-4' />
      ) : (
        <>
          <Add className='h-4 w-4' />
          <span className='flex items-center gap-[3px]'>
            {suggestedServices.map((service) => (
              <ProviderLogo
                key={service}
                logo={getClientIntegration(service).logo}
                className='h-3.5 w-3.5'
              />
            ))}
          </span>
        </>
      )}
      <ArrowDropDown className='h-4 w-4' />
    </Button>
  )
})

export default TaskSendButton
