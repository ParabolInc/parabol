import * as RadioGroup from '@radix-ui/react-radio-group'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import * as React from 'react'
import {ComponentPropsWithoutRef, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {CreateNewActivityQuery} from '~/__generated__/CreateNewActivityQuery.graphql'
import estimatedEffortTemplate from '../../../../../static/images/illustrations/estimatedEffortTemplate.png'
import newTemplate from '../../../../../static/images/illustrations/newTemplate.png'
import {AddPokerTemplateMutation$data} from '../../../__generated__/AddPokerTemplateMutation.graphql'
import {AddReflectTemplateMutation$data} from '../../../__generated__/AddReflectTemplateMutation.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useRouter from '../../../hooks/useRouter'
import AddPokerTemplateMutation from '../../../mutations/AddPokerTemplateMutation'
import AddReflectTemplateMutation from '../../../mutations/AddReflectTemplateMutation'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import sortByTier from '../../../utils/sortByTier'
import BaseButton from '../../BaseButton'
import IconLabel from '../../IconLabel'
import NewMeetingTeamPicker from '../../NewMeetingTeamPicker'
import RaisedButton from '../../RaisedButton'
import {ActivityBadge} from '../ActivityBadge'
import {ActivityCard, ActivityCardImage} from '../ActivityCard'
import {CATEGORY_ID_TO_NAME, CATEGORY_THEMES, CategoryID, DEFAULT_CARD_THEME} from '../Categories'

const Bold = (props: ComponentPropsWithoutRef<'span'>) => {
  const {children, className, ...rest} = props

  return (
    <span className={clsx('font-semibold text-slate-800', className)} {...rest}>
      {children}
    </span>
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
      freeCustomRetroTemplatesRemaining
      freeCustomPokerTemplatesRemaining
      preferredTeamId
      teams {
        id
        tier
        name
        orgId
        ...NewMeetingTeamPicker_selectedTeam
        ...NewMeetingTeamPicker_teams
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
  const {viewer} = data
  const {
    teams,
    preferredTeamId,
    freeCustomRetroTemplatesRemaining,
    freeCustomPokerTemplatesRemaining
  } = viewer
  const [selectedTeam, setSelectedTeam] = useState(
    teams.find((team) => team.id === preferredTeamId) ?? sortByTier(teams)[0]!
  )
  const {submitting, error, submitMutation, onError, onCompleted} = useMutationProps()
  const history = useHistory()
  const freeCustomTemplatesRemaining =
    selectedActivity.type === 'retrospective'
      ? freeCustomRetroTemplatesRemaining
      : freeCustomPokerTemplatesRemaining

  const handleCreateRetroTemplate = () => {
    if (submitting) {
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

  const handleUpgrade = () => {
    SendClientSideEvent(atmosphere, 'Upgrade CTA Clicked', {
      upgradeCTALocation: 'createNewTemplateAL',
      meetingType: selectedActivity.type
    })
    history.push(`/me/organizations/${selectedTeam.orgId}/billing`)
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
      <div className='mx-1'>
        <div className='flex basis-[15%] items-center justify-start gap-x-2 px-2'>
          <Link className='p-4' to={`/activity-library/`} replace={true}>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
          <div className='hidden shrink-0 text-lg font-semibold lg:text-xl xl:block'>
            Create New Activity
          </div>
        </div>
      </div>
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
                className='group flex cursor-pointer flex-col items-start space-y-3 rounded-2xl bg-transparent p-1 pb-4 hover:bg-slate-100 focus:outline-sky-500 data-[state=checked]:ring-4 data-[state=checked]:ring-sky-500'
                value={activity.type}
              >
                <ActivityCard
                  className='aspect-320/190 w-80'
                  theme={DEFAULT_CARD_THEME}
                  title={activity.title}
                  type={activity.type}
                >
                  <ActivityCardImage
                    src={activity.image}
                    category={activity.type === 'retrospective' ? 'retrospective' : 'estimation'}
                  />
                </ActivityCard>
                <div className='flex gap-x-3 p-3'>
                  {activity.includedCategories.map((badge) => (
                    <ActivityBadge
                      key={badge}
                      className={clsx('text-white', `${CATEGORY_THEMES[badge].primary}`)}
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
              teamsRef={teams}
              selectedTeamRef={selectedTeam}
              onSelectTeam={(teamId) => {
                const newTeam = teams.find((team) => team.id === teamId)
                newTeam && setSelectedTeam(newTeam)
              }}
            />
          </div>
        </div>
        {error && <div className='px-4 text-tomato-500'>{error.message}</div>}
        <div className='mt-auto flex w-full bg-slate-200 p-2 shadow-card-1'>
          {selectedTeam.tier === 'starter' && freeCustomTemplatesRemaining === 0 ? (
            <div className='flex w-full items-center justify-center gap-4'>
              <span className='pr-4 text-center'>
                Upgrade to the <b>Team Plan</b> to create more custom activities
              </span>

              <RaisedButton
                palette='pink'
                className='h-12 px-4 text-lg font-semibold text-white focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
                onClick={handleUpgrade}
              >
                Upgrade to Team Plan
              </RaisedButton>
            </div>
          ) : (
            <BaseButton
              className='mx-auto h-12 rounded-full bg-sky-500 text-lg font-semibold text-white hover:bg-sky-600 focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:outline-hidden active:ring-sky-600'
              onClick={createCustomActivityLookup[selectedActivity.type]}
            >
              Confirm Format & Team
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  )
}
