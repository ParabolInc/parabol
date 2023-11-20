import clsx from 'clsx'
import React, {PropsWithChildren, useState} from 'react'
import {upperFirst} from '../../utils/upperFirst'
import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {backgroundImgMap, CategoryID, MEETING_TYPE_TO_CATEGORY} from './Categories'
import {twMerge} from 'tailwind-merge'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'

export interface CardTheme {
  primary: string
  secondary: string
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
      style={{backgroundImage: `url(${backgroundSrc})`, backgroundSize: 'cover'}}
    >
      <img
        className='absolute top-0 left-0 z-10 h-full w-full object-contain p-10'
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
  badge?: React.ReactNode
  children?: React.ReactNode
  type?: MeetingTypeEnum
}

const templates = [
  {name: 'Template 1', description: 'Description for template 1', color: 'text-red-500'},
  {name: 'Template 2', description: 'Description for template 2', color: 'text-green-500'},
  {name: 'Template 3', description: 'Description for template 3', color: 'text-blue-500'},
  {name: 'Template 4', description: 'Description for template 4', color: 'text-yellow-500'}
]

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, children, type, badge} = props
  const category = type && MEETING_TYPE_TO_CATEGORY[type]
  const [showTooltip, setShowTooltip] = useState(false)

  const handleMouseEnter = () => {
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div
      className='flex w-full flex-col'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={twMerge(
          'relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg',
          `bg-${theme.secondary}`,
          className
        )}
      >
        <div className='flex-1'>
          {children}
          <div className='absolute bottom-0 right-0'>{badge}</div>
        </div>
      </div>
      {title && category && (
        <div className='mt-2 px-2 pb-2'>
          <div className='truncate pb-1 text-lg leading-5 text-slate-800'>{title}</div>
          <div className={clsx('font-semibold italic', `text-${theme.primary}`)}>
            {upperFirst(category)}
          </div>
        </div>
      )}
      <Tooltip open={showTooltip}>
        <TooltipTrigger asChild>
          <div className='h-50 w-50 text-sky-500 hover:text-sky-700' />
        </TooltipTrigger>
        <TooltipContent className='rounded-lg bg-white p-4 text-left text-slate-700 shadow-lg hover:cursor-pointer'>
          <div className='mb-2 text-left text-lg'>{title}</div>
          {templates.map((template, index) => (
            <div key={index} className='mb-1 flex items-start py-1'>
              <span className={clsx('h-2 w-2 rounded-full ', template.color, 'mr-2 mt-1')}></span>
              <div>
                <div className='text-md font-semibold'>{template.name}</div>
                <div className='text-sm font-normal'>{template.description}</div>
              </div>
            </div>
          ))}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
