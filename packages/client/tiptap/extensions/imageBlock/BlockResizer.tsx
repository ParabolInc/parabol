import {cn} from '../../../ui/cn'

interface Props {
  className?: string
  onMouseDown: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void
}
export const BlockResizer = (props: Props) => {
  const {className, onMouseDown} = props
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      className={cn(
        'absolute top-0 flex h-full w-4 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100',
        className
      )}
    >
      <div className='h-[25%] w-1 cursor-col-resize rounded-3xl border-[1px] border-white/90 bg-slate-900/60'></div>
    </div>
  )
}
