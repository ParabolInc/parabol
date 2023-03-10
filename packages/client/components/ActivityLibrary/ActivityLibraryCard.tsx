import clsx from 'clsx'
import React, {PropsWithChildren, ComponentPropsWithoutRef, ElementType, ReactNode} from 'react'
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

interface TitleProps<T extends ElementType> {
  as?: T
  children: ReactNode
}

const Title = <T extends ElementType = 'div'>(
  props: TitleProps<T> & ComponentPropsWithoutRef<T>
) => {
  const {as, children, className, ...rest} = props
  const Component = as || 'div'

  return (
    <Component
      className={clsx(
        'z-10 block pr-6 text-sm font-semibold leading-5 text-slate-800 focus:outline-none sm:text-base',
        className
      )}
      {...rest}
    >
      {/* Extend touch target to entire activity card if it's a link */}
      {'to' in props && <span className='absolute inset-0' aria-hidden='true' />}
      {children}
    </Component>
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
        'group transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-xl motion-reduce:transition-none',
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
