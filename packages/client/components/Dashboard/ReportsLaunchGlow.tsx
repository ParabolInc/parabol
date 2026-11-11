import {cn} from '../../ui/cn'

interface Props {
  retiring: boolean
}

const ReportsLaunchGlow = (props: Props) => {
  const {retiring} = props
  return (
    <>
      <span
        aria-hidden
        className='-z-1 pointer-events-none absolute inset-0 animate-launch-draw motion-reduce:animate-none'
      >
        <span
          className={cn(
            '-inset-y-1 -right-[3px] -left-1.5 absolute animate-launch-flow rounded-[10px] bg-launch-spectrum blur-[5px] transition-opacity duration-700 motion-reduce:animate-none',
            retiring ? 'opacity-0' : 'opacity-22 dark:opacity-38'
          )}
        />
      </span>
      <span
        aria-hidden
        className={cn(
          '-bottom-6 -z-1 mask-launch-taper pointer-events-none absolute inset-x-[6%] h-[34px] transition-[transform,opacity] duration-800 ease-[cubic-bezier(0.65,0,0.35,1)]',
          retiring && 'scale-x-0 opacity-0'
        )}
      >
        <span className='absolute inset-x-[4%] top-3.5 h-[3px] animate-launch-rise motion-reduce:animate-none'>
          <span className='absolute inset-0 animate-launch-flow rounded-full bg-launch-spectrum opacity-90 blur-[5px] motion-reduce:animate-none dark:opacity-100' />
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          '-inset-y-px -left-[3px] -z-1 pointer-events-none absolute right-0 rounded-[7px] bg-surface-card transition-opacity delay-200 duration-600 dark:bg-surface-well',
          retiring && 'opacity-0'
        )}
      />
      <span
        aria-hidden
        className='-inset-y-[3px] -right-0.5 -left-[5px] pointer-events-none absolute animate-launch-draw motion-reduce:animate-none'
      >
        <span
          className={cn(
            'mask-launch-ring absolute inset-0 animate-launch-flow rounded-[9px] bg-launch-spectrum p-[1.5px] transition-opacity duration-700 motion-reduce:animate-none',
            retiring && 'opacity-0'
          )}
        />
      </span>
      {!retiring && <span className='sr-only'>New</span>}
    </>
  )
}

export default ReportsLaunchGlow
