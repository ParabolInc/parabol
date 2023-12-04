import clsx from 'clsx'
import React, {PropsWithChildren} from 'react'
import {upperFirst} from '../../utils/upperFirst'
import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {backgroundImgMap, CategoryID, MEETING_TYPE_TO_CATEGORY} from './Categories'
import {twMerge} from 'tailwind-merge'

export interface CardTheme {
  primary: string
  secondary: string
}

type ActivityCardImageProps = {
  className?: string
  src: string
  category: CategoryID
}

export const ActivityCardImage = (props: PropsWithChildren<ActivityCardImageProps>) => {
  const {className, src, category} = props
  const backgroundSrc = backgroundImgMap[category]

  return (
    <div
      className={twMerge(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        className
      )}
      style={{backgroundImage: `url(${backgroundSrc})`, backgroundSize: 'cover'}}
    >
      <img
        className='absolute top-0 left-0 z-10 h-full w-full object-contain p-10'
        src={src}
        alt='Card Illustration'
      />
    </div>
  )
}

export interface ActivityCardProps {
  className?: string
  theme: CardTheme
  title?: string
  badge?: React.ReactNode
  children?: React.ReactNode
  type?: MeetingTypeEnum
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, children, type, badge} = props
  const category = type && MEETING_TYPE_TO_CATEGORY[type]

  return (
    <div className='flex w-full flex-col'>
      <div
        className={twMerge(
          'relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg',
          `bg-${theme.secondary}`,
          className
        )}
      >
        <div className='flex-1'>
          {children}
          <div className='absolute bottom-0 right-0'>{badge}</div>
        </div>
      </div>
      {title && category && (
        <div className='mt-2 px-2 pb-2'>
          <div className='truncate pb-1 text-lg leading-5 text-slate-800'>{title}</div>
          <div className={clsx('font-semibold italic', `text-${theme.primary}`)}>
            {upperFirst(category)}
          </div>
        </div>
      )}
    </div>
  )
}
