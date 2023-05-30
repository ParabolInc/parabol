import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import EditableTemplateName from '../../../modules/meeting/components/EditableTemplateName'
import IconLabel from '../../IconLabel'
import {ActivityCard} from '../ActivityCard'
import ActivityDetailsSidebar from '../ActivityDetailsSidebar'
import {CategoryID, CATEGORY_THEMES, QUICK_START_CATEGORY_ID} from '../Categories'
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
    team {
      editingScaleId
      ...PokerTemplateScaleDetails_team
    }
    ...TemplateDetails_activity
    ...ActivityDetailsBadges_template
    ...ActivityDetailsSidebar_template
    ...ReflectTemplateDetailsTemplate @relay(mask: false)
    ...PokerTemplateDetailsTemplate @relay(mask: false)
    ...useTemplateDescription_template
  }
`

export const query = graphql`
  query ActivityDetailsQuery($activityId: ID!) {
    viewer {
      tier
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
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {viewer} = data
  const {activity, teams} = viewer

  const history = useHistory<{prevCategory?: string}>()
  const [isEditing, setIsEditing] = useState(false)

  if (!activity) {
    return <Redirect to='/activity-library' />
  }
  const {category, illustrationUrl, viewerLowestScope} = activity
  const prevCategory = history.location.state?.prevCategory
  const categoryLink = `/activity-library/category/${
    prevCategory ?? category ?? QUICK_START_CATEGORY_ID
  }`

  const isOwner = viewerLowestScope === 'TEAM'

  return (
    <div className='flex h-full flex-col bg-white'>
      <div className='flex grow'>
        <div className='mt-4 grow'>
          <div className='mb-14 ml-4 flex h-min w-max items-center'>
            <div className='mr-4'>
              <Link to={categoryLink}>
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
                theme={CATEGORY_THEMES[category as CategoryID]}
                imageSrc={illustrationUrl}
                badge={null}
              />
              <div className='pb-20'>
                <div className='mb-10 space-y-2 pl-14'>
                  <div className='flex min-h-[40px] items-center'>
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
              </div>
            </div>
          </div>
        </div>
        <ActivityDetailsSidebar
          selectedTemplateRef={activity}
          teamsRef={teams}
          isOpen={!isEditing}
          type={activity.type}
        />
      </div>
    </div>
  )
}

export default ActivityDetails
