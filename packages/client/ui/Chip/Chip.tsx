import {Close} from '@mui/icons-material'
import React from 'react'
import {twMerge} from 'tailwind-merge'

interface Props {
  label: string
  picture?: string | null
  icon?: React.ReactElement | null
  className?: string
  onDelete?: (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => void
}

export const Chip = (props: Props) => {
  const {label, className, picture, icon, onDelete} = props

  return (
    <div
      className={twMerge(
        'inline-flex h-8 cursor-default items-center justify-start gap-2 rounded bg-slate-100 px-2 py-2',
        className
      )}
    >
      {icon && icon}
      {picture && (
        <div className='relative h-6 w-6 rounded border border-slate-100'>
          <div
            className='h-6 w-6 rounded-full bg-cover bg-center bg-no-repeat'
            style={{backgroundImage: `url('${picture}')`}}
          />
        </div>
      )}
      <div className='text-gray-700 text-sm font-semibold leading-normal'>{label}</div>
      {onDelete && (
        <Close
          className='text-gray-700 cursor-pointer text-sm hover:opacity-50'
          onClick={onDelete}
        />
      )}
    </div>
  )
}
