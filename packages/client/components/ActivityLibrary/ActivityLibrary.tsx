import * as ScrollArea from '@radix-ui/react-scroll-area'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {Link} from 'react-router-dom'

import {Close} from '@mui/icons-material'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {ActivityLibrary_templateSearchDocument$data} from '~/__generated__/ActivityLibrary_templateSearchDocument.graphql'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import useRouter from '../../hooks/useRouter'
import useSearchFilter from '../../hooks/useSearchFilter'
import LogoBlock from '../LogoBlock/LogoBlock'
import {ActivityBadge} from './ActivityBadge'
import {ActivityId, getActivityIllustration} from './ActivityIllustrations'
import {ActivityLibraryCard} from './ActivityLibraryCard'
import {ActivityLibraryHeader, ActivityLibraryMobileHeader} from './ActivityLibraryHeader'
import {
  CategoryID,
  CATEGORY_ID_TO_NAME,
  CATEGORY_THEMES,
  QUICK_START_CATEGORY_ID
} from './Categories'
import CreateActivityCard from './CreateActivityCard'
import SearchBar from './SearchBar'

graphql`
  fragment ActivityLibrary_templateSearchDocument on MeetingTemplate {
    team {
      name
    }
    name
    type
    category
    ... on PokerTemplate {
      dimensions {
        name
        description
        selectedScale {
          name
        }
      }
    }
    ... on ReflectTemplate {
      prompts {
        question
        description
      }
    }
  }
`

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
    ...ActivityLibrary_templateSearchDocument @relay(mask: false)
  }
`

const query = graphql`
  query ActivityLibraryQuery {
    viewer {
      availableTemplates(first: 200) @connection(key: "ActivityLibrary_availableTemplates") {
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

const CATEGORY_KEYWORDS: Partial<Record<CategoryID, string[]>> = {
  strategy: ['okrs', 'goalsetting', 'goal-setting', 'planning'],
  estimation: ['sprint'],
  premortem: ['kickoff']
}

// Generate a string of concatenated keywords that we can match against for each template.
const getTemplateDocumentValue = (
  template: Omit<ActivityLibrary_templateSearchDocument$data, ' $fragmentType'>
) =>
  [
    template.name,
    template.category,
    template.type,
    template.team.name,
    CATEGORY_KEYWORDS[template.category as CategoryID] ?? [],
    template.dimensions
      ?.map((dimension) => [dimension.name, dimension.description, dimension.selectedScale.name])
      .flat() ?? [],
    template.prompts?.map((prompt) => [prompt.question, prompt.description]).flat() ?? []
  ]
    .flat()
    .join('-')

/**
 * Defines the list of categories where the 'Create Custom Activity' card is allowed to appear
 */
const CREATE_CUSTOM_ACTIVITY_ALLOW_LIST: Array<typeof QUICK_START_CATEGORY_ID | CategoryID> = [
  QUICK_START_CATEGORY_ID,
  'retrospective',
  'feedback',
  'strategy',
  'estimation',
  'premortem',
  'postmortem'
]

const CategoryIDToColorClass = {
  [QUICK_START_CATEGORY_ID]: 'bg-grape-700',
  ...Object.fromEntries(
    Object.entries(CATEGORY_THEMES).map(([key, value]) => {
      return [key, value.primary]
    })
  )
} as Record<CategoryID | typeof QUICK_START_CATEGORY_ID, string>

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {viewer} = data
  const {featureFlags, availableTemplates} = viewer

  const templates = useMemo(() => {
    return availableTemplates.edges.map((edge) => edge.node)
  }, [availableTemplates])

  const {
    query: searchQuery,
    filteredItems: filteredTemplates,
    onQueryChange,
    resetQuery
  } = useSearchFilter(templates, getTemplateDocumentValue)

  const {match} = useRouter<{categoryId?: string}>()
  const {
    params: {categoryId}
  } = match

  const templatesToRender = useMemo(() => {
    if (searchQuery.length > 0) {
      // If there's a search query, just use the search filter results
      return filteredTemplates
    }

    return filteredTemplates.filter((template) =>
      categoryId === QUICK_START_CATEGORY_ID
        ? template.isRecommended
        : template.category === categoryId
    )
  }, [searchQuery, filteredTemplates, categoryId])

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  if (!categoryId || !Object.keys(CATEGORY_ID_TO_NAME).includes(categoryId)) {
    return <Redirect to={`/activity-library/category/${QUICK_START_CATEGORY_ID}`} />
  }

  const selectedCategory = categoryId as CategoryID | typeof QUICK_START_CATEGORY_ID

  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <ActivityLibraryHeader
        className='hidden md:flex'
        title='Start Activity'
        leftNavigation={<LogoBlock className='flex-shrink-0 border-none' />}
        rightNavigation={
          <Link className='p-2' to={`/`} replace={true}>
            <Close className='m-auto h-8 w-8' />
          </Link>
        }
      >
        <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
      </ActivityLibraryHeader>
      <ActivityLibraryMobileHeader
        className='flex md:hidden'
        rightNavigation={
          <Link className='rounded-full p-2 hover:bg-slate-200' to={`/`} replace={true}>
            <Close className='m-auto h-8 w-8' />
          </Link>
        }
      >
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
                <div className='h-40 w-64'>
                  <CreateActivityCard category={QUICK_START_CATEGORY_ID} className='h-full' />
                </div>
              </div>
            </div>
          ) : (
            <div className='mx-auto mt-1 grid auto-rows-[1fr] grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 p-4 md:mt-4'>
              {CREATE_CUSTOM_ACTIVITY_ALLOW_LIST.includes(selectedCategory) && (
                <CreateActivityCard category={selectedCategory} />
              )}
              {templatesToRender.map((template) => {
                const activityIllustration = getActivityIllustration(template.id as ActivityId)

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
                      theme={CATEGORY_THEMES[template.category as CategoryID]}
                      title={template.name}
                      imageSrc={activityIllustration}
                      badge={
                        !template.isFree ? (
                          <ActivityBadge className='m-2 bg-gold-300 text-grape-700'>
                            Premium
                          </ActivityBadge>
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
