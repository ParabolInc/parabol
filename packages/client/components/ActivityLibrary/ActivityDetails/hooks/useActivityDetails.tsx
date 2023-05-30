import React from 'react'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CategoryID} from '../../Categories'
import {MeetingTypeEnum} from '../../../../../server/postgres/types/Meeting'
import {ActivityId, getActivityIllustration} from '../../ActivityIllustrations'

export type NoTemplatesMeeting = Exclude<MeetingTypeEnum, 'retrospective' | 'poker'>

const MEETING_ID_TO_NAME: Record<NoTemplatesMeeting, string> = {
  teamPrompt: 'Standup',
  action: 'Team Check-In'
}

const MEETING_TYPE_TO_CATEGORY_ID: Record<NoTemplatesMeeting, CategoryID> = {
  action: 'standup',
  teamPrompt: 'standup'
}

const ACTIVITY_TYPE_DATA_LOOKUP: Record<
  MeetingTypeEnum,
  {description: React.ReactNode; integrationsTip: React.ReactNode}
> = {
  teamPrompt: {
    description: (
      <>
        This is the space for teammates to give async updates on their work. You can discuss how
        work is going using a thread, or hop on a call and review the updates together.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  },
  retrospective: {
    description: (
      <>
        <b>Reflect</b> on what’s working or not on your team. <b>Group</b> common themes and vote on
        the hottest topics. As you <b>discuss topics</b>, create <b>takeaway tasks</b> that can be
        integrated with your backlog.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  },
  poker: {
    description: (
      <>
        <b>Select</b> a list of issues from your integrated backlog, or create new issues to
        estimate. <b>Estimate</b> with your team on 1 or many scoring dimensions. <b>Push</b> the
        estimations to your backlog.
      </>
    ),
    integrationsTip: <>sync estimations with your backlog</>
  },
  action: {
    description: (
      <>
        This is a space to check in as a team. Share a personal update using the <b>Icebreaker</b>{' '}
        phase. Give a brief update on what’s changed with your work during the <b>Solo Updates</b>{' '}
        phase. Raise issues for discussion in the <b>Team Agenda</b> phase.
      </>
    ),
    integrationsTip: <>push takeaway tasks to your backlog</>
  }
}

interface BaseActivity {
  id: ActivityId
  name: string
  illustration: string
  usageStats?: any
  category: CategoryID
  type: MeetingTypeEnum
  description: React.ReactNode
  integrationsTip: React.ReactNode
  isTemplate: boolean
}

export interface ActivityWithTemplate extends BaseActivity {
  isTemplate: true
  template: ActivityDetailsQuery['response']['viewer']['availableTemplates']['edges'][number]['node']
}

export interface ActivityWithNoTemplate extends BaseActivity {
  isTemplate: false
}

export type Activity = ActivityWithTemplate | ActivityWithNoTemplate

export const useActivityDetails = (
  activityIdParam: string,
  data: ActivityDetailsQuery['response']
) => {
  const {viewer} = data
  const {availableTemplates} = viewer

  // for now, standups and check-ins don't have templates
  const noTemplateActivityIds = ['teamPrompt', 'action']
  if (noTemplateActivityIds.includes(activityIdParam)) {
    const activityId = activityIdParam as ActivityId
    const type = activityId as NoTemplatesMeeting
    const category = MEETING_TYPE_TO_CATEGORY_ID[type]
    const activity: Activity = {
      id: activityId,
      name: MEETING_ID_TO_NAME[type],
      illustration: getActivityIllustration(activityId),
      category,
      type: activityId as MeetingTypeEnum,
      description: ACTIVITY_TYPE_DATA_LOOKUP[type].description,
      integrationsTip: ACTIVITY_TYPE_DATA_LOOKUP[type].integrationsTip,
      isTemplate: false
    }

    return {
      activity
    }
  }

  const selectedTemplate = availableTemplates.edges.find(
    (edge) => edge.node.id === activityIdParam
  )?.node
  if (!selectedTemplate) return {activity: null}

  const activityId = selectedTemplate.id as ActivityId
  const category = selectedTemplate.category as CategoryID
  const type = selectedTemplate.type

  const activity: Activity = {
    id: activityId,
    name: selectedTemplate.name,
    illustration: getActivityIllustration(activityId),
    category,
    type,
    description: ACTIVITY_TYPE_DATA_LOOKUP[type].description,
    integrationsTip: ACTIVITY_TYPE_DATA_LOOKUP[type].integrationsTip,
    isTemplate: true,
    template: selectedTemplate
  }

  return {
    activity
  }
}
