import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useEffect, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import EditableTemplateName from '../../../modules/meeting/components/EditableTemplateName'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import IconLabel from '../../IconLabel'
import {ActivityCard, ActivityCardImage} from '../ActivityCard'
import ActivityDetailsSidebar from '../ActivityDetailsSidebar'
import {CATEGORY_THEMES, CategoryID, QUICK_START_CATEGORY_ID} from '../Categories'
import {TemplateDetails} from './TemplateDetails'

graphql`
  fragment ActivityDetails_template on MeetingTemplate {
    id
    name
    type
    category
    orgId
    teamId
    illustrationUrl
    isFree
    scope
    viewerLowestScope
    ...TemplateDetails_activity
    ...ActivityDetailsBadges_template
    ...ActivityDetailsSidebar_template
    ...useTemplateDescription_template
  }
`

export const query = graphql`
  query ActivityDetailsQuery($activityId: ID!) {
    viewer {
      ...ActivityDetailsSidebar_viewer
      activityLibrarySearch
      preferredTeamId
      activity(activityId: $activityId) {
        ...ActivityDetails_template @relay(mask: false)
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

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
}

const ActivityDetails = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {viewer} = data
  const {activity, activityLibrarySearch, preferredTeamId, teams} = viewer
  const history = useHistory<{prevCategory?: string; edit?: boolean}>()
  const [isEditing, setIsEditing] = useState(false)
  if (!activity) {
    return <Redirect to='/activity-library' />
  }
  // eslint-disable react-hooks/rules-of-hooks -- return above violates these rules, but is just a safeguard and not normal usage
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Viewed Template', {
      meetingType: activity.type,
      scope: activity.scope,
      templateName: activity.name,
      isFree: activity.isFree,
      queryString: activityLibrarySearch
    })
  }, [])

  const {category, illustrationUrl, viewerLowestScope, type} = activity
  const prevCategory = history.location.state?.prevCategory
  const categoryLink = `/activity-library/category/${
    prevCategory ?? category ?? QUICK_START_CATEGORY_ID
  }`

  const isOwner = viewerLowestScope === 'TEAM'

  console.log({isEditing})
  return (
    <div className='flex w-full flex-col overflow-hidden bg-white lg:flex-row'>
      <div className='flex items-center p-4 pb-2'>
        <div className='mr-4'>
          <Link to={categoryLink}>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
        </div>
        <div className='w-max text-xl font-semibold'>Start Activity</div>
        <div></div>
      </div>
      <div
        className={clsx('flex flex-col overflow-auto px-4 xl:flex-row', isEditing && 'lg:flex-row')}
      >
        <div className='aspect-video w-full'>
          <ActivityCard
            className='w-80'
            theme={CATEGORY_THEMES[category as CategoryID]}
            badge={null}
            type={type}
          >
            <ActivityCardImage src={illustrationUrl} category={category as CategoryID} />
          </ActivityCard>
        </div>
        <div className='flex items-center pb-4'>
          <EditableTemplateName
            className='text-[32px] leading-9'
            name={activity.name}
            templateId={activity.id}
            isOwner={isOwner && isEditing}
          />
        </div>
        <TemplateDetails
          activityRef={activity}
          viewerRef={viewer}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
      <ActivityDetailsSidebar
        selectedTemplateRef={activity}
        teamsRef={teams}
        isOpen={!isEditing}
        type={activity.type}
        preferredTeamId={preferredTeamId}
        viewerRef={viewer}
      />
    </div>
  )
}

export default ActivityDetails
