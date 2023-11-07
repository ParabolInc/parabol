import * as ScrollArea from '@radix-ui/react-scroll-area'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import React, {useMemo} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect} from 'react-router'
import {Link} from 'react-router-dom'
import {ActivityLibraryQuery} from '~/__generated__/ActivityLibraryQuery.graphql'
import {ActivityLibrary_template$data} from '~/__generated__/ActivityLibrary_template.graphql'
import {ActivityLibrary_templateSearchDocument$data} from '~/__generated__/ActivityLibrary_templateSearchDocument.graphql'
import halloweenRetrospectiveTemplate from '../../../../static/images/illustrations/halloweenRetrospectiveTemplate.png'
import useRouter from '../../hooks/useRouter'
import useSearchFilter from '../../hooks/useSearchFilter'
import logoMarkPurple from '../../styles/theme/images/brand/mark-color.svg'
import IconLabel from '../IconLabel'
import {ActivityBadge} from './ActivityBadge'
import {ActivityCardImage} from './ActivityCard'
import {ActivityLibraryCard} from './ActivityLibraryCard'
import {ActivityLibraryCardDescription} from './ActivityLibraryCardDescription'
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
    isFree
    ...ActivityLibrary_templateSearchDocument @relay(mask: false)
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
      featureFlags {
        retrosInDisguise
      }
      organizations {
        featureFlags {
          oneOnOne
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

const CategoryIDToColorClass = {
  [QUICK_START_CATEGORY_ID]: 'bg-grape-700',
  ...Object.fromEntries(
    Object.entries(CATEGORY_THEMES).map(([key, value]) => {
      return [key, value.primary]
    })
  )
} as Record<CategoryID | typeof QUICK_START_CATEGORY_ID, string>

type Template = Omit<ActivityLibrary_template$data, ' $fragmentType'>

type SubCategory = 'popular' | 'recentlyUsed' | 'recentlyUsedInOrg' | 'neverTried'

const subCategoryMapping: Record<SubCategory, string> = {
  popular: 'Popular templates',
  recentlyUsed: 'You used these recently',
  recentlyUsedInOrg: 'Others in your organization are using',
  neverTried: 'Try these activities'
}

interface ActivityGridProps {
  templates: Template[]
  selectedCategory: string
}

const ActivityGrid = ({templates, selectedCategory}: ActivityGridProps) => {
  return (
    <>
      {templates.map((template) => {
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
              className='group aspect-[256/160] flex-1'
              key={template.id}
              theme={CATEGORY_THEMES[template.category as CategoryID]}
              title={template.name}
              type={template.type}
              badge={
                !template.isFree ? (
                  <ActivityBadge className='m-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>
                ) : null
              }
            >
              <ActivityCardImage
                className='group-hover/card:hidden'
                src={template.illustrationUrl}
              />
              <ActivityLibraryCardDescription
                className='hidden group-hover/card:flex'
                templateRef={template}
              />
            </ActivityLibraryCard>
          </Link>
        )
      })}
    </>
  )
}

const MAX_PER_SUBCATEGORY = 6

export const ActivityLibrary = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<ActivityLibraryQuery>(query, queryRef)
  const {viewer} = data
  const {featureFlags, availableTemplates, organizations} = viewer
  const hasOneOnOneFeatureFlag = !!organizations.find((org) => org.featureFlags.oneOnOne)

  const templates = useMemo(() => {
    const templatesMap = availableTemplates.edges.map((edge) => edge.node)
    if (!hasOneOnOneFeatureFlag) {
      return templatesMap.filter((template) => template.id !== 'oneOnOneAction')
    }
    return templatesMap
  }, [availableTemplates])

  const availableCategoryIds = Object.keys(CATEGORY_ID_TO_NAME)

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

  const subCategoryTemplates = Object.fromEntries(
    Object.keys(subCategoryMapping).map((subCategory) => {
      return [
        subCategory,
        templatesToRender
          .filter((template) => template.subCategories?.includes(subCategory))
          .slice(0, MAX_PER_SUBCATEGORY) as Template[]
      ]
    })
  ) as Record<SubCategory, Template[]>

  const otherTemplates = templatesToRender.filter(
    (template) =>
      !Object.values(subCategoryTemplates)
        .flat()
        .find((catTemplate) => catTemplate.id === template.id)
  ) as Template[]

  if (!featureFlags.retrosInDisguise) {
    return <Redirect to='/404' />
  }

  if (!categoryId || !availableCategoryIds.includes(categoryId)) {
    return <Redirect to={`/activity-library/category/${QUICK_START_CATEGORY_ID}`} />
  }

  const selectedCategory = categoryId as CategoryID | typeof QUICK_START_CATEGORY_ID

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
            <div className='hidden grow md:block'>
              <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
            </div>
            <Link
              className='rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600'
              to={`/activity-library/new-activity/${selectedCategory}`}
            >
              Create custom activity
            </Link>
          </div>
          <div className='mt-4 flex w-full md:hidden'>
            <SearchBar searchQuery={searchQuery} onChange={onQueryChange} />
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
                    category === selectedCategory && searchQuery.length === 0
                      ? [
                          CategoryIDToColorClass[category],
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
            <>
              {categoryId === 'retrospective' && searchQuery.length === 0 ? (
                <>
                  {(Object.keys(subCategoryMapping) as SubCategory[]).map(
                    (subCategory) =>
                      subCategoryTemplates[subCategory].length > 0 && (
                        <>
                          <div className='ml-4 mt-8 text-xl font-bold text-slate-700'>
                            {subCategoryMapping[subCategory]}
                          </div>
                          <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
                            <ActivityGrid
                              templates={subCategoryTemplates[subCategory]}
                              selectedCategory={selectedCategory}
                            />
                          </div>
                        </>
                      )
                  )}
                  {otherTemplates.length > 0 && (
                    <>
                      <div className='ml-4 mt-8 text-xl font-bold text-slate-700'>
                        Other activities
                      </div>
                      <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 px-4 md:mt-4'>
                        <ActivityGrid
                          templates={otherTemplates}
                          selectedCategory={selectedCategory}
                        />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className='mt-1 grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(min(40%,256px),1fr))] gap-4 p-4 md:mt-4'>
                  <ActivityGrid
                    templates={templatesToRender as Template[]}
                    selectedCategory={selectedCategory}
                  />
                </div>
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
