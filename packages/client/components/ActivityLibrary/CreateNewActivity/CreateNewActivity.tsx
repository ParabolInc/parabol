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
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES, CategoryID, DEFAULT_CARD_THEME} from '../Categories'
import BaseButton from '../../BaseButton'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import {AddPokerTemplateMutation$data} from '../../../__generated__/AddPokerTemplateMutation.graphql'

const Bold = (props: ComponentPropsWithoutRef<'span'>) => {
  const {children, className, ...rest} = props

  return (
    <span className={clsx('font-semibold text-slate-800', className)} {...rest}>
      {children}
    </span>
  )
}

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

type ActivityType = 'retrospective' | 'poker'

type SupportedActivity = {
  title: string
  type: ActivityType
  includedCategories: CategoryID[]
  image: string
  phases: React.ReactNode
}

const SUPPORTED_CUSTOM_ACTIVITIES: SupportedActivity[] = [
  {
    title: 'Process Feedback',
    type: 'retrospective',
    includedCategories: ['retrospective', 'feedback', 'strategy'],
    image: newTemplate,
    phases: (
      <>
        <div>
          <Bold>Add</Bold> comments
        </div>
        <div>
          <Bold>Group</Bold> comments
        </div>
        <div>
          <Bold>Discuss</Bold> topics
        </div>
        <div>
          <Bold>Vote</Bold> on topics
        </div>
        <div>
          <Bold>Create</Bold> takeaway tasks
        </div>
      </>
    )
  },
  {
    title: 'Estimate Items',
    type: 'poker',
    includedCategories: ['estimation'],
    image: estimatedEffortTemplate,
    phases: (
      <>
        <div>
          <Bold>Select</Bold> or create issues to score
        </div>
        <div>
          <Bold>Vote</Bold> on 1 or many scoring dimensions
        </div>
        <div>
          <Bold>Push</Bold> esimations to your backlog
        </div>
      </>
    )
  }
]

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
      availableTemplates(first: 200) @connection(key: "ActivityLibrary_availableTemplates") {
        edges {
          node {
            name
            teamId
            type
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
    if (!params.categoryId) return defaultActivity

    const selectedActivity = SUPPORTED_CUSTOM_ACTIVITIES.find((activity) =>
      activity.includedCategories.includes(categoryId as CategoryID)
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
      (template) =>
        template.node.teamId === selectedTeam.id && template.node.type === 'retrospective'
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
              prevCategory: params.categoryId,
              edit: true
            })
          }
          onCompleted()
        }
      }
    )
  }

  const handleCreatePokerTemplate = () => {
    if (submitting) {
      return
    }

    const teamTemplates = data.viewer.availableTemplates.edges.filter(
      (template) => template.node.teamId === selectedTeam.id && template.node.type === 'poker'
    )

    if (teamTemplates.length >= Threshold.MAX_POKER_TEAM_TEMPLATES) {
      onError(new Error('You may only have 20 templates per team. Please remove one first.'))
      return
    }
    if (teamTemplates.find((template) => template.node.name === '*New Template')) {
      onError(new Error('You already have a new template. Try renaming that one first.'))
      return
    }

    submitMutation()
    AddPokerTemplateMutation(
      atmosphere,
      {teamId: selectedTeam.id},
      {
        onError,
        onCompleted: (res: AddPokerTemplateMutation$data) => {
          const templateId = res.addPokerTemplate?.pokerTemplate?.id
          if (templateId) {
            history.push(`/activity-library/details/${templateId}`, {
              prevCategory: params.categoryId,
              edit: true
            })
          }
          onCompleted()
        }
      }
    )
  }

  const createCustomActivityLookup: Record<ActivityType, () => void> = {
    retrospective: handleCreateRetroTemplate,
    poker: handleCreatePokerTemplate
  }

  const handleActivitySelection = (activityType: ActivityType) => {
    setSelectedActivity(
      SUPPORTED_CUSTOM_ACTIVITIES.find((acitivty) => acitivty.type === activityType)!
    )
  }

  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <ActivityLibraryHeader
        title='Create New Activity'
        leftNavigation={
          <Link className='p-4' to={`/activity-library/`} replace={true}>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
        }
      />
      <div className='flex flex-1 flex-col items-center gap-y-8'>
        <h1 className='text-lg font-normal'>
          Choose an <span className='font-semibold'>Activity Format:</span>
        </h1>
        <RadioGroup.Root
          className='mx-auto flex flex-col gap-8 sm:flex-row'
          aria-label='Choose an Activity Format'
          value={selectedActivity?.type}
          onValueChange={handleActivitySelection}
        >
          {SUPPORTED_CUSTOM_ACTIVITIES.map((activity) => {
            return (
              <RadioGroup.Item
                key={activity.title}
                className='group flex cursor-pointer flex-col items-start space-y-3 rounded-lg bg-transparent p-1 focus:outline-none focus:ring-2 focus:ring-offset-8'
                value={activity.type}
              >
                <ActivityCard
                  className='w-80 group-data-[state=checked]:ring-4 group-data-[state=checked]:ring-sky-500 group-data-[state=checked]:ring-offset-4'
                  theme={DEFAULT_CARD_THEME}
                  title={activity.title}
                  titleAs={CategoryTitle}
                  imageSrc={activity.image}
                />
                <div className='flex gap-x-3 p-3'>
                  {activity.includedCategories.map((badge) => (
                    <ActivityBadge
                      key={badge}
                      className={clsx('text-white', CATEGORY_THEMES[badge].primary)}
                    >
                      {CATEGORY_ID_TO_NAME[badge]}
                    </ActivityBadge>
                  ))}
                </div>
                <div className='mx-5 space-y-2 text-left'>{activity.phases}</div>
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
        {error && <div className='px-4 text-tomato-500'>{error.message}</div>}
        <div className='mt-auto flex w-full bg-slate-200 p-2 shadow-card-1'>
          <BaseButton
            className='mx-auto h-12 rounded-full bg-sky-500 text-lg font-semibold text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 active:ring-sky-600'
            onClick={createCustomActivityLookup[selectedActivity.type]}
          >
            Confirm Format & Team
          </BaseButton>
        </div>
      </div>
    </div>
  )
}
