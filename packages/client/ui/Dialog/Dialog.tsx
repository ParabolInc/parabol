import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Dialog = (props: DialogProps) => {
  const {isOpen, onClose, children} = props
  return (
    <RadixDialog.Root
      open={isOpen}
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
