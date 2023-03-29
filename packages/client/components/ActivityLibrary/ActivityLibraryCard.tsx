import clsx from 'clsx'
import React, {PropsWithChildren, ComponentPropsWithoutRef, ReactNode} from 'react'
import {MeetingTypeEnum} from '../../__generated__/ActivityLibraryQuery.graphql'
import {ActivityCard} from './ActivityCard'

const Image = (props: PropsWithChildren<React.ImgHTMLAttributes<HTMLImageElement>>) => {
  const {className, src} = props

  return (
    <div className='absolute inset-0 top-5 flex'>
      <img className={clsx('m-auto h-[76px] w-auto object-contain', className)} src={src} />
    </div>
  )
}

interface TitleProps {
  children: ReactNode
}

const Title = (props: TitleProps & ComponentPropsWithoutRef<'div'>) => {
  const {children, className, ...rest} = props

  return (
    <div
      className={clsx(
        'z-10 block pr-6 text-sm font-semibold leading-5 text-slate-800 sm:text-base',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  className?: string
  children?: React.ReactNode
}

const Badge = (props: BadgeProps) => {
  const {className, children} = props

  return (
    <div
      className={clsx(
        'absolute bottom-0 right-0 m-2 rounded-full bg-gold-300 px-2 py-[1px] text-xs font-semibold text-grape-700',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardProps {
  className?: string
  type: MeetingTypeEnum
  children: React.ReactNode
}

const Card = (props: CardProps) => {
  const {className, type, children} = props

  return (
    <ActivityCard
      className={clsx(
        'group transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-md motion-reduce:transition-none',
        className
      )}
      type={type}
    >
      {children}
    </ActivityCard>
  )
}

export const ActivityLibraryCard = Object.assign(Card, {
  Image,
  Title,
  Badge
})
