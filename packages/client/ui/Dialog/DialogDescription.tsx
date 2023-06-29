import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogDescriptionProps {
  children: React.ReactNode
}

export const DialogDescription = (props: DialogDescriptionProps) => {
  const {children} = props
  return (
    <RadixDialog.Description className='mt-3 mb-5 text-base leading-normal'>
      {children}
    </RadixDialog.Description>
  )
}
