import React from 'react'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CategoryID, QUICK_START_CATEGORY_ID} from '../../Categories'
import {MeetingTypeEnum} from '../../../../../server/postgres/types/Meeting'
import {ActivityId, getActivityIllustration} from '../../ActivityIllustrations'
import {useHistory} from 'react-router'

export type NoTemplatesMeeting = Exclude<MeetingTypeEnum, 'retrospective' | 'poker'>

export const MEETING_ID_TO_NAME: Record<NoTemplatesMeeting, string> = {
  teamPrompt: 'Standup',
  action: 'Team Check-In'
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
  action: (
    <>
      This is a space to check in as a team. Share a personal update using the <b>Icebreaker</b>{' '}
      phase. Give a brief update on what’s changed with your work during the <b>Solo Updates</b>{' '}
      phase. Raise issues for discussion in the <b>Team Agenda</b> phase.
    </>
  )
}

export const MEETING_TYPE_TIP_LOOKUP: Record<MeetingTypeEnum, React.ReactNode> = {
  teamPrompt: <>push takeaway tasks to your backlog</>,
  action: <>push takeaway tasks to your backlog</>,
  retrospective: <>push takeaway tasks to your backlog</>,
  poker: <>sync estimations with your backlog</>
}

type MeetingActivity = {
  isTemplate: false
}

type TemplateActivity = {
  isTemplate: true
  template: ActivityDetailsQuery['response']['viewer']['availableTemplates']['edges'][number]['node']
}

export type Activity = {
  id: ActivityId
  name: string
  illustration: string
  usageStats?: any
  category: CategoryID
  categoryLink: string
  type: MeetingTypeEnum
  description: React.ReactNode
} & (MeetingActivity | TemplateActivity)

export const useActivityDetails = (
  activityIdParam: string,
  data: ActivityDetailsQuery['response']
) => {
  const {viewer} = data
  const {availableTemplates} = viewer

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
      name: MEETING_ID_TO_NAME[type],
      illustration: getActivityIllustration(activityId),
      category,
      categoryLink: `/activity-library/category/${
        prevCategory ?? category ?? QUICK_START_CATEGORY_ID
      }`,
      type: activityId as MeetingTypeEnum,
      description: MEETING_TYPE_DESCRIPTION_LOOKUP[type],
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
    categoryLink: `/activity-library/category/${
      prevCategory ?? category ?? QUICK_START_CATEGORY_ID
    }`,
    type,
    description: MEETING_TYPE_DESCRIPTION_LOOKUP[type],
    isTemplate: true,
    template: selectedTemplate
  }

  return {
    activity
  }
}
