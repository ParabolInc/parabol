import clsx from 'clsx'
import React, {PropsWithChildren} from 'react'
import backgroundSrc from '../../../../static/images/illustrations/retro-background.png'
import {upperFirst} from '../../utils/upperFirst'
import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {CATEGORY_TEXT_COLORS, MEETING_TYPE_TO_CATEGORY} from './Categories'

export interface CardTheme {
  primary: string
  secondary: string
}

export const ActivityCardImage = (props: PropsWithChildren<{src: string; className?: string}>) => {
  const {className, src} = props

  return (
    <div
      className={clsx(
        'relative flex items-center justify-center overflow-hidden',
        'h-full w-full',
        className
      )}
    >
      <img
        className='absolute  z-0 h-full w-full object-cover'
        src={backgroundSrc}
        alt='Background'
      />
      <img
        className='absolute top-0 left-0 z-10 h-full w-full object-contain p-10'
        src={src}
        alt='Top Image'
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
  const color = category && CATEGORY_TEXT_COLORS[category].primary

  return (
    <div className='flex w-full flex-col'>
      <div
        className={clsx(
          'relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg',
          theme.secondary,
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
          {' '}
          <div className='text-sm leading-5 text-slate-800 sm:text-base'>{title}</div>{' '}
          <div className={clsx('font-semibold italic', color)}>{upperFirst(category)}</div>
        </div>
      )}
    </div>
  )
}
