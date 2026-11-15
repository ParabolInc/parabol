import type {ReactNode} from 'react'

interface Props {
  icon: ReactNode
  children: ReactNode
  action?: ReactNode
}

export const SyncedBlockPanel = (props: Props) => {
  const {icon, children, action} = props
  return (
    <div
      data-synced-chrome
      contentEditable={false}
      className='flex flex-wrap items-center gap-3 rounded-md border border-hairline-strong border-dashed bg-surface-well px-3.5 py-3 text-fg-secondary text-sm'
    >
      <span className='shrink-0 text-[20px] text-fg-muted'>{icon}</span>
      <span className='min-w-0 flex-[1_1_220px]'>{children}</span>
      {action}
    </div>
  )
}
