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
  const logoTone = cn(
    'flex items-center gap-[3px] transition-[filter,opacity]',
    !isCardActive &&
      'opacity-60 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-data-[state=open]:opacity-100 group-data-[state=open]:grayscale-0'
  )
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
        <span className={logoTone}>
          <ProviderLogo logo={getClientIntegration(primaryService).logo} className='h-4 w-4' />
        </span>
      ) : (
        <>
          <Add className='h-4 w-4' />
          <span className={logoTone}>
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
          !isCardActive && 'invisible group-hover:visible group-data-[state=open]:visible'
        )}
      />
    </Button>
  )
})

export default TaskSendButton
