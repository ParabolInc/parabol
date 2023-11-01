import {ActivityBadge} from './ActivityLibrary/ActivityBadge'
import {ActivityLibraryCardDescription} from './ActivityLibrary/ActivityLibraryCardDescription'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ActivityLibraryCard} from './ActivityLibrary/ActivityLibraryCard'
import {ActivityCardImage} from './ActivityLibrary/ActivityCard'
import {RetroDrawerTemplateCard_template$key} from '~/__generated__/RetroDrawerTemplateCard_template.graphql'
import {CategoryID, CATEGORY_THEMES} from '././ActivityLibrary/Categories'

interface Props {
  templateRef: RetroDrawerTemplateCard_template$key
}

const RetroDrawerTemplateCard = (props: Props) => {
  const {templateRef} = props
  const template = useFragment(
    graphql`
      fragment RetroDrawerTemplateCard_template on MeetingTemplate {
        ...ActivityLibraryCardDescription_template
        name
        category
        illustrationUrl
        isFree
      }
    `,
    templateRef
  )

  return (
    <div className='px-4 py-2'>
      <ActivityLibraryCard
        className='group aspect-[256/160] flex-1 hover:cursor-pointer'
        theme={CATEGORY_THEMES[template.category as CategoryID]}
        title={template.name}
        badge={
          !template.isFree ? (
            <ActivityBadge className='m-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>
          ) : null
        }
      >
        <ActivityCardImage className='group-hover/card:hidden' src={template.illustrationUrl} />
        <ActivityLibraryCardDescription
          className='hidden group-hover/card:flex'
          templateRef={template}
        />
      </ActivityLibraryCard>
    </div>
  )
}
export default RetroDrawerTemplateCard
