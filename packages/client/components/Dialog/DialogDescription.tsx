import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogDescriptionProps {
  children: React.ReactNode
}

const DialogDescription = (props: DialogDescriptionProps) => {
  const {children} = props
  return (
    <RadixDialog.Description className='mt-[10px] mb-5 text-[15px] leading-normal'>
      {children}
    </RadixDialog.Description>
  )
}

export default DialogDescription
