import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogTitleProps {
  children: React.ReactNode
}

export const DialogTitle = (props: DialogTitleProps) => {
  const {children} = props
  return <RadixDialog.Title className='m-0 text-xl font-semibold'>{children}</RadixDialog.Title>
}
