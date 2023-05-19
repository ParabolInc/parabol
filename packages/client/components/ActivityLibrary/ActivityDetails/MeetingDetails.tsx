import React from 'react'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES} from '../Categories'
import {IntegrationsTip} from './components/IntegrationsTip'
import clsx from 'clsx'
import {DetailsBadge} from './components/DetailsBadge'
import {Activity, ACTIVITY_TYPE_DATA_LOOKUP} from './hooks/useActivityDetails'

interface Props {
  type: Activity['type']
  category: Activity['category']
}
export const MeetingDetails = (props: Props) => {
  const {type, category} = props

  return (
    <div className='space-y-6'>
      <div className='flex gap-2'>
        <DetailsBadge className={clsx(CATEGORY_THEMES[category].primary, 'text-white')}>
          {CATEGORY_ID_TO_NAME[category]}
        </DetailsBadge>
      </div>

      <div className='text-base font-semibold leading-6 text-slate-600'>Created by Parabol</div>

      <div className='w-[480px]'>{ACTIVITY_TYPE_DATA_LOOKUP.description[type]}</div>

      <IntegrationsTip type={type} />
    </div>
  )
}
