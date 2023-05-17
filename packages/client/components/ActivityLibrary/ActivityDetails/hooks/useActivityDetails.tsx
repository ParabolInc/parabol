import React, {useState} from 'react'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CategoryID, QUICK_START_CATEGORY_ID} from '../../Categories'
import {MeetingTypeEnum} from '../../../../../server/postgres/types/Meeting'
import {ActivityId, getActivityIllustration} from '../../ActivityIllustrations'
import {useHistory} from 'react-router'
import {TemplateDetails} from '../TemplateDetails'
import EditableTemplateName from '../../../../modules/meeting/components/EditableTemplateName'
import {MeetingDetails} from '../MeetingDetails'
import ActivityDetailsSidebar from '../../ActivityDetailsSidebar'
import AddPokerTemplateDimension from '../../../../modules/meeting/components/AddPokerTemplateDimension'
import AddTemplatePrompt from '../../../../modules/meeting/components/AddTemplatePrompt'
import TemplateDimensionList from '../../../../modules/meeting/components/TemplateDimensionList'
import TemplatePromptList from '../../../../modules/meeting/components/TemplatePromptList'

export type NoTemplatesMeeting = Exclude<MeetingTypeEnum, 'retrospective' | 'poker'>

export const MEETING_ID_TO_NAME: Record<NoTemplatesMeeting, string> = {
  teamPrompt: 'Standup',
  action: 'Check In'
}

export const MEETING_TYPE_TO_CATEGORY_ID: Record<NoTemplatesMeeting, CategoryID> = {
  action: 'standup',
  teamPrompt: 'standup'
}

export const MEETING_TYPE_DESCRIPTION_LOOKUP: Record<MeetingTypeEnum, React.ReactNode> = {
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

export const MEETING_TYPE_TIP_LOOKUP: Record<MeetingTypeEnum, React.ReactNode> = {
  teamPrompt: <>push takeaway tasks to your backlog</>,
  action: null,
  retrospective: <>push takeaway tasks to your backlog</>,
  poker: <>sync estimations with your backlog</>
}

export interface Activity {
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
  templateConfig?: React.ReactNode
  sidebar?: React.ReactNode
}

export const useActivityDetails = (
  activityIdParam: string,
  data: ActivityDetailsQuery['response']
) => {
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
      description: MEETING_TYPE_DESCRIPTION_LOOKUP[type],
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
    (edge) => edge.node.id === activityIdParam
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

  const templateConfigLookup: Record<MeetingTypeEnum, React.ReactNode> = {
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
    description: MEETING_TYPE_DESCRIPTION_LOOKUP[type],
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
    templateConfig: templateConfigLookup[type],
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
