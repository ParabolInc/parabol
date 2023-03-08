import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import ActivityLibraryCard from './ActivityLibraryCard'
import SearchBar from './SearchBar'
import useSearchFilter from '../../hooks/useSearchFilter'

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
    <div className='flex'>
      <ActivityLibrarySideBar />
      <div>
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
        <div className='flex flex-wrap'>
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
