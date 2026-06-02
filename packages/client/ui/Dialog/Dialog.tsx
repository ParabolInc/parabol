import * as RadixDialog from '@radix-ui/react-dialog'
import * as React from 'react'

interface DialogStateContextValue {
  isOpen: boolean | undefined
}

export const DialogStateContext = React.createContext<DialogStateContextValue>({
  isOpen: undefined
})
export const useDialogState = () => React.useContext(DialogStateContext)

interface DialogProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadixDialog.Root>, 'open'> {
  isOpen?: boolean
  onClose?: () => void
  children: React.ReactNode
}

export const Dialog = (props: DialogProps) => {
  const {isOpen, onClose, children, ...other} = props
  return (
    <DialogStateContext.Provider value={{isOpen}}>
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
    </DialogStateContext.Provider>
  )
}
