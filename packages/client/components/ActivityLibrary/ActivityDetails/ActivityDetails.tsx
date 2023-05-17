import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {ActivityDetailsQuery} from '~/__generated__/ActivityDetailsQuery.graphql'
import {CATEGORY_THEMES} from '../Categories'
import clsx from 'clsx'
import {Redirect} from 'react-router'
import {Link} from 'react-router-dom'
import IconLabel from '../../IconLabel'
import {ActivityCard} from '../ActivityCard'
import {useActivityDetails} from './hooks/useActivityDetails'

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

interface Props {
  queryRef: PreloadedQuery<ActivityDetailsQuery>
  activityId: string
}

const ActivityDetails = (props: Props) => {
  const {queryRef, activityId: activityIdParam} = props
  const data = usePreloadedQuery<ActivityDetailsQuery>(query, queryRef)
  const {activity, isEditing} = useActivityDetails(activityIdParam, data)

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
                {activity.templateConfig ? activity.templateConfig : null}
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
