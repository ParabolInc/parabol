import React from 'react'
import {Close} from '@mui/icons-material'
import * as RadixDialog from '@radix-ui/react-dialog'

export const DialogClose = () => {
  return (
    <RadixDialog.Close asChild>
      <button
        className='absolute top-4 right-3 inline-flex h-6 w-6 cursor-pointer appearance-none items-center justify-center bg-transparent'
        aria-label='Close'
      >
        <Close className='text-slate-500 hover:opacity-50' />
      </button>
    </RadixDialog.Close>
  )
}
