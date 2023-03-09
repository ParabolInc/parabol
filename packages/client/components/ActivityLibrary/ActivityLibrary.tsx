import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import {ActivityLibraryCard} from './ActivityLibraryCard'

import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import {activityIllustrations} from './ActivityIllustrations'
import {Link} from 'react-router-dom'

graphql`
  fragment ActivityLibrary_template on MeetingTemplate {
    id
    teamId
    team {
      name
    }
    name
    type
    isFree
  }
`

const query = graphql`
  query ActivityLibraryQuery {
    viewer {
      availableTemplates(first: 100) @connection(key: "ActivityLibrary_availableTemplates") {
        edges {
          node {
            ...ActivityLibrary_template @relay(mask: false)
          }
        }
      }
      featureFlags {
        retrosInDisguise
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<ActivityLibraryQuery>
}

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const templates = [
    {
      id: 'action',
      type: 'action',
      name: 'Check-in',
      team: {name: 'Parabol'},
      isFree: true
    } as const,
    {
      id: 'teamPrompt',
      type: 'teamPrompt',
      name: 'Standup',
      team: {name: 'Parabol'},
      isFree: true
    } as const,
    ...availableTemplates.edges.map((edge) => edge.node)
  ]

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  return (
    <div className='flex h-full w-full flex-col'>
      <ActivityLibrarySideBar />
      <div className='h-full w-full overflow-auto'>
        <div className='mx-auto grid w-fit grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4'>
          {templates.map((template) => {
            const templateIllustration =
              activityIllustrations[template.id as keyof typeof activityIllustrations]
            const activityIllustration = templateIllustration ?? customTemplateIllustration

            return (
              <ActivityLibraryCard key={template.id} type={template.type}>
                <ActivityLibraryCard.Image src={activityIllustration} />
                <ActivityLibraryCard.Title as={Link} to={'/'}>
                  {template.name}
                </ActivityLibraryCard.Title>
                {!template.isFree && <ActivityLibraryCard.Badge>Premium</ActivityLibraryCard.Badge>}
              </ActivityLibraryCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
