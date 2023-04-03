import clsx from 'clsx'
import React, {ComponentPropsWithoutRef, PropsWithChildren} from 'react'
import {MeetingTypeEnum} from '../../__generated__/ActivityLibraryQuery.graphql'

const ActivityCardImage = (props: PropsWithChildren<React.ImgHTMLAttributes<HTMLImageElement>>) => {
  const {className, src} = props

  return <img className={clsx('max-h-16 w-auto object-contain sm:max-h-28', className)} src={src} />
}

const ActivityCardTitle = (props: ComponentPropsWithoutRef<'div'>) => {
  const {children, className, ...rest} = props

  return (
    <div
      className={clsx(
        'px-2 py-1 text-sm font-semibold leading-5 text-slate-800 sm:text-base',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

interface CardTheme {
  primary: string
  secondary: string
}

export const MeetingThemes: Record<MeetingTypeEnum, CardTheme> = {
  action: {primary: 'bg-aqua-400', secondary: 'bg-aqua-100'},
  poker: {primary: 'bg-tomato-500', secondary: 'bg-tomato-100'},
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-grape-100'},
  teamPrompt: {primary: 'bg-aqua-400', secondary: 'bg-aqua-100'}
}

export interface ActivityCardProps {
  className?: string
  type: MeetingTypeEnum
  title: string
  imageSrc: string
  badge: React.ReactNode | null
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, type, title, imageSrc, badge} = props
  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden rounded-lg',
        MeetingThemes[type].secondary,
        className
      )}
    >
      <div className='flex flex-shrink-0'>
        <ActivityCardTitle>{title}</ActivityCardTitle>
        <div
          className={clsx(
            'ml-auto h-8 w-8 flex-shrink-0 rounded-bl-full',
            MeetingThemes[type].primary
          )}
        />
      </div>
      <div className='my-1 flex flex-1 items-center justify-center px-4'>
        <ActivityCardImage src={imageSrc} />
      </div>
      <div className='flex flex-shrink-0'>
        <div
          className={clsx('h-8 w-8 flex-shrink-0 rounded-tr-full', MeetingThemes[type].primary)}
        />
        <div className='ml-auto'>{badge}</div>
      </div>
    </div>
  )
}
