import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import ActivityLibraryCard from './ActivityLibraryCard'
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
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const templates = useMemo(
    () => [
      {id: 'action', type: 'action', name: 'Check-in', team: {name: 'Parabol'}},
      {id: 'teamPrompt', type: 'teamPrompt', name: 'Standup', team: {name: 'Parabol'}},
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
    <div className='flex h-full bg-white'>
      <ActivityLibrarySideBar />
      <div>
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
        <div className='flex flex-wrap'>
          {filteredTemplates.length === 0 && (
            <div className='ml-2 mt-2 flex text-slate-700'>
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
          )}
          {filteredTemplates.map((template) => (
            <ActivityLibraryCard
              key={template.id}
              type={template.type}
              name={template.name}
              teamName={template.team.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
