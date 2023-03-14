import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useState} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import ActivityLibrarySideBar from './ActivityLibrarySideBar'
import ActivityLibraryCard from './ActivityLibraryCard'
import SearchBar from './SearchBar'
import useSearchFilter from '../../hooks/useSearchFilter'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import clsx from 'clsx'

graphql`
  fragment ActivityLibrary_template on MeetingTemplate {
    id
    teamId
    team {
      name
    }
    name
    type
    category
    isRecommended
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

const CATEGORY_ID_TO_NAME = {
  recommended: 'Quick Start',
  retro: 'Retrospective',
  estimation: 'Estimation',
  standup: 'Standup',
  feedback: 'Feedback',
  strategy: 'Strategy'
}

const CATEGORY_ID_TO_COLOR_CLASS = {
  recommended: 'bg-grape-700',
  retro: 'bg-grape-500',
  estimation: 'bg-tomato-500',
  standup: 'bg-aqua-400',
  feedback: 'bg-jade-400',
  strategy: 'bg-rose-500'
}

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const templates = useMemo(
    () => [
      {
        id: 'action',
        type: 'action',
        name: 'Check-in',
        team: {name: 'Parabol'},
        category: 'standup',
        isRecommended: true
      },
      {
        id: 'teamPrompt',
        type: 'teamPrompt',
        name: 'Standup',
        team: {name: 'Parabol'},
        category: 'standup',
        isRecommended: true
      },
      ...availableTemplates.edges.map((edge) => edge.node)
    ],
    [availableTemplates]
  )

  const {
    query: searchQuery,
    filteredItems: filteredTemplates,
    onQueryChange,
    resetQuery
  } = useSearchFilter(templates, getTemplateValue)

  const [selectedCategory, setSelectedCategory] =
    useState<keyof typeof CATEGORY_ID_TO_NAME>('recommended')

  const templatesToRender =
    searchQuery.length > 0
      ? filteredTemplates
      : filteredTemplates.filter((template) =>
          selectedCategory === 'recommended'
            ? template.isRecommended
            : template.category === selectedCategory
        )

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  const onSelectCategory = (category: keyof typeof CATEGORY_ID_TO_NAME) => {
    setSelectedCategory(category)
    resetQuery()
  }

  return (
    <div className='flex h-full bg-white'>
      <ActivityLibrarySideBar />
      <div>
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
        <div className='ml-2 flex'>
          {Object.keys(CATEGORY_ID_TO_NAME).map((category) => (
            <button
              className={clsx(
                'mr-2 cursor-pointer rounded-full py-2 px-4 text-xs font-semibold text-slate-700',
                category === selectedCategory && searchQuery.length === 0
                  ? [CATEGORY_ID_TO_COLOR_CLASS[category], 'text-white']
                  : 'bg-slate-200'
              )}
              onClick={() => onSelectCategory(category as keyof typeof CATEGORY_ID_TO_NAME)}
              key={category}
            >
              {CATEGORY_ID_TO_NAME[category as keyof typeof CATEGORY_ID_TO_NAME]}
            </button>
          ))}
        </div>
        <div className='flex flex-wrap'>
          {templatesToRender.length === 0 && (
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
          {templatesToRender.map((template) => (
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
