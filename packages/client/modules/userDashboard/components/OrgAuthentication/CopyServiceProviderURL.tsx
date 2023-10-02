import {ContentCopy} from '@mui/icons-material'
import React from 'react'
import CopyLink from '../../../../components/CopyLink'

interface Props {
  label: string
  url: string
}
export const CopyServiceProviderURL = (props: Props) => {
  const {label, url} = props
  const title = `Copy the ${label}`
  const tooltip = `Copied! Paste it into your IdP`

  return (
    <div className='flex pl-4'>
      <div className='min-w-[72px]'>{label.toUpperCase()}</div>
      <CopyLink url={url} title={title} tooltip={tooltip}>
        <div className='flex cursor-pointer select-none items-center overflow-auto pl-2 text-sky-500 hover:text-sky-700'>
          <div className='h-6 w-6'>
            <ContentCopy className='h-5 w-5' />
          </div>
          <div>{url}</div>
        </div>
      </CopyLink>
    </div>
  )
}
