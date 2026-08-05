import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link, Navigate, useLocation} from 'react-router'
import type {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import EditableTemplateName from '../../../modules/meeting/components/EditableTemplateName'
import {cn} from '../../../ui/cn'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import IconLabel from '../../IconLabel'
import {ActivityCard, ActivityCardImage} from '../ActivityCard'
import ActivityDetailsSidebarSwitch from '../ActivityDetailsSidebarSwitch'
import {CATEGORY_THEMES, type CategoryID, QUICK_START_CATEGORY_ID} from '../Categories'
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
        ...TeamHealthDetailsSidebar_teams
      }
      organizations {
        id
        teams {
          id
          ...TeamHealthDetailsSidebar_teams
        }
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
  const location = useLocation() as {state?: {prevCategory?: string}}
  const [isEditing, setIsEditing] = useState(false)

  if (!activity) {
    return <Navigate to='/activity-library' replace />
  }
  // biome-ignore lint/correctness/useHookAtTopLevel: legacy
  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Viewed Template', {
      meetingType: activity.type,
      scope: activity.scope,
      templateName: activity.name,
      queryString: activityLibrarySearch
    })
  }, [])

  const {category, illustrationUrl, viewerLowestScope, type} = activity
  const orgTeams = viewer.organizations.flatMap((org) => org.teams)
  const teamHealthTeams = [...teams, ...orgTeams].filter(
    (team, index, arr) => arr.findIndex((t) => t.id === team.id) === index
  )
  const prevCategory = location.state?.prevCategory
  const categoryLink = `/activity-library/category/${
    prevCategory ?? category ?? QUICK_START_CATEGORY_ID
  }`

  const isOwner = viewerLowestScope === 'TEAM'

  // below lg the sidebar stacks under the content & the whole page scrolls as one. From lg up the
  // two panes sit side by side, each owning its own scroll, so a long template (e.g. an expanded
  // team health question pack) never pushes the layout past the bottom of the viewport
  return (
    <div className='flex h-full w-full flex-col overflow-auto bg-surface-card lg:overflow-hidden'>
      <div className='flex grow flex-col lg:min-h-0 lg:flex-row'>
        <div
          className={cn(
            'mt-4 w-full grow lg:min-h-0 lg:overflow-y-auto',
            // keep the last rows clear of the fixed "Done Editing" bar
            isEditing && 'pb-24'
          )}
        >
          <div className='mb-14 ml-4 flex h-min w-max items-center max-md:mb-6'>
            <div className='mr-4'>
              <Link to={categoryLink}>
                <IconLabel icon={'arrow_back'} iconLarge />
              </Link>
            </div>
            <div className='w-max font-semibold text-xl'>Start Activity</div>
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
        <div
          className={cn(
            'w-full shrink-0 lg:flex lg:w-[385px] lg:flex-col',
            isEditing && 'hidden lg:flex'
          )}
        >
          <ActivityDetailsSidebarSwitch
            type={type}
            templateId={activity.id}
            selectedTemplateRef={activity}
            teamsRef={teams}
            teamHealthTeamsRef={teamHealthTeams}
            preferredTeamId={preferredTeamId}
          />
        </div>
      </div>
    </div>
  )
}

export default ActivityDetails
