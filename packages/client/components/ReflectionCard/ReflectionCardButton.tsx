import {cn} from '../../ui/cn'
import PlainButton, {PlainButtonProps} from '../PlainButton/PlainButton'
import Tooltip from '../Tooltip'

type Props = {
  tooltipText?: string
} & PlainButtonProps

const ReflectionCardButton = (props: Props) => {
  const {tooltipText, className, children, ...rest} = props
  return (
    <Tooltip text={tooltipText}>
      <PlainButton
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center justify-self-end rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500',
          className
        )}
        {...rest}
      >
        {children}
      </PlainButton>
    </Tooltip>
  )
}

export default ReflectionCardButton
