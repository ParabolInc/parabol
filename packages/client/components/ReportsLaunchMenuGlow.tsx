import {cn} from '../ui/cn'

interface Props {
  retiring: boolean
  className?: string
}

const ReportsLaunchMenuGlow = (props: Props) => {
  const {retiring, className} = props
  const fade = cn('transition-opacity duration-700', retiring && 'opacity-0')
  return (
    <span aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <span
        className={cn(
          '-bottom-1.5 -z-1 absolute inset-x-1 h-[3px] animate-launch-flow rounded-full bg-launch-spectrum blur-[4px] motion-reduce:animate-none',
          fade,
          !retiring && 'opacity-95'
        )}
      />
      <span
        className={cn(
          'mask-launch-ring absolute inset-0 animate-launch-flow rounded-lg bg-launch-spectrum p-[1.5px] motion-reduce:animate-none',
          fade
        )}
      />
    </span>
  )
}

export default ReportsLaunchMenuGlow
