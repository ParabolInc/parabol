import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CATEGORY_THEMES, QUICK_START_CATEGORY_ID} from '../Categories'
import clsx from 'clsx'
import {Redirect, useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import IconLabel from '../../IconLabel'
import {ActivityCard} from '../ActivityCard'
import {useActivityDetails} from './hooks/useActivityDetails'
import EditableTemplateName from '../../../modules/meeting/components/EditableTemplateName'
import ActivityDetailsSidebar from '../ActivityDetailsSidebar'
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
    ...ActivityDetailsBadges_template
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
      availableTemplates(first: 200) @connection(key: "ActivityDetails_availableTemplates") {
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

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  activityId: string
}

const ActivityDetails = (props: Props) => {
  const {queryRef, activityId: activityIdParam} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {viewer} = data
  const {availableTemplates, teams} = viewer

  const history = useHistory<{prevCategory?: string}>()
  const [isEditing, setIsEditing] = useState(false)
  const {activity} = useActivityDetails(activityIdParam, data)

  if (!activity) {
    return <Redirect to='/activity-library' />
  }

  const prevCategory = history.location.state?.prevCategory
  const categoryLink = `/activity-library/category/${
    prevCategory ?? activity.category ?? QUICK_START_CATEGORY_ID
  }`

  const teamTemplates = activity.isTemplate
    ? availableTemplates.edges
        .map((edge) => edge.node)
        .filter((edge) => edge.teamId === activity.template.teamId)
    : []
  const teamIds = teams.map((team) => team.id)
  const isOwner = activity.isTemplate ? teamIds.includes(activity.template.teamId) : false

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
                theme={CATEGORY_THEMES[activity.category]}
                imageSrc={activity.illustration}
                badge={null}
              />
              <div className='pb-20'>
                <div className='mb-10 space-y-2 pl-14'>
                  <div className='flex min-h-[40px] items-center'>
                    {activity.isTemplate ? (
                      <EditableTemplateName
                        className='text-[32px] leading-9'
                        name={activity.name}
                        templateId={activity.id}
                        teamTemplates={teamTemplates}
                        isOwner={isOwner && isEditing}
                      />
                    ) : (
                      <div className='text-[32px] font-semibold leading-tight text-slate-700'>
                        {activity.name}
                      </div>
                    )}
                  </div>
                  {activity.isTemplate ? (
                    <TemplateDetails
                      activity={activity}
                      viewerRef={viewer}
                      templatesRef={availableTemplates.edges.map((edge) => edge.node)}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                    />
                  ) : (
                    <MeetingDetails activity={activity} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ActivityDetailsSidebar
          selectedTemplateRef={activity.isTemplate ? activity.template : null}
          teamsRef={teams}
          isOpen={!isEditing}
          type={activity.type}
        />
      </div>
    </div>
  )
}

export default ActivityDetails
