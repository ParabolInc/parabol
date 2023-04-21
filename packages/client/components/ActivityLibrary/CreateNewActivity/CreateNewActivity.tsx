import React, {ComponentPropsWithoutRef, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import * as RadioGroup from '@radix-ui/react-radio-group'
import clsx from 'clsx'
import {Link} from 'react-router-dom'

import newTemplate from '../../../../../static/images/illustrations/newTemplate.png'
import estimatedEffortTemplate from '../../../../../static/images/illustrations/estimatedEffortTemplate.png'

import {CreateNewActivityQuery} from '~/__generated__/CreateNewActivityQuery.graphql'
import {ActivityCard} from '../ActivityCard'
import {ActivityBadge} from '../ActivityBadge'

import IconLabel from '../../IconLabel'
import {ActivityLibraryHeader} from '../ActivityLibraryHeader'
import NewMeetingTeamPicker from '../../NewMeetingTeamPicker'
import sortByTier from '../../../utils/sortByTier'
import {useHistory} from 'react-router'
import {AddReflectTemplateMutation$data} from '../../../__generated__/AddReflectTemplateMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import {Threshold} from '../../../types/constEnums'
import useRouter from '../../../hooks/useRouter'

type ActivityType = 'retrospective' | 'poker'

const SUPPORTED_CUSTOM_ACTIVITIES = [
  {
    title: 'Process Feedback',
    type: 'retrospective' as ActivityType,
    includedCategories: ['retrospective', 'feedback', 'strategy'],
    image: newTemplate,
    badges: [
      {category: 'retrospective', theme: 'bg-grape-500 text-white', title: 'Retrospective'},
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
    type: 'poker' as ActivityType,
    includedCategories: ['estimation'],
    image: estimatedEffortTemplate,
    badges: [{category: 'estimation', theme: 'bg-tomato-500 text-white', title: 'Esimation'}],
    phases: [
      {title: 'Select', description: 'or create issues to score'},
      {title: 'Vote', description: 'on 1 or many scoring dimensions'},
      {title: 'Push', description: 'esimations to your backlog'}
    ]
  }
]

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
        id
        tier
        name
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
      }
      availableTemplates(first: 100) @connection(key: "ActivityLibrary_availableTemplates") {
        edges {
          node {
            name
            teamId
          }
        }
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<CreateNewActivityQuery>
}

export const CreateNewActivity = (props: Props) => {
  const {queryRef} = props
  const atmosphere = useAtmosphere()
  const data = usePreloadedQuery<CreateNewActivityQuery>(query, queryRef)

  const {match} = useRouter<{categoryId?: string}>()
  const {params} = match

  const [selectedActivity, setSelectedActivity] = useState(() => {
    const defaultActivity = SUPPORTED_CUSTOM_ACTIVITIES[0]!
    const categoryId = params.categoryId
    if (!categoryId) return defaultActivity

    const selectedActivity = SUPPORTED_CUSTOM_ACTIVITIES.find((category) =>
      category.includedCategories.includes(categoryId)
    )
    if (!selectedActivity) return defaultActivity
    return selectedActivity
  })
  const [selectedTeam, setSelectedTeam] = useState(sortByTier(data.viewer.teams)[0]!)
  const {submitting, error, submitMutation, onError, onCompleted} = useMutationProps()
  const history = useHistory()

  const handleCreateRetroTemplate = () => {
    if (submitting) {
      return
    }

    const teamTemplates = data.viewer.availableTemplates.edges.filter(
      (template) => template.node.teamId === selectedTeam.id
    )

    if (teamTemplates.length >= Threshold.MAX_RETRO_TEAM_TEMPLATES) {
      onError(new Error('You may only have 20 templates per team. Please remove one first.'))
      return
    }
    if (teamTemplates.find((template) => template.node.name === '*New Template')) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      return
    }

    submitMutation()
    AddReflectTemplateMutation(
      atmosphere,
      {teamId: selectedTeam.id},
      {
        onError,
        onCompleted: (res: AddReflectTemplateMutation$data) => {
          const templateId = res.addReflectTemplate?.reflectTemplate?.id
          if (templateId) {
            history.push(`/activity-library/details/${templateId}`, {
              prevCategory: params.categoryId
            })
          }
          onCompleted()
        }
      }
    )
  }

  const handleCreatePokerTemplate = () => {
    //TODO: implement me
  }

  const createCustomActivityLookup: Record<ActivityType, () => void> = {
    retrospective: handleCreateRetroTemplate,
    poker: handleCreatePokerTemplate
  }

  const handleActivitySelection = (activityType: ActivityType) => {
    setSelectedActivity(
      SUPPORTED_CUSTOM_ACTIVITIES.find((category) => category.type === activityType)!
    )
  }

  return (
    <div className='h-full w-full flex-col bg-white'>
      <ActivityLibraryHeader
        title='Create New Activity'
        leftNavigation={
          <Link className='mx-4' to={`/activity-library/`} replace={true}>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
        }
      />
      <div className='flex flex-col items-center gap-y-8'>
        <h1 className='text-lg font-normal'>
          Choose an <span className='font-semibold'>Activity Format:</span>
        </h1>
        <RadioGroup.Root
          className='mx-auto flex flex-col gap-8 sm:flex-row'
          aria-label='Choose an Activity Format'
          value={selectedActivity?.type}
          onValueChange={handleActivitySelection}
        >
          {SUPPORTED_CUSTOM_ACTIVITIES.map((category) => {
            return (
              <RadioGroup.Item
                key={category.title}
                className='group flex cursor-pointer flex-col items-start space-y-3 bg-transparent'
                value={category.type}
              >
                <ActivityCard
                  className='w-80 group-data-[state=checked]:ring-4 group-data-[state=checked]:ring-sky-500 group-data-[state=checked]:ring-offset-4'
                  title={category.title}
                  titleAs={CategoryTitle}
                  imageSrc={category.image}
                />
                <div className='flex gap-x-3 p-3'>
                  {category.badges.map((badge) => (
                    <ActivityBadge key={badge.category} className={badge.theme}>
                      {badge.title}
                    </ActivityBadge>
                  ))}
                </div>
                <div className='mx-5 space-y-2 text-left'>
                  {category.phases.map((phase) => (
                    <div key={phase.title}>
                      <span className='font-semibold text-slate-800'>{phase.title}</span>{' '}
                      {phase.description}
                    </div>
                  ))}
                </div>
              </RadioGroup.Item>
            )
          })}
        </RadioGroup.Root>
        <div className='flex flex-col items-center space-y-4 px-4'>
          <div className='text-lg'>
            <span className='font-semibold'>Select the team</span> to manage this new activity
            template:
          </div>
          <div className='w-full px-4'>
            <NewMeetingTeamPicker
              teamsRef={data.viewer.teams}
              selectedTeamRef={selectedTeam}
              onSelectTeam={(teamId) => {
                const newTeam = data.viewer.teams.find((team) => team.id === teamId)
                newTeam && setSelectedTeam(newTeam)
              }}
            />
          </div>
        </div>
        <button className='hidden' onClick={createCustomActivityLookup[selectedActivity.type]}>
          Create template
        </button>
        {error && <div className='text-tomato-500'>{error}</div>}
      </div>
    </div>
  )
}
