import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {DialogOverlay} from './DialogOverlay'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  rootProps?: React.ComponentPropsWithoutRef<typeof RadixDialog.Root>
  overlayProps?: React.ComponentPropsWithoutRef<typeof DialogOverlay>
  portalProps?: React.ComponentPropsWithoutRef<typeof RadixDialog.Portal>
}

export const SimpleModalDialog = (props: DialogProps) => {
  const {isOpen, onClose, children, rootProps, overlayProps, portalProps} = props
  return (
    <RadixDialog.Root
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onClose()
        }
      }}
      {...rootProps}
    >
      <RadixDialog.Portal {...portalProps}>
        <DialogOverlay {...overlayProps} />
        {children}
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
