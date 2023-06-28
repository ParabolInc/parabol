import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

const Dialog = (props: DialogProps) => {
  const {open, onClose, children} = props
  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onClose()
        }
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className='fixed inset-0 bg-slate-700/[.3] data-[state=open]:animate-overlayShow' />
        {children}
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export default Dialog
