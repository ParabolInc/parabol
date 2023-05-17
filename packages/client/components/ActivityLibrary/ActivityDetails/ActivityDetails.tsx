import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CATEGORY_THEMES, CategoryID, QUICK_START_CATEGORY_ID} from '../Categories'
import {MeetingTypeEnum} from '../../../../server/postgres/types/Meeting'
import {ActivityId, getActivityIllustration} from '../ActivityIllustrations'
import clsx from 'clsx'
import {Redirect, useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import IconLabel from '../../IconLabel'
import {ActivityCard} from '../ActivityCard'
import {TemplateDetails} from './TemplateDetails'
import EditableTemplateName from '../../../modules/meeting/components/EditableTemplateName'
import {MeetingDetails} from './MeetingDetails'
import ActivityDetailsSidebar from '../ActivityDetailsSidebar'
import AddPokerTemplateDimension from '../../../modules/meeting/components/AddPokerTemplateDimension'
import AddTemplatePrompt from '../../../modules/meeting/components/AddTemplatePrompt'
import TemplateDimensionList from '../../../modules/meeting/components/TemplateDimensionList'
import TemplatePromptList from '../../../modules/meeting/components/TemplatePromptList'

graphql`
  fragment ActivityDetails_template on MeetingTemplate {
    id
    name
    type
    category
    orgId
    teamId
    isFree
    scope
    team {
      editingScaleId
      ...PokerTemplateScaleDetails_team
    }
    ...ActivityDetailsSidebar_template
    ...EditableTemplateName_teamTemplates
    ...ReflectTemplateDetailsTemplate @relay(mask: false)
    ...PokerTemplateDetailsTemplate @relay(mask: false)
    ...TemplateDetails_templates
    ...useTemplateDescription_template
  }
`

export const query = graphql`
  query ActivityDetailsQuery {
    viewer {
      tier
      availableTemplates(first: 100) @connection(key: "ActivityDetails_availableTemplates") {
        edges {
          node {
            ...ActivityDetails_template @relay(mask: false)
          }
        }
      }
      teams {
        id
        ...ActivityDetailsSidebar_teams
        ...TeamPickerModal_teams
      }
      organizations {
        id
      }

      ...TemplateDetails_user
    }
  }
`

export type NoTemplatesMeeting = Exclude<MeetingTypeEnum, 'retrospective' | 'poker'>

const MEETING_ID_TO_NAME: Record<NoTemplatesMeeting, string> = {
  teamPrompt: 'Standup',
  action: 'Check In'
}

export const MEETING_TYPE_TO_CATEGORY_ID: Record<NoTemplatesMeeting, CategoryID> = {
  action: 'standup',
  teamPrompt: 'standup'
}

export const SUPPORTED_TYPES: MeetingTypeEnum[] = ['retrospective', 'poker', 'teamPrompt']

export const descriptionLookup: Record<MeetingTypeEnum, React.ReactNode> = {
  teamPrompt: (
    <>
      This is the space for teammates to give async updates on their work. You can discuss how work
      is going using a thread, or hop on a call and review the updates together.
    </>
  ),
  retrospective: (
    <>
      <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common themes and vote on
      the hottest topics. As you <b>discuss topics</b>, create <b>takeaway tasks</b> that can be
      integrated with your backlog.
    </>
  ),
  poker: (
    <>
      <b>Select</b> a list of issues from your integrated backlog, or create new issues to estimate.{' '}
      <b>Estimate</b> with your team on 1 or many scoring dimensions. <b>Push</b> the estimations to
      your backlog.
    </>
  ),
  action: null
}

export const tipLookup: Record<MeetingTypeEnum, React.ReactNode> = {
  teamPrompt: <>push takeaway tasks to your backlog</>,
  action: null,
  retrospective: <>push takeaway tasks to your backlog</>,
  poker: <>sync estimations with your backlog</>
}

interface Activity {
  id: ActivityId
  name: React.ReactNode
  illustration: string
  usageStats?: any
  category: CategoryID
  categoryLink: string
  type: MeetingTypeEnum
  description: React.ReactNode
  details: React.ReactNode
  isTemplate: boolean
  templateDetails?: React.ReactNode
  sidebar?: React.ReactNode
}

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  activityId: string
}

const useActivity = (activityIdParam: string, data: ActivityDetailsQuery['response']) => {
  const {viewer} = data
  const {availableTemplates, teams} = viewer
  const [isEditing, setIsEditing] = useState(false)

  const history = useHistory<{prevCategory?: string; edit?: boolean}>()
  const prevCategory = history.location.state?.prevCategory

  // for now, standups and check-ins don't have templates
  const meetingIds = ['teamPrompt', 'action']
  if (meetingIds.includes(activityIdParam)) {
    const activityId = activityIdParam as ActivityId
    const type = activityId as NoTemplatesMeeting
    const category = MEETING_TYPE_TO_CATEGORY_ID[type]
    const activity: Activity = {
      id: activityId,
      name: (
        <div className='text-[32px] font-semibold leading-tight text-slate-700'>
          {MEETING_ID_TO_NAME[type]}
        </div>
      ),
      illustration: getActivityIllustration(activityId),
      category,
      categoryLink: `/activity-library/category/${
        prevCategory ?? category ?? QUICK_START_CATEGORY_ID
      }`,
      type: activityId as MeetingTypeEnum,
      description: descriptionLookup[type],
      isTemplate: false,
      details: <MeetingDetails type={type} category={category} />
    }

    return {
      isEditing,
      setIsEditing,
      activity
    }
  }

  const selectedTemplate = availableTemplates.edges.find(
    (edge) => edge.node.id === activityIdParam && SUPPORTED_TYPES.includes(edge.node.type)
  )?.node
  if (!selectedTemplate) return {isEditing, setIsEditing, activity: null}

  const activityId = selectedTemplate.id as ActivityId
  const category = selectedTemplate.category as CategoryID
  const type = selectedTemplate.type
  const teamTemplates = availableTemplates.edges
    .map((edge) => edge.node)
    .filter((edge) => edge.teamId === selectedTemplate.teamId)
  const teamIds = teams.map((team) => team.id)
  const isOwner = teamIds.includes(selectedTemplate.teamId)

  const templateDetailsLookup: Record<MeetingTypeEnum, React.ReactNode> = {
    retrospective: (
      <>
        <TemplatePromptList
          isOwner={isOwner && isEditing}
          prompts={selectedTemplate.prompts!}
          templateId={selectedTemplate.id}
        />
        {isOwner && isEditing && (
          <AddTemplatePrompt templateId={selectedTemplate.id} prompts={selectedTemplate.prompts!} />
        )}
      </>
    ),
    poker: (
      <>
        <TemplateDimensionList
          isOwner={isOwner}
          readOnly={!isEditing}
          dimensions={selectedTemplate.dimensions!}
          templateId={selectedTemplate.id}
        />
        {isOwner && isEditing && (
          <AddPokerTemplateDimension
            templateId={selectedTemplate.id}
            dimensions={selectedTemplate.dimensions!}
          />
        )}
      </>
    ),
    action: null,
    teamPrompt: null
  }

  const activity: Activity = {
    id: activityId,
    name: (
      <EditableTemplateName
        className='text-[32px] leading-9'
        name={selectedTemplate.name}
        templateId={selectedTemplate.id}
        teamTemplates={teamTemplates}
        isOwner={isOwner && isEditing}
      />
    ),
    illustration: getActivityIllustration(activityId),
    category,
    categoryLink: `/activity-library/category/${
      prevCategory ?? category ?? QUICK_START_CATEGORY_ID
    }`,
    type,
    description: descriptionLookup[type],
    isTemplate: true,
    details: (
      <TemplateDetails
        selectedTemplate={selectedTemplate}
        viewerRef={viewer}
        templatesRef={availableTemplates.edges.map((edge) => edge.node)}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    ),
    templateDetails: templateDetailsLookup[type],
    sidebar: (
      <ActivityDetailsSidebar
        selectedTemplateRef={selectedTemplate}
        teamsRef={teams}
        isOpen={!isEditing}
      />
    )
  }

  return {
    isEditing,
    setIsEditing,
    activity
  }
}

const ActivityDetails = (props: Props) => {
  const {queryRef, activityId: activityIdParam} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {activity, isEditing} = useActivity(activityIdParam, data)

  if (!activity) {
    return <Redirect to='/activity-library' />
  }

  return (
    <div className='flex h-full flex-col bg-white'>
      <div className='flex grow'>
        <div className='mt-4 grow'>
          <div className='mb-14 ml-4 flex h-min w-max items-center'>
            <div className='mr-4'>
              <Link to={activity.categoryLink}>
                <IconLabel icon={'arrow_back'} iconLarge />
              </Link>
            </div>
            <div className='w-max text-xl font-semibold'>Start Activity</div>
          </div>
          <div className='mx-auto w-min'>
            <div
              className={clsx(
                'flex w-full flex-col justify-start pl-4 pr-14 xl:flex-row xl:justify-center xl:pl-14',
                isEditing && 'lg:flex-row lg:justify-center lg:pl-14'
              )}
            >
              <ActivityCard
                className='ml-14 mb-8 h-[200px] w-80 xl:ml-0 xl:mb-0'
                theme={CATEGORY_THEMES[activity.category]}
                imageSrc={activity.illustration}
                badge={null}
              />
              <div className='pb-20'>
                <div className='mb-10 space-y-2 pl-14'>
                  <div className='flex min-h-[40px] items-center'>{activity.name}</div>
                  <div className='space-y-6'>{activity.details}</div>
                </div>
                {activity.templateDetails ? activity.templateDetails : null}
              </div>
            </div>
          </div>
        </div>
        {activity.sidebar ? activity.sidebar : null}
      </div>
    </div>
  )
}

export default ActivityDetails
