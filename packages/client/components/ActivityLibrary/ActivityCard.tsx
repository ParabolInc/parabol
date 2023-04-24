import clsx from 'clsx'
import React, {ComponentPropsWithoutRef, PropsWithChildren} from 'react'

const ActivityCardImage = (props: PropsWithChildren<React.ImgHTMLAttributes<HTMLImageElement>>) => {
  const {className, src} = props

  return <img className={clsx('h-16 w-auto object-contain sm:h-24', className)} src={src} />
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

export type CategoryID = 'retrospective' | 'estimation' | 'standup' | 'feedback' | 'strategy'

export const MeetingThemes: Record<CategoryID, CardTheme> = {
  standup: {primary: 'bg-aqua-400', secondary: 'bg-aqua-100'},
  estimation: {primary: 'bg-tomato-500', secondary: 'bg-tomato-100'},
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-[#F2E1F7]'},
  feedback: {primary: 'bg-jade-400', secondary: 'bg-jade-100'},
  strategy: {primary: 'bg-rose-500', secondary: 'bg-rose-100'}
}

export interface ActivityCardProps {
  className?: string
  category: CategoryID
  title?: string
  imageSrc?: string
  badge: React.ReactNode | null
  children?: React.ReactNode
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, category, title, imageSrc, badge, children} = props
  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden rounded-lg',
        MeetingThemes[category].secondary,
        className
      )}
    >
      <div className='flex flex-shrink-0'>
        <ActivityCardTitle>{title}</ActivityCardTitle>
        <div
          className={clsx(
            'ml-auto h-8 w-8 flex-shrink-0 rounded-bl-full',
            MeetingThemes[category].primary
          )}
        />
      </div>
      {imageSrc && (
        <div className='my-1 flex flex-1 items-center justify-center px-4'>
          <ActivityCardImage src={imageSrc} />
        </div>
      )}
      {children}
      <div className='flex flex-shrink-0'>
        <div
          className={clsx('h-8 w-8 flex-shrink-0 rounded-tr-full', MeetingThemes[category].primary)}
        />
        <div className='ml-auto'>{badge}</div>
      </div>
    </div>
  )
}
