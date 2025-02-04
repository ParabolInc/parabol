import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import * as React from 'react'
import {PropsWithChildren, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {twMerge} from 'tailwind-merge'
import {ActivityCard_template$key} from '../../__generated__/ActivityCard_template.graphql'
import {MeetingTypeEnum} from '../../__generated__/MeetingSelectorQuery.graphql'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {upperFirst} from '../../utils/upperFirst'
import {ActivityLibraryCardDescription} from './ActivityLibraryCardDescription'
import {CategoryID, MEETING_TYPE_TO_CATEGORY} from './Categories'
import {backgroundImgMap} from './backgroundImgMap'

export interface CardTheme {
  primary: string
  secondary: string
  text: string
}

type ActivityCardImageProps = {
  className?: string
  src: string
  category: CategoryID
}

export const ActivityCardImage = (props: PropsWithChildren<ActivityCardImageProps>) => {
  const {className, src, category} = props
  const backgroundSrc = backgroundImgMap[category]

  return (
    <div
      className={twMerge(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        className
      )}
    >
      <img className='object-contain' src={backgroundSrc} alt='' />
      <img
        className='absolute top-0 left-0 h-full w-full object-contain p-10'
        src={src}
        alt='Card Illustration'
      />
    </div>
  )
}

export interface ActivityCardProps {
  className?: string
  theme: CardTheme
  title?: string
  children?: React.ReactNode
  type?: MeetingTypeEnum
  templateRef?: ActivityCard_template$key
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, children, type, templateRef} = props
  const category = type && MEETING_TYPE_TO_CATEGORY[type]
  const [showTooltip, setShowTooltip] = useState(false)
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)

  const template = useFragment(
    graphql`
      fragment ActivityCard_template on MeetingTemplate {
        ...ActivityLibraryCardDescription_template
      }
    `,
    templateRef ?? null
  )

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowTooltip(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
    }
    setShowTooltip(false)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) {
        clearTimeout(hoverTimeout.current)
      }
    }
  }, [])

  return (
    <div
      className='flex w-full flex-col rounded-xl p-2'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={twMerge(
          'relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg',
          theme.secondary,
          className
        )}
      >
        <div className='flex-1'>{children}</div>
        {template && (
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <div className='h-50 w-50 text-sky-500 hover:text-sky-700' />
            </TooltipTrigger>
            <TooltipContent
              side='bottom'
              align='center'
              sideOffset={20}
              className='max-w-md rounded-lg bg-white p-4 text-left whitespace-normal text-slate-700 shadow-lg hover:cursor-pointer sm:max-w-sm'
            >
              <div className='mb-2 text-left text-lg font-semibold'>{title}</div>
              <ActivityLibraryCardDescription templateRef={template} />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {title && category && (
        <div className='mt-2 px-2 pb-2'>
          <div className='truncate pb-1 text-lg leading-5 text-slate-800'>{title}</div>
          <div className={clsx('font-semibold italic', `${theme.text}`)}>
            {upperFirst(category)}
          </div>
        </div>
      )}
    </div>
  )
}
