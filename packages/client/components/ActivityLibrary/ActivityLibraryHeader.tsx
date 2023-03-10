import React, {PropsWithChildren} from 'react'
import LogoBlock from '../LogoBlock/LogoBlock'

import {Close, Search} from '@mui/icons-material'
import clsx from 'clsx'

const CloseButton = (props: PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => {
  const {className, ...rest} = props

  return (
    <button
      className={clsx(
        'flex h-10 w-10 cursor-pointer rounded-full bg-transparent hover:bg-slate-300'
      )}
      {...rest}
    >
      <Close className='m-auto h-8 w-8' />
    </button>
  )
}

const SearchBar = () => {
  return (
    <div className='my-4 flex w-full items-center'>
      <Search className='text-slate-600' />
      <input
        className='ml-2 w-full border-none bg-transparent font-sans text-xl text-slate-700 placeholder-slate-600 outline-none'
        autoFocus
        autoComplete='off'
        name='search'
        placeholder='Search Activities'
        type='text'
      />
    </div>
  )
}

interface Props {
  className?: string
  onClose: () => void
}

export const ActivityLibraryHeader = (props: Props) => {
  const {className, onClose} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex basis-[15%] items-center justify-start'>
        <LogoBlock />
        <div className='hidden w-max whitespace-nowrap text-xl font-semibold lg:block'>
          Start Activity
        </div>
      </div>

      <div className='flex flex-1 items-center md:px-4'>
        <SearchBar />
      </div>

      <div className='flex basis-[15%] items-center justify-end'>
        <CloseButton className='shrink-0' onClick={onClose} />
      </div>
    </div>
  )
}

export const ActivityLibraryMobileHeader = (props: Props) => {
  const {className, onClose} = props

  return (
    <div className={clsx('mx-1', className)}>
      <div className='flex flex-1 items-center px-4'>
        <SearchBar />
      </div>

      <div className='flex basis-1/5 items-center justify-end'>
        <CloseButton className='shrink-0' onClick={onClose} />
      </div>
    </div>
  )
}
