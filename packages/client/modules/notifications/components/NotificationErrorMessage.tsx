import {cn} from '../../../ui/cn'

interface Props {
  className?: string
  error: {message: string} | undefined | null
}
const NotificationErrorMessage = (props: Props) => {
  const {className, error} = props
  if (!error) return null
  return (
    <div className={cn('text-center font-semibold text-[14px] text-fg-error', className)}>
      {error.message}
    </div>
  )
}

export default NotificationErrorMessage
