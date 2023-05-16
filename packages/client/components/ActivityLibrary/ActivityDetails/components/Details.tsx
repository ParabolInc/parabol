import React from 'react'
import clsx from 'clsx'

interface Props {
  backNavigation: React.ReactNode
  isEditing?: boolean
  activityCard: React.ReactNode
  activityName: React.ReactNode
  activityDetails: React.ReactNode
  activitySidebar?: React.ReactNode
  activityTemplateDetails?: React.ReactNode
}

export const Details = (props: Props) => {
  const {
    backNavigation,
    isEditing,
    activityCard,
    activityName,
    activityDetails,
    activityTemplateDetails,
    activitySidebar
  } = props

  return (
    <div className='flex h-full flex-col bg-white'>
      <div className='flex grow'>
        <div className='mt-4 grow'>
          <div className='mb-14 ml-4 flex h-min w-max items-center'>
            <div className='mr-4'>{backNavigation}</div>
            <div className='w-max text-xl font-semibold'>Start Activity</div>
          </div>
          <div className='mx-auto w-min'>
            <div
              className={clsx(
                'flex w-full flex-col justify-start pl-4 pr-14 xl:flex-row xl:justify-center xl:pl-14',
                isEditing && 'lg:flex-row lg:justify-center lg:pl-14'
              )}
            >
              {activityCard}
              <div className='pb-20'>
                <div className='mb-10 pl-14 space-y-2'>
                  <div className='flex min-h-[40px] items-center'>{activityName}</div>
                  <div className='space-y-6'>{activityDetails}</div>
                </div>
                {activityTemplateDetails ? activityTemplateDetails : null}
              </div>
            </div>
          </div>
        </div>
        {activitySidebar ? activitySidebar : null}
      </div>
    </div>
  )
}
