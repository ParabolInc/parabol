import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {ActivityGrid_user$key} from '../../__generated__/ActivityGrid_user.graphql'
import {ActivityCard, ActivityCardImage} from './ActivityCard'
import ActivityCardFavorite from './ActivityCardFavorite'
import {Template} from './ActivityLibrary'
import {ActivityLibraryCardDescription} from './ActivityLibraryCardDescription'
import {CATEGORY_THEMES, CategoryID} from './Categories'

interface ActivityGridProps {
  templates: Template[]
  selectedCategory: string
  viewerRef?: ActivityGrid_user$key
}

const ActivityGrid = (props: ActivityGridProps) => {
  const {templates, selectedCategory, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment ActivityGrid_user on User {
        ...ActivityCardFavorite_user
      }
    `,
    viewerRef ?? null
  )
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
              className='group aspect-256/160 flex-1'
              key={template.id}
              theme={CATEGORY_THEMES[template.category as CategoryID]}
              title={template.name}
              type={template.type}
              templateRef={template}
            >
              <ActivityCardImage
                className='group-hover/card:hidden'
                src={template.illustrationUrl}
                category={template.category as CategoryID}
              />
              {viewer && (
                <ActivityCardFavorite
                  templateId={template.id}
                  className='absolute right-2 bottom-2'
                  viewerRef={viewer}
                />
              )}
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
