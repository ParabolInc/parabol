import * as ScrollArea from '@radix-ui/react-scroll-area'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {Fragment, useEffect, useMemo} from 'react'
import {PreloadedQuery, commitLocalUpdate, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {Link} from 'react-router-dom'
import {useDebounce} from 'use-debounce'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {ActivityLibrary_template$data} from '~/__generated__/ActivityLibrary_template.graphql'
import {ActivityLibrary_templateSearchDocument$data} from '~/__generated__/ActivityLibrary_templateSearchDocument.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'
import useSearchFilter from '../../hooks/useSearchFilter'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import IconLabel from '../IconLabel'
import AISearch from './AISearch'
import ActivityGrid from './ActivityGrid'
import ActivityLibraryEmptyState from './ActivityLibraryEmptyState'
import {
  AllCategoryID,
  CATEGORY_ID_TO_NAME,
  CATEGORY_THEMES,
  CUSTOM_CATEGORY_ID,
  CategoryID,
  QUICK_START_CATEGORY_ID
} from './Categories'
import SearchBar from './SearchBar'

graphql`
  fragment ActivityLibrary_templateSearchDocument on MeetingTemplate {
    team {
      name
    }
    name
    type
    category
    scope
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
      subCategories
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
    illustrationUrl
    isRecommended
    scope
    ...ActivityLibrary_templateSearchDocument @relay(mask: false)
    ...ActivityCard_template
    ...ActivityLibraryCardDescription_template
  }
`

const query = graphql`
  query ActivityLibraryQuery {
    viewer {
      availableTemplates(first: 2000) @connection(key: "ActivityLibrary_availableTemplates") {
        edges {
          node {
            ...ActivityLibrary_template @relay(mask: false)
          }
        }
      }
      organizations {
        featureFlags {
          aiTemplate
        }
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

const CategoryIDToColorClass = Object.fromEntries(
  Object.entries(CATEGORY_THEMES).map(([key, value]) => {
    return [key, value.primary]
  })
) as Record<keyof typeof CATEGORY_THEMES, string>

export type Template = Omit<ActivityLibrary_template$data, ' $fragmentType'>

const MAX_PER_SUBCATEGORY = 6
const subCategoryMapping = {
  popular: 'Popular templates',
  recentlyUsed: 'You used these recently',
  recentlyUsedInOrg: 'Others in your organization are using',
  neverTried: 'Try these activities',
  getStarted: 'Activities to get you started',
  other: 'Other activities'
} as const

const mapRetroSubCategories = (templates: readonly Template[]) => {
  const subCategoryTemplates = Object.fromEntries(
    Object.keys(subCategoryMapping).map((subCategory) => {
      return [
        subCategory,
        templates
          .filter((template) => template.subCategories?.includes(subCategory))
          .slice(0, MAX_PER_SUBCATEGORY) as Template[]
      ]
    })
  )
  //just in case there were values already
  subCategoryTemplates.other = []
  subCategoryTemplates.other = templates.filter(
    (template) =>
      !Object.values(subCategoryTemplates)
        .flat()
        .find((catTemplate) => catTemplate.id === template.id)
  )

  return Object.fromEntries(
    Object.entries(subCategoryTemplates).map(([key, value]) => {
      return [subCategoryMapping[key as keyof typeof subCategoryMapping]!, value]
    })
  )
}

const mapTeamCategories = (templates: readonly Template[]) => {
  // list public templates last
  const publicTemplates = [] as Template[]
  const mapped = templates.reduce(
    (acc, template) => {
      const {team, scope} = template
      if (scope === 'PUBLIC') {
        publicTemplates.push(template)
      } else {
        const {name} = team
        if (!acc[name]) {
          acc[name] = []
        }
        acc[name]!.push(template)
      }
      return acc
    },
    {} as Record<string, Template[]>
  )

  mapped['Parabol'] = publicTemplates
  return mapped
}

export const ActivityLibrary = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {viewer} = data
  const {availableTemplates, organizations} = viewer
  const hasAITemplateFeatureFlag = !!organizations.find((org) => org.featureFlags.aiTemplate)

  const setSearch = (value: string) => {
    commitLocalUpdate(atmosphere, (store) => {
      const viewer = store.getRoot().getLinkedRecord('viewer')
      if (!viewer) return
      viewer.setValue(value, 'activityLibrarySearch')
    })
  }

  const templates = useMemo(() => {
    const templatesMap = availableTemplates.edges.map((edge) => edge.node)
    return templatesMap
  }, [availableTemplates])

  const availableCategoryIds = Object.keys(CATEGORY_ID_TO_NAME)

  const {
    query: searchQuery,
    filteredItems: filteredTemplates,
    onQueryChange,
    resetQuery
  } = useSearchFilter(templates, getTemplateDocumentValue)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery) {
      SendClientSideEvent(atmosphere, 'Activity Library Searched', {
        debouncedSearchQuery
      })
    }
  }, [debouncedSearchQuery])

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
        : categoryId === CUSTOM_CATEGORY_ID
          ? template.scope !== 'PUBLIC'
          : template.category === categoryId
    )
  }, [searchQuery, filteredTemplates, categoryId])

  const sectionedTemplates = useMemo(() => {
    // Show the teams on search as well, because you can search by team name
    if (categoryId === CUSTOM_CATEGORY_ID || searchQuery.length > 0) {
      return mapTeamCategories(templatesToRender)
    }

    if (searchQuery.length > 0) {
      return undefined
    }

    if (categoryId === 'retrospective') {
      return mapRetroSubCategories(templatesToRender)
    }
    if (categoryId === 'recommended') {
      return {[subCategoryMapping.getStarted]: [...templatesToRender]}
    }
    return undefined
  }, [categoryId, templatesToRender])

  if (!categoryId || !availableCategoryIds.includes(categoryId)) {
    return <Redirect to={`/activity-library/category/${QUICK_START_CATEGORY_ID}`} />
  }

  return (
    <div className='flex h-full w-full flex-col bg-white'>
      <div className='mx-2 flex'>
        <div className='hidden items-center justify-start gap-x-2 px-4 lg:flex lg:basis-[15%]'>
          <Link title='My Dashboard' to='/meetings'>
            <IconLabel icon={'arrow_back'} iconLarge />
          </Link>
        </div>

        <div className='border-b-solid mt-4 flex flex-1 flex-col items-center border-b-[1px] border-slate-300 pb-4 lg:mr-[15%]'>
          <div className='mx-auto flex w-full items-center justify-between gap-14 px-2 md:px-4'>
            <div className='flex items-center'>
              <Link className='mr-6 block lg:hidden' title='My Dashboard' to='/meetings'>
                <IconLabel icon={'arrow_back'} iconLarge />
              </Link>
              <img className='mr-3 w-8' crossOrigin='' alt='Parabol' src={logoMarkPurple} />
              <div className='hidden shrink-0 text-lg font-semibold md:block lg:text-xl'>
                Start Activity
              </div>
            </div>
            {!hasAITemplateFeatureFlag && (
              <div className='hidden grow md:block'>
                <SearchBar
                  searchQuery={searchQuery}
                  onChange={(e) => {
                    onQueryChange(e)
                    setSearch(e.target.value)
                  }}
                />
              </div>
            )}
            <Link
              className='rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600'
              to={`/activity-library/new-activity/${categoryId}`}
            >
              Create custom activity
            </Link>
          </div>
          <div className='mt-4 flex w-full md:hidden'>
            <SearchBar
              searchQuery={searchQuery}
              onChange={(e) => {
                onQueryChange(e)
                setSearch(e.target.value)
              }}
            />
          </div>
        </div>
      </div>

      <ScrollArea.Root className='w-full'>
        <ScrollArea.Viewport className='w-full'>
          <div className='flex gap-2 px-4 pt-6 md:flex-wrap md:pb-4 lg:mx-[15%]'>
            {(availableCategoryIds as Array<CategoryID | typeof QUICK_START_CATEGORY_ID>).map(
              (category) => (
                <Link
                  className={clsx(
                    'flex-shrink-0 cursor-pointer rounded-full py-2 px-4 text-sm text-slate-800',
                    category === categoryId && searchQuery.length === 0
                      ? [
                          `${CategoryIDToColorClass[category]}`,
                          'font-semibold text-white focus:text-white'
                        ]
                      : 'border border-slate-300 bg-white'
                  )}
                  to={`/activity-library/category/${category}`}
                  onClick={() => resetQuery()}
                  key={category}
                >
                  {CATEGORY_ID_TO_NAME[category]}
                </Link>
              )
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation='horizontal' className='hidden' />
      </ScrollArea.Root>

      <ScrollArea.Root className='h-full w-full overflow-hidden'>
        <ScrollArea.Viewport className='flex h-full flex-col lg:mx-[15%]'>
          {hasAITemplateFeatureFlag && (
            <div className='mx-auto mt-4 pt-2'>
              <AISearch />
            </div>
          )}
          {templatesToRender.length === 0 ? (
            <ActivityLibraryEmptyState
              searchQuery={searchQuery}
              categoryId={categoryId as AllCategoryID}
            />
          ) : (
            <>
              {sectionedTemplates ? (
                <>
                  {Object.entries(sectionedTemplates).map(
                    ([subCategory, subCategoryTemplates]) =>
                      subCategoryTemplates.length > 0 && (
                        <Fragment key={subCategory}>
                          {subCategory && (
                            <div className='ml-4 mt-8 text-xl font-bold text-slate-700'>
                              {subCategory}
                            </div>
                          )}
                          <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
                            <ActivityGrid
                              templates={subCategoryTemplates}
                              selectedCategory={categoryId}
                            />
                          </div>
                        </Fragment>
                      )
                  )}
                </>
              ) : (
                <>
                  <div className='grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 p-4'>
                    <ActivityGrid
                      templates={templatesToRender as Template[]}
                      selectedCategory={categoryId}
                    />
                  </div>
                </>
              )}
            </>
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
