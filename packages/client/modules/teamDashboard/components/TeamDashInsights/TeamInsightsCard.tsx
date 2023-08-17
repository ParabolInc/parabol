import React, {ReactNode} from 'react'
import Tooltip from '../../../../components/Tooltip'
import {Info as InfoIcon} from '@mui/icons-material'
import {ThumbUp, ThumbDown} from '@mui/icons-material'
import FlatButton from '../../../../components/FlatButton'

interface Props {
  title: string
  tooltip: string
  children: ReactNode
}

const TeamInsightsCard = (props: Props) => {
  const {children, title, tooltip} = props

  return (
    <div className='relative m-2 flex w-[320px] flex-col overflow-hidden rounded bg-white drop-shadow'>
      <div className='flex items-center justify-between'>
        <div className='p-4 text-sm font-semibold text-slate-600'>{title}</div>
        <Tooltip text={tooltip} className='pr-3 text-slate-600'>
          <InfoIcon />
        </Tooltip>
      </div>
      <div className='flex flex-row justify-center'>{children}</div>
      <div className='flex items-center justify-center bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600'>
        <div className='grow'>Is this helpful?</div>
        <FlatButton className='mx-4 p-0 text-slate-500'>
          <ThumbDown />
        </FlatButton>
        <FlatButton className='p-0 text-slate-700'>
          <ThumbUp />
        </FlatButton>
      </div>
    </div>
  )
}

export default TeamInsightsCard
