import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {ActivityLibraryHeader, ActivityLibraryMobileHeader} from './ActivityLibraryHeader'
import {ActivityLibraryCard, ActivityLibraryCardBadge} from './ActivityLibraryCard'

import customTemplateIllustration from '../../../../static/images/illustrations/customTemplate.png'
import {activityIllustrations} from './ActivityIllustrations'
import {Link} from 'react-router-dom'
import useRouter from '../../hooks/useRouter'
import SearchBar from './SearchBar'
import useSearchFilter from '../../hooks/useSearchFilter'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'

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

const getTemplateValue = (template: {name: string}) => template.name

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {history} = useRouter()
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const handleCloseClick = () => {
    history.goBack()
  }

  const templates = useMemo(
    () => [
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
    ],
    [availableTemplates]
  )

  const {
    query: searchQuery,
    filteredItems: filteredTemplates,
    onQueryChange
  } = useSearchFilter(templates, getTemplateValue)

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <ActivityLibraryHeader className='hidden md:flex' onClose={handleCloseClick}>
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
      </ActivityLibraryHeader>
      <ActivityLibraryMobileHeader className='flex md:hidden' onClose={handleCloseClick}>
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
      </ActivityLibraryMobileHeader>

      <ScrollArea.Root className='h-full w-full overflow-hidden'>
        <ScrollArea.Viewport className='flex h-full lg:mx-[15%]'>
          {filteredTemplates.length === 0 ? (
            <div className='mx-auto flex max-w-7xl p-2 text-slate-700'>
              <img className='max-w-[128px]' src={halloweenRetrospectiveTemplate} />
              <div className='ml-10'>
                <div className='mb-4 text-xl font-semibold'>No results found!</div>
                <div className='mb-6 max-w-[360px]'>
                  Try tapping a category above, using a different search, or creating exactly what
                  you have in mind.
                </div>
                {/* :TODO: (jmtaber129): Add the "create custom activity" card */}
                <div className='mt-0.5'>TODO: create custom activity</div>
              </div>
            </div>
          ) : (
            <div className='mx-auto grid auto-rows-[1fr] grid-cols-[repeat(auto-fit,_minmax(min(35%,256px),1fr))] place-items-stretch gap-4 p-4'>
              {filteredTemplates.map((template) => {
                const templateIllustration =
                  activityIllustrations[template.id as keyof typeof activityIllustrations]
                const activityIllustration = templateIllustration ?? customTemplateIllustration

                return (
                  <Link
                    key={template.id}
                    to={`/activity-library/${template.id}`}
                    className='flex focus:rounded-md focus:outline-primary'
                  >
                    <ActivityLibraryCard
                      className='flex-1'
                      key={template.id}
                      type={template.type}
                      title={template.name}
                      imageSrc={activityIllustration}
                      badge={
                        !template.isFree ? (
                          <ActivityLibraryCardBadge>Premium</ActivityLibraryCardBadge>
                        ) : null
                      }
                    />
                  </Link>
                )
              })}
            </div>
          )}
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
