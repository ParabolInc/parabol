import clsx from 'clsx'
import React, {PropsWithChildren} from 'react'
import {upperFirst} from '../../utils/upperFirst'
import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {CATEGORY_TEXT_COLORS, MEETING_TYPE_TO_CATEGORY} from './Categories'

export interface CardTheme {
  primary: string
  secondary: string
}

export const ActivityCardImage = (
  props: PropsWithChildren<React.ImgHTMLAttributes<HTMLImageElement>>
) => {
  const {className, src} = props

  return (
    <div
      className={clsx(
        'my-1 flex flex-1 items-center justify-center overflow-hidden px-4',
        className
      )}
    >
      <img className={'h-full w-full object-contain'} src={src} />
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
    <div>
      <div
        className={clsx(
          'relative flex flex-col overflow-hidden rounded-lg p-8',
          theme.secondary,
          className
        )}
      >
        {children}
        <div className='absolute bottom-0 right-0'>{badge}</div>
      </div>
      {title && category && (
        <>
          <div className='flex flex-shrink-0'>
            <div className='pt-3 pb-1 text-lg leading-5 text-slate-800'>{title}</div>
          </div>
          <div className='flex flex-shrink-0 italic'>
            <div className={clsx('font-semibold italic', color)}>{upperFirst(category)}</div>
            <div className={'ml-auto h-10 w-8 flex-shrink-0 rounded-bl-full'} />
          </div>
        </>
      )}
    </div>
  )
}
