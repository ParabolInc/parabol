import clsx from 'clsx'
import React from 'react'
import {MeetingTypeEnum} from '../../__generated__/ActivityLibraryQuery.graphql'
import {ActivityCard} from './ActivityCard'

interface ActivityLibraryCardBadgeProps {
  className?: string
  children?: React.ReactNode
}

export const ActivityLibraryCardBadge = (props: ActivityLibraryCardBadgeProps) => {
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

interface ActivityLibraryCardProps {
  className?: string
  type: MeetingTypeEnum
  children: React.ReactNode
}

export const ActivityLibraryCard = (props: ActivityLibraryCardProps) => {
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
