import clsx from 'clsx'
import React, {ComponentPropsWithoutRef, PropsWithChildren} from 'react'
import {MeetingTypeEnum} from '../../__generated__/ActivityLibraryQuery.graphql'

export const ActivityCardImage = (
  props: PropsWithChildren<React.ImgHTMLAttributes<HTMLImageElement>>
) => {
  const {className, src} = props

  return (
    <div className='absolute inset-0 top-5 flex'>
      <img className={clsx('m-auto h-[76px] w-auto object-contain', className)} src={src} />
    </div>
  )
}

export const ActivityCardTitle = (props: ComponentPropsWithoutRef<'div'>) => {
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

interface ActivityCardProps {
  className?: string
  type: MeetingTypeEnum
  children: React.ReactNode
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, type, children} = props
  return (
    <div
      className={clsx(
        'relative flex aspect-[156/120] w-auto flex-col overflow-hidden rounded-lg py-2 px-3 md:aspect-[256/160]',
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
