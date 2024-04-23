import React from 'react'
import {Link} from 'react-router-dom'
import {ActivityBadge} from './ActivityBadge'
import {ActivityCard, ActivityCardImage} from './ActivityCard'
import ActivityCardFavorite from './ActivityCardFavorite'
import {Template} from './ActivityLibrary'
import {ActivityLibraryCardDescription} from './ActivityLibraryCardDescription'
import {CATEGORY_THEMES, CategoryID} from './Categories'

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
            className='flex rounded-2xl hover:bg-slate-100 focus:outline-sky-500'
          >
            <ActivityCard
              className='group aspect-[256/160] flex-1'
              key={template.id}
              theme={CATEGORY_THEMES[template.category as CategoryID]}
              title={template.name}
              type={template.type}
              templateRef={template}
              badge={
                !template.isFree ? (
                  <ActivityBadge className='m-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>
                ) : null
              }
            >
              <ActivityCardImage
                className='group-hover/card:hidden'
                src={template.illustrationUrl}
                category={template.category as CategoryID}
              />
              <ActivityCardFavorite className='absolute bottom-3 right-3' />
              <ActivityLibraryCardDescription
                className='hidden group-hover/card:flex'
                templateRef={template}
              />
            </ActivityCard>
          </Link>
        )
      })}
    </>
  )
}

export default ActivityGrid
