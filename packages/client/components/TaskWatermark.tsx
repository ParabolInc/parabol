import type React from 'react'
import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../integrations/platform/registry'
import {cn} from '../ui/cn'

interface WatermarkSVGProps {
  Icon: React.ComponentType<{className?: string}>
  className?: string
}

const WatermarkSVG = ({Icon, className}: WatermarkSVGProps) => (
  <div className={cn('absolute right-[24px] bottom-[8px] scale-500 transform', className)}>
    <Icon />
  </div>
)

interface Props {
  service: IntegrationProviderServiceEnum | null | undefined
}

const TaskWatermark = (props: Props) => {
  const {service} = props
  if (!service || !isRegisteredClientIntegration(service)) return null
  const {Icon, iconClassName} = getClientIntegration(service)

  return (
    <div className='pointer-events-none absolute inset-0 z-10 overflow-hidden text-center align-middle opacity-20'>
      <WatermarkSVG Icon={Icon} className={iconClassName} />
    </div>
  )
}

export default TaskWatermark
