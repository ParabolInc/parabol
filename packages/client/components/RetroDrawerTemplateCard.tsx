import {ActivityBadge} from './ActivityLibrary/ActivityBadge'
import {ActivityLibraryCardDescription} from './ActivityLibrary/ActivityLibraryCardDescription'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ActivityLibraryCard} from './ActivityLibrary/ActivityLibraryCard'
import {ActivityCardImage} from './ActivityLibrary/ActivityCard'
import {RetroDrawerTemplateCard_template$key} from '~/__generated__/RetroDrawerTemplateCard_template.graphql'
import {CategoryID, CATEGORY_THEMES} from '././ActivityLibrary/Categories'
import UpdateMeetingTemplateMutation from '../mutations/UpdateMeetingTemplateMutation'
import useMutationProps from '../hooks/useMutationProps'
import useAtmosphere from '../hooks/useAtmosphere'

interface Props {
  templateRef: RetroDrawerTemplateCard_template$key
  meetingId: string
  handleCloseDrawer: () => void
}

const RetroDrawerTemplateCard = (props: Props) => {
  const {templateRef, meetingId, handleCloseDrawer} = props
  const {onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const template = useFragment(
    graphql`
      fragment RetroDrawerTemplateCard_template on MeetingTemplate {
        ...ActivityLibraryCardDescription_template
        id
        name
        category
        illustrationUrl
        isFree
      }
    `,
    templateRef
  )

  const handleClick = () => {
    UpdateMeetingTemplateMutation(
      atmosphere,
      {
        meetingId: meetingId,
        templateId: template.id
      },
      {onError, onCompleted}
    )
    handleCloseDrawer()
  }

  return (
    <form className='px-4 py-2' onClick={handleClick}>
      <ActivityLibraryCard
        className='group aspect-[256/160] flex-1 hover:cursor-pointer'
        theme={CATEGORY_THEMES[template.category as CategoryID]}
        title={template.name}
        type='retrospective'
        badge={
          !template.isFree ? (
            <ActivityBadge className='m-2 bg-gold-300 text-grape-700'>Premium</ActivityBadge>
          ) : null
        }
      >
        <ActivityCardImage
          className='group-hover/card:hidden'
          src={template.illustrationUrl}
          category='retrospective'
        />
        <ActivityLibraryCardDescription
          className='hidden group-hover/card:flex'
          templateRef={template}
        />
      </ActivityLibraryCard>
    </form>
  )
}
export default RetroDrawerTemplateCard
