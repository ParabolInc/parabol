import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useHistory} from 'react-router'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {Link} from 'react-router-dom'
import IconLabel from '../../IconLabel'
import {ActivityCard} from '../ActivityCard'
import {activityIllustrations} from '../ActivityIllustrations'
import customTemplateIllustration from '../../../../../static/images/illustrations/customTemplate.png'
import clsx from 'clsx'
import {CategoryID, CATEGORY_THEMES, CATEGORY_ID_TO_NAME} from '../Categories'
import {NoTemplatesMeeting, query, MEETING_TYPE_TO_CATEGORY_ID} from './ActivityDetails'
import {DetailsBadge} from './components/DetailsBadge'
import {IntegrationsList} from './components/IntegrationsList'

const MEETING_ID_TO_NAME: Record<NoTemplatesMeeting, string> = {
  teamPrompt: 'Standup',
  action: 'Check In'
}

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  activityId: NoTemplatesMeeting
}

export const MeetingDetails = (props: Props) => {
  const {queryRef, activityId} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {viewer} = data

  const templateIllustration =
    activityIllustrations[activityId as keyof typeof activityIllustrations]
  const activityIllustration = templateIllustration ?? customTemplateIllustration
  const category = MEETING_TYPE_TO_CATEGORY_ID[activityId] as CategoryID

  const history = useHistory<{prevCategory?: string; edit?: boolean}>()
  const categoryLink = `/activity-library/category/${
    history.location.state?.prevCategory ?? category
  }`

  const descriptionLookup: Record<NoTemplatesMeeting, React.ReactNode> = {
    teamPrompt: (
      <>
        This is the space for teammates to give async updates on their work. You can discuss how
        work is going using a thread, or hop on a call and review the updates together.
      </>
    ),
    action: null
  }

  const tipLookup: Record<NoTemplatesMeeting, React.ReactNode> = {
    teamPrompt: <>push takeaway tasks to your backlog</>,
    action: null
  }

  return (
    <div className='flex h-full flex-col bg-white'>
      <div className='flex grow'>
        <div className='mt-4 grow'>
          <div className='mb-14 ml-4 flex h-min w-max items-center'>
            <Link className='mr-4' to={categoryLink}>
              <IconLabel icon={'arrow_back'} iconLarge />
            </Link>
            <div className='w-max text-xl font-semibold'>Start Activity</div>
          </div>
          <div className='mx-auto w-min'>
            <div
              className={clsx(
                'flex w-full flex-col justify-start pl-4 pr-14 xl:flex-row xl:justify-center xl:pl-14'
              )}
            >
              <ActivityCard
                className='ml-14 mb-8 h-[200px] w-80 xl:ml-0 xl:mb-0'
                theme={CATEGORY_THEMES[category]}
                imageSrc={activityIllustration}
                badge={null}
              />
              <div className='pb-20'>
                <div className='mb-10 pl-14'>
                  <div className='mb-2 flex min-h-[40px] items-center'>
                    <div className='text-[32px] font-semibold leading-tight text-slate-700'>
                      {MEETING_ID_TO_NAME[activityId]}
                    </div>
                  </div>
                  <div className='mb-4 flex gap-2'>
                    <DetailsBadge className={clsx(CATEGORY_THEMES[category].primary, 'text-white')}>
                      {CATEGORY_ID_TO_NAME[category]}
                    </DetailsBadge>
                  </div>

                  <div className='my-6 text-base font-semibold leading-6 text-slate-600'>
                    Created by Parabol
                  </div>

                  <div className='w-[480px]'>
                    {descriptionLookup[activityId as NoTemplatesMeeting]}
                  </div>
                  <div className='mt-[18px] flex min-w-max items-center'>
                    <IntegrationsList />
                    <div className='ml-4'>
                      <b>Tip:</b> {tipLookup[activityId as NoTemplatesMeeting]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar goes here */}
      </div>
    </div>
  )
}
