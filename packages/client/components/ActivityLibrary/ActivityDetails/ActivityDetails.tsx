import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CategoryID} from '../Categories'
import {MeetingTypeEnum} from '../../../../server/postgres/types/Meeting'
import {TemplateDetails} from './TemplateDetails'
import {MeetingDetails} from './MeetingDetails'

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
    ...TeamPickerModal_templates
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

      ...useTemplateDescription_viewer
    }
  }
`

export type NoTemplatesMeeting = Exclude<MeetingTypeEnum, 'retrospective' | 'poker'>

export const MEETING_TYPE_TO_CATEGORY_ID: Record<NoTemplatesMeeting, CategoryID> = {
  action: 'standup',
  teamPrompt: 'standup'
}

export const SUPPORTED_TYPES: MeetingTypeEnum[] = ['retrospective', 'poker', 'teamPrompt']

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  activityId: string
}

const ActivityDetails = (props: Props) => {
  const {queryRef, activityId} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)

  const meetingIds = ['teamPrompt', 'action']
  if (meetingIds.includes(activityId)) {
    return <MeetingDetails queryRef={queryRef} activityId={activityId as NoTemplatesMeeting} />
  }

  return <TemplateDetails queryRef={queryRef} templateId={activityId} />
}

export default ActivityDetails
