import React from 'react'
import {Close} from '@mui/icons-material'
import * as RadixDialog from '@radix-ui/react-dialog'

const DialogClose = () => {
  return (
    <RadixDialog.Close asChild>
      <button
        className='absolute top-[16px] right-[10px] inline-flex h-[25px] w-[25px] cursor-pointer appearance-none items-center justify-center bg-transparent'
        aria-label='Close'
      >
        <Close className='text-slate-500 hover:opacity-50' />
      </button>
    </RadixDialog.Close>
  )
}

export default DialogClose
