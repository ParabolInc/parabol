import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import ActivityLibraryCard from './ActivityLibraryCard'

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

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const templates = [
    {id: 'action', type: 'action', name: 'Check-in', team: {name: 'Parabol'}},
    {id: 'teamPrompt', type: 'teamPrompt', name: 'Standup', team: {name: 'Parabol'}},
    ...availableTemplates.edges.map((edge) => edge.node)
  ]

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  return (
    <div className='flex'>
      <ActivityLibrarySideBar />
      <div className='flex flex-wrap'>
        {templates.map((template) => (
          <ActivityLibraryCard
            key={template.id}
            type={template.type}
            name={template.name}
            teamName={template.team.name}
          />
        ))}
      </div>
    </div>
  )
}
