import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogContentProps {
  children: React.ReactNode
}

const DialogContent = (props: DialogContentProps) => {
  const {children} = props
  return (
    <RadixDialog.Content className='fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-[16px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none data-[state=open]:animate-contentShow'>
      {children}
    </RadixDialog.Content>
  )
}

export default DialogContent
