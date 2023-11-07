import clsx from 'clsx'
import React, {ComponentPropsWithoutRef, PropsWithChildren} from 'react'
import {upperFirst} from '../../utils/upperFirst'

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

export interface ActivityCardProps {
  className?: string
  theme: CardTheme
  titleAs?: React.ElementType
  title?: string
  badge?: React.ReactNode
  children?: React.ReactNode
  type?: string
}

const meetingTypeColors = {
  retrospective: 'text-grape-500',
  standup: 'text-aqua-400',
  estimation: 'text-tomato-500',
  feedback: 'text-jade-400'
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, titleAs, badge, children, type = 'retrospective'} = props
  const Title = titleAs ?? ActivityCardTitle

  const typeColorClass = type ? meetingTypeColors[type] : 'text-slate-800'

  return (
    <div>
      <div className={clsx('flex flex-col overflow-hidden rounded-lg', theme.secondary, className)}>
        {children}
        {/* <div className='flex flex-shrink-0 group-hover/card:hidden'> */}
        <div className='flex flex-shrink-0'>
          {/* <div className={clsx('mt-auto h-8 w-8 flex-shrink-0 rounded-tr-full', theme.primary)} /> */}
          <div className={clsx('mt-auto h-8 w-8 flex-shrink-0 rounded-tr-full', theme.primary)} />
          <div className='ml-auto'>{badge}</div>
        </div>
      </div>
      <div className='flex flex-shrink-0'>
        {/* <div className='pt-2 text-3xl leading-5 text-slate-800 sm:text-base'>{title}</div> */}
        <div className='pt-3 pb-1 text-lg leading-5 text-slate-800'>{title}</div>
        {/* <div className={'ml-auto h-8 w-8 flex-shrink-0 rounded-bl-full'} /> */}
      </div>
      <div className='flex flex-shrink-0 italic'>
        <div className={clsx('font-semibold italic', typeColorClass)}>{upperFirst(type)}</div>
        <div className={'ml-auto h-10 w-8 flex-shrink-0 rounded-bl-full'} />
      </div>
    </div>
  )
}
