// @deprecated Use the radix-ui based Dialog components from packages/client/ui/Dialog/ instead.
import type * as React from 'react'
import type {ReactNode} from 'react'

interface Props {
  children: ReactNode
  onBackdropClick?: () => void
}

const DashModal = (props: Props) => {
  const {children, onBackdropClick} = props
  const onClick = (e: React.MouseEvent) => {
    if (onBackdropClick && e.target === e.currentTarget) {
      onBackdropClick()
    }
  }
  return (
    <div
      className='flex! absolute inset-0 z-dialog flex-1 flex-col items-center justify-center bg-slate-700/30 text-center'
      onClick={onBackdropClick ? onClick : undefined}
    >
      <div className='w-[30rem] animate-[modal-drop-in_200ms_cubic-bezier(0,0,.2,1)] overflow-hidden rounded-lg bg-surface-card p-5 shadow-[var(--shadow-dialog)]'>
        {children}
      </div>
    </div>
  )
}

export default DashModal
