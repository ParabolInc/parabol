import {cn} from '../../ui/cn'

const DashSectionHeader = (
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {
  const {className, children, ...rest} = props
  return (
    <div
      className={cn(
        'relative m-0 flex w-full max-w-[1360px] flex-col items-start px-5 pt-4 pb-1',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default DashSectionHeader
