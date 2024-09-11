import * as RadixDialog from '@radix-ui/react-dialog'
import * as React from 'react'

interface DialogProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {
  isOpen?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export const Dialog = (props: DialogProps) => {
  const {isOpen, onClose, children, ...other} = props
  return (
    <RadixDialog.Root
      open={isOpen}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          onClose?.()
        }
      }}
      {...other}
    >
      {children}
    </RadixDialog.Root>
  )
}
