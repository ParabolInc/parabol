import React, {ComponentPropsWithoutRef} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'

import newTemplate from '../../../../../static/images/illustrations/newTemplate.png'
import estimatedEffortTemplate from '../../../../../static/images/illustrations/estimatedEffortTemplate.png'

import {CreateNewActivityQuery} from '~/__generated__/CreateNewActivityQuery.graphql'
import useModal from '../../../hooks/useModal'
import TeamPickerModal from '../TeamPickerModal'
import {ActivityCard} from '../ActivityCard'
import {ActivityBadge} from '../ActivityBadge'
import clsx from 'clsx'
import {Link} from 'react-router-dom'
import IconLabel from '../../IconLabel'
import {ActivityLibraryHeader, ActivityLibraryHeaderTitle} from '../ActivityLibraryHeader'

const CategoryTitle = (props: ComponentPropsWithoutRef<'div'>) => {
  const {children, className, ...rest} = props

  return (
    <div
      className={clsx('p-4 text-lg font-semibold leading-5 text-slate-700', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
const query = graphql`
  query CreateNewActivityQuery {
    viewer {
      featureFlags {
        retrosInDisguise
      }
      teams {
        ...CreateActivityCard_teams
      }
    }
  }
`

const CATEGORIES = [
  {
    title: 'Process Feedback',
    image: newTemplate,
    badges: [
      {category: 'retro', theme: 'bg-grape-500 text-white', title: 'Retrospective'},
      {category: 'feedback', theme: 'bg-jade-400 text-white', title: 'Feedback'},
      {category: 'strategy', theme: 'bg-rose-500 text-white', title: 'Strategy'}
    ],
    phases: [
      {title: 'Add', description: 'comments'},
      {title: 'Group', description: 'comments'},
      {title: 'Discuss', description: 'topics'},
      {title: 'Vote', description: 'on topics'},
      {title: 'Create', description: 'takeaway tasks'}
    ]
  },
  {
    title: 'Estimate Items',
    image: estimatedEffortTemplate,
    badges: [{category: 'estimation', theme: 'bg-tomato-500 text-white', title: 'Esimation'}],
    phases: [
      {title: 'Select', description: 'or create issues to score'},
      {title: 'Vote', description: 'on 1 or many scoring dimensions'},
      {title: 'Push', description: 'esimations to your backlog'}
    ]
  }
]

interface Props {
  queryRef: PreloadedQuery<CreateNewActivityQuery>
}

export const CreateNewActivity = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<CreateNewActivityQuery>(query, queryRef)

  return (
    <div className='h-full w-full flex-col bg-white'>
      <ActivityLibraryHeader
        leftNavigation={
          <>
            <Link className='mr-4' to={`/activity-library/`}>
              <IconLabel icon={'arrow_back'} iconLarge />
            </Link>
            <div className='pr-2 text-xl font-semibold'>Create New Activity</div>
          </>
        }
      />
      <div className='flex flex-col items-center'>
        <h1 className='text-lg font-normal'>
          Choose an <span className='font-semibold'>Activity Format</span>
        </h1>
        <div className='mx-auto flex flex-col gap-8 sm:flex-row'>
          {CATEGORIES.map((category) => {
            return (
              <div key={category.title} className='space-y-3'>
                <ActivityCard
                  className='w-80'
                  title={category.title}
                  titleAs={CategoryTitle}
                  imageSrc={category.image}
                />
                <div className='mx-4 flex'>
                  {category.badges.map((badge) => (
                    <ActivityBadge key={badge.category} className={badge.theme}>
                      {badge.title}
                    </ActivityBadge>
                  ))}
                </div>
                <div className='mx-5 space-y-2'>
                  {category.phases.map((phase) => (
                    <div key={phase.title}>
                      <span className='font-semibold text-slate-800'>{phase.title}</span>{' '}
                      {phase.description}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
