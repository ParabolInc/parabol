import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import {useEffect, useState} from 'react'
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
  const history = useHistory<{prevCategory?: string}>()
  const [isEditing, setIsEditing] = useState(false)

  if (!activity) {
    return <Redirect to='/activity-library' />
  }
  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Viewed Template', {
      meetingType: activity.type,
      scope: activity.scope,
      templateName: activity.name,
      queryString: activityLibrarySearch
    })
  }, [])

  const {category, illustrationUrl, viewerLowestScope, type} = activity
  const prevCategory = history.location.state?.prevCategory
  const categoryLink = `/activity-library/category/${
    prevCategory ?? category ?? QUICK_START_CATEGORY_ID
  }`

  const isOwner = viewerLowestScope === 'TEAM'

  return (
    <div className='flex h-full w-full flex-col overflow-auto bg-white'>
      <div className='flex grow'>
        <div className='mt-4 w-full grow'>
          <div className='mb-14 ml-4 flex h-min w-max items-center max-md:mb-6'>
            <div className='mr-4'>
              <Link to={categoryLink}>
                <IconLabel icon={'arrow_back'} iconLarge />
              </Link>
            </div>
            <div className='w-max text-xl font-semibold'>Start Activity</div>
          </div>
          <div className='mx-auto'>
            <div className='flex flex-col justify-start pr-4 pl-4 md:pr-14 xl:flex-row xl:justify-center xl:pl-14'>
              <div>
                <ActivityCard
                  className='mb-8 w-80 max-md:hidden sm:ml-14 xl:mb-0 xl:ml-0'
                  theme={CATEGORY_THEMES[category as CategoryID]}
                  type={type}
                >
                  <ActivityCardImage src={illustrationUrl} category={category as CategoryID} />
                </ActivityCard>
              </div>
              <div className='mb-10 space-y-2 sm:pl-14'>
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
        <div className='hidden w-[385px] shrink-0 lg:flex lg:flex-col'>
          <ActivityDetailsSidebar
            selectedTemplateRef={activity}
            teamsRef={teams}
            type={activity.type}
            preferredTeamId={preferredTeamId}
          />
        </div>
      </div>
      <div className={clsx('lg:hidden', isEditing && 'hidden')}>
        <ActivityDetailsSidebar
          selectedTemplateRef={activity}
          teamsRef={teams}
          type={activity.type}
          preferredTeamId={preferredTeamId}
        />
      </div>
    </div>
  )
}

export default ActivityDetails
