import {forwardRef} from 'react'
import ProviderLogo from '../../../../components/ProviderLogo'
import {
  getClientIntegration,
  type TaskClientIntegration
} from '../../../../integrations/platform/registry'
import {Button, type ButtonProps} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {Add, ArrowDropDown} from '../../../../ui/icons'
import {SUGGESTED_SEND_SERVICES} from '../../../../utils/getSendServices'

interface Props extends ButtonProps {
  services: readonly TaskClientIntegration[]
  isCardActive: boolean
}

const TaskSendButton = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const {services, isCardActive, className, ...rest} = props
  const [primaryService] = services
  return (
    <Button
      {...rest}
      ref={ref}
      variant='flat'
      className={cn(
        'group h-6 gap-0.5 rounded-sm px-1 text-fg-secondary hover:text-fg-primary data-[state=open]:bg-surface-hover',
        className
      )}
    >
      {primaryService ? (
        <ProviderLogo logo={getClientIntegration(primaryService).logo} className='h-4 w-4' />
      ) : (
        <>
          <Add className='h-4 w-4' />
          <span
            className={cn(
              'flex items-center gap-[3px] transition-[filter,opacity]',
              !isCardActive &&
                'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-data-[state=open]:opacity-100 group-data-[state=open]:grayscale-0'
            )}
          >
            {SUGGESTED_SEND_SERVICES.map((service) => (
              <ProviderLogo
                key={service}
                logo={getClientIntegration(service).logo}
                className='h-3.5 w-3.5'
              />
            ))}
          </span>
        </>
      )}
      <ArrowDropDown
        className={cn(
          'h-4 w-4',
          !isCardActive && 'hidden group-hover:block group-data-[state=open]:block'
        )}
      />
    </Button>
  )
})

export default TaskSendButton
