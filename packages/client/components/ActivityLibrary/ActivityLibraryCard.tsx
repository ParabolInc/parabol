import clsx from 'clsx'
import React from 'react'
import {ActivityCard, ActivityCardProps} from './ActivityCard'

export const ActivityLibraryCard = (props: ActivityCardProps) => {
  const {className, ...rest} = props

  return (
    <ActivityCard
      className={clsx('focus-within:ring-2 focus-within:ring-primary hover:shadow-md', className)}
      {...rest}
    />
  )
}
