import React from 'react'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES} from '../Categories'
import {IntegrationsTip} from './components/IntegrationsTip'
import clsx from 'clsx'
import {DetailsBadge} from './components/DetailsBadge'
import {ActivityWithNoTemplate} from './hooks/useActivityDetails'

interface Props {
  activity: ActivityWithNoTemplate
}
export const MeetingDetails = (props: Props) => {
  const {activity} = props
  const {category, description, integrationsTip} = activity

  return (
    <div className='space-y-6'>
      <div className='flex gap-2'>
        <DetailsBadge className={clsx(CATEGORY_THEMES[category].primary, 'text-white')}>
          {CATEGORY_ID_TO_NAME[category]}
        </DetailsBadge>
      </div>

      <div className='text-base font-semibold leading-6 text-slate-600'>Created by Parabol</div>

      <div className='w-[480px]'>{description}</div>

      <IntegrationsTip>{integrationsTip}</IntegrationsTip>
    </div>
  )
}
