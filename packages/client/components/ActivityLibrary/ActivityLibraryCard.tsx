import clsx from 'clsx'
import React from 'react'
import {ActivityCard, ActivityCardProps} from './ActivityCard'

interface ActivityLibraryCardBadgeProps {
  className?: string
  children?: React.ReactNode
}

export const ActivityLibraryCardBadge = (props: ActivityLibraryCardBadgeProps) => {
  const {className, children} = props

  return (
    <div
      className={clsx(
        'm-2 rounded-full bg-gold-300 px-2 py-[1px] text-xs font-semibold text-grape-700',
        className
      )}
    >
      {children}
    </div>
  )
}

export const ActivityLibraryCard = (props: ActivityCardProps) => {
  const {className, type, ...rest} = props

  return (
    <ActivityCard
      className={clsx(
        'group transition-shadow focus-within:ring-2 focus-within:ring-primary hover:shadow-md motion-reduce:transition-none',
        className
      )}
      type={type}
      {...rest}
    />
  )
}
