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
import clsx from 'clsx'
import {CategoryID, MeetingThemes} from './ActivityCard'
import CreateActivityCard from './CreateActivityCard'

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
            ...CreateActivityCard_templates
          }
        }
      }
      featureFlags {
        retrosInDisguise
      }
      teams {
        ...CreateActivityCard_teams
      }
    }
  }
`

interface Props {
  queryRef: PreloadedQuery<ActivityLibraryQuery>
}

const getTemplateValue = (template: {name: string}) => template.name

const QUICK_START_CATEGORY_ID = 'recommended'

export const CATEGORY_ID_TO_NAME: Record<CategoryID | typeof QUICK_START_CATEGORY_ID, string> = {
  [QUICK_START_CATEGORY_ID]: 'Quick Start',
  retrospective: 'Retrospective',
  estimation: 'Estimation',
  standup: 'Standup',
  feedback: 'Feedback',
  strategy: 'Strategy'
}

const RETRO_CATEGORIES: Array<CategoryID> = ['retrospective', 'feedback', 'strategy']

const CategoryIDToColorClass = {
  [QUICK_START_CATEGORY_ID]: 'bg-grape-700',
  ...Object.fromEntries(
    Object.entries(MeetingThemes).map(([key, value]) => {
      return [key, value.primary]
    })
  )
} as Record<CategoryID | typeof QUICK_START_CATEGORY_ID, string>

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {history} = useRouter()
  const {viewer} = data
  const {featureFlags, availableTemplates, teams} = viewer

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
        category: 'standup',
        isRecommended: true,
        isFree: true
      } as const,
      {
        id: 'teamPrompt',
        type: 'teamPrompt',
        name: 'Standup',
        team: {name: 'Parabol'},
        category: 'standup',
        isRecommended: true,
        isFree: true
      } as const,
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

  const {match} = useRouter<{categoryId?: string}>()
  const {params} = match
  const {categoryId: selectedCategory} = params

  const templatesToRender = useMemo(() => {
    if (searchQuery.length > 0) {
      // If there's a search query, just use the search filter results
      return filteredTemplates
    }

    return filteredTemplates.filter((template) =>
      selectedCategory === QUICK_START_CATEGORY_ID
        ? template.isRecommended
        : template.category === selectedCategory
    )
  }, [searchQuery, filteredTemplates, selectedCategory])

  if (!selectedCategory || !Object.keys(CATEGORY_ID_TO_NAME).includes(selectedCategory)) {
    return <Redirect to={`/activity-library/category/${QUICK_START_CATEGORY_ID}`} />
  }

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

      <ScrollArea.Root className='w-full'>
        <ScrollArea.Viewport className='w-full'>
          <div className='flex gap-x-2 px-4 md:mx-[15%] md:pb-4'>
            {(
              Object.keys(CATEGORY_ID_TO_NAME) as Array<CategoryID | typeof QUICK_START_CATEGORY_ID>
            ).map((category) => (
              <Link
                className={clsx(
                  'flex-shrink-0 cursor-pointer rounded-full py-2 px-4 text-xs font-semibold text-slate-700',
                  category === selectedCategory && searchQuery.length === 0
                    ? [CategoryIDToColorClass[category], 'text-white focus:text-white']
                    : 'bg-slate-200'
                )}
                to={`/activity-library/category/${category}`}
                onClick={() => resetQuery()}
                key={category}
              >
                {CATEGORY_ID_TO_NAME[category]}
              </Link>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation='horizontal' className='hidden' />
      </ScrollArea.Root>

      <ScrollArea.Root className='h-full w-full overflow-hidden'>
        <ScrollArea.Viewport className='flex h-full flex-col md:mx-[15%]'>
          {templatesToRender.length === 0 ? (
            <div className='mx-auto flex p-2 text-slate-700'>
              <img className='w-32' src={halloweenRetrospectiveTemplate} />
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
            <div className='mx-auto mt-1 grid auto-rows-[1fr] grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 p-4 md:mt-4'>
              {RETRO_CATEGORIES.includes(selectedCategory as CategoryID) && (
                <CreateActivityCard
                  className='flex-1 max-sm:hidden'
                  category={selectedCategory as CategoryID}
                  teamsRef={teams}
                  templatesRef={availableTemplates.edges
                    .map((edge) => edge.node)
                    .filter((template) => template.type === 'retrospective')}
                />
              )}
              {templatesToRender.map((template) => {
                const templateIllustration =
                  activityIllustrations[template.id as keyof typeof activityIllustrations]
                const activityIllustration = templateIllustration ?? customTemplateIllustration

                return (
                  <Link
                    key={template.id}
                    to={{
                      pathname: `/activity-library/details/${template.id}`,
                      state: {prevCategory: selectedCategory}
                    }}
                    className='flex focus:rounded-md focus:outline-primary'
                  >
                    <ActivityLibraryCard
                      className='flex-1'
                      key={template.id}
                      category={template.category as CategoryID}
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
