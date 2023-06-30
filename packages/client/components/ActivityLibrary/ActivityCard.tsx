import clsx from 'clsx'
import React, {ComponentPropsWithoutRef, PropsWithChildren} from 'react'

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
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, titleAs, badge, children} = props
  const Title = titleAs ?? ActivityCardTitle

  return (
    <div className={clsx('flex flex-col overflow-hidden rounded-lg', theme.secondary, className)}>
      <div className='flex flex-shrink-0'>
        <Title>{title}</Title>
        <div className={clsx('ml-auto h-8 w-8 flex-shrink-0 rounded-bl-full', theme.primary)} />
      </div>
      {children}
      <div className='flex flex-shrink-0 group-hover/card:hidden'>
        <div className={clsx('mt-auto h-8 w-8 flex-shrink-0 rounded-tr-full', theme.primary)} />
        <div className='ml-auto'>{badge}</div>
      </div>
    </div>
  )
}
