import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'

interface Props {
  label: string
  value: string
  actionLabel?: string
  onAction?: () => void
  disabled?: boolean
  className?: string
}

const RetroSettingLinkRow = (props: Props) => {
  const {label, value, actionLabel, onAction, disabled, className} = props
  return (
    <div className={cn('flex items-center gap-3 px-1 py-3', className)}>
      <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
        <span className='font-semibold text-fg-primary text-sm'>{label}</span>
        <span className='text-[13px] text-fg-secondary leading-[18px]'>{value}</span>
      </div>
      {actionLabel && onAction && (
        <Button
          variant='outline'
          size='sm'
          className='h-8 text-sm'
          disabled={disabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default RetroSettingLinkRow
