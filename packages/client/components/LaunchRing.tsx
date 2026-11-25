import type {FeatureLaunchStatus} from '../hooks/useFeatureLaunch'
import {cn} from '../ui/cn'

interface Props {
  status: FeatureLaunchStatus
}

const LaunchRing = (props: Props) => {
  const {status} = props
  if (status === 'off') return null
  return (
    <span
      aria-hidden
      className={cn(
        '-inset-[3px] mask-launch-ring pointer-events-none absolute animate-launch-flow rounded-[11px] bg-launch-spectrum p-[2px] transition-opacity duration-700 motion-reduce:animate-none',
        status === 'retiring' && 'opacity-0'
      )}
    />
  )
}

export default LaunchRing
