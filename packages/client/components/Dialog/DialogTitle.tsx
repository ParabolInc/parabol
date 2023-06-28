import React from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'

interface DialogTitleProps {
  children: React.ReactNode
}

const DialogTitle = (props: DialogTitleProps) => {
  const {children} = props
  return <RadixDialog.Title className='m-0 text-[20px] font-semibold'>{children}</RadixDialog.Title>
}

export default DialogTitle
