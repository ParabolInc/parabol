import React from 'react'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES, CategoryID} from '../Categories'
import {MeetingTypeEnum} from '../../../../server/postgres/types/Meeting'
import {IntegrationsList} from './components/IntegrationsList'
import clsx from 'clsx'
import {DetailsBadge} from './components/DetailsBadge'
import {MEETING_TYPE_DESCRIPTION_LOOKUP, MEETING_TYPE_TIP_LOOKUP} from './hooks/useActivityDetails'

interface MeetingDetailsProps {
  type: MeetingTypeEnum
  category: CategoryID
}
export const MeetingDetails = (props: MeetingDetailsProps) => {
  const {type, category} = props

  return (
    <div className='space-y-6'>
      <div className='flex gap-2'>
        <DetailsBadge className={clsx(CATEGORY_THEMES[category].primary, 'text-white')}>
          {CATEGORY_ID_TO_NAME[category]}
        </DetailsBadge>
      </div>

      <div className='text-base font-semibold leading-6 text-slate-600'>Created by Parabol</div>

      <div className='w-[480px]'>{MEETING_TYPE_DESCRIPTION_LOOKUP[type]}</div>
      <div className='flex min-w-max items-center'>
        <IntegrationsList />
        <div className='ml-4'>
          <b>Tip:</b> {MEETING_TYPE_TIP_LOOKUP[type]}
        </div>
      </div>
    </div>
  )
}
