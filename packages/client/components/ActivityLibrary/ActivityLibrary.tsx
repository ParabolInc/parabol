import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {ActivityLibraryHeader, ActivityLibraryMobileHeader} from './ActivityLibraryHeader'
import {ActivityLibraryCard} from './ActivityLibraryCard'

import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import {activityIllustrations} from './ActivityIllustrations'
import {Link} from 'react-router-dom'
import useRouter from '../../hooks/useRouter'

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
  const {history} = useRouter()
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const handleCloseCLick = () => {
    history.goBack()
  }

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
      <ActivityLibraryHeader className='hidden sm:flex' onClose={handleCloseCLick} />
      <ActivityLibraryMobileHeader className='flex sm:hidden' onClose={handleCloseCLick} />

      <ScrollArea.Root className='h-full w-full overflow-hidden'>
        <ScrollArea.Viewport className='flex h-full px-1 md:mx-[15%]'>
          <div className='mx-auto grid w-fit grid-cols-2 gap-4 p-4 lg:grid-cols-3 2xl:grid-cols-4'>
            {templates.map((template) => {
              const templateIllustration =
                activityIllustrations[template.id as keyof typeof activityIllustrations]
              const activityIllustration = templateIllustration ?? customTemplateIllustration

              return (
                <ActivityLibraryCard key={template.id} type={template.type}>
                  <ActivityLibraryCard.Image src={activityIllustration} />
                  <ActivityLibraryCard.Title as={Link} to={`/activity-library/${template.id}`}>
                    {template.name}
                  </ActivityLibraryCard.Title>
                  {!template.isFree && (
                    <ActivityLibraryCard.Badge>Premium</ActivityLibraryCard.Badge>
                  )}
                </ActivityLibraryCard>
              )
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation='vertical'
          className='flex h-full w-2.5 touch-none select-none border-l border-l-transparent p-[1px] transition-colors'
        >
          <ScrollArea.Thumb className={`relative flex-1 rounded-full bg-slate-600`} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}
