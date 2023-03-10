import clsx from 'clsx'
import React from 'react'
import {MeetingTypeEnum} from '../../__generated__/ActivityLibraryQuery.graphql'

interface CardTheme {
  primary: string
  secondary: string
}

export const MeetingThemes: Record<MeetingTypeEnum, CardTheme> = {
  action: {primary: 'bg-aqua-400', secondary: 'bg-[#CBECF0]'},
  poker: {primary: 'bg-tomato-500', secondary: 'bg-[#FFE2E0]'},
  retrospective: {primary: 'bg-grape-500', secondary: 'bg-[#F2E1F7]'},
  teamPrompt: {primary: 'bg-aqua-400', secondary: 'bg-[#CBECF0]'}
}

interface Props {
  className?: string
  type: MeetingTypeEnum
  children: React.ReactNode
}

export const ActivityCard = (props: Props) => {
  const {className, type, children} = props
  return (
    <div
      className={clsx(
        'relative flex aspect-[156/120] max-h-[160px] w-auto flex-col overflow-hidden rounded-lg p-3 md:aspect-[256/160]',
        MeetingThemes[type].secondary,
        className
      )}
    >
      <div
        className={clsx(
          'absolute top-0 right-0 h-8 w-8 rounded-bl-full',
          MeetingThemes[type].primary
        )}
      />
      <div
        className={clsx(
          'absolute bottom-0 left-0 h-8 w-8 rounded-tr-full',
          MeetingThemes[type].primary
        )}
      />
      {children}
    </div>
  )
}
