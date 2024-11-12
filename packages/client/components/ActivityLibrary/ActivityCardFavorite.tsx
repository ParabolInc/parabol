import {Favorite} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import clsx from 'clsx'
import * as React from 'react'
import {useFragment} from 'react-relay'
import {ActivityCardFavorite_user$key} from '../../__generated__/ActivityCardFavorite_user.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleFavoriteTemplateMutation from '../../mutations/ToggleFavoriteTemplateMutation'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

type Props = {
  className?: string
  templateId: string
  viewerRef: ActivityCardFavorite_user$key
}

const ActivityCardFavorite = (props: Props) => {
  const {className, templateId, viewerRef} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted} = useMutationProps()

  const viewer = useFragment(
    graphql`
      fragment ActivityCardFavorite_user on User {
        favoriteTemplates {
          id
        }
      }
    `,
    viewerRef
  )
  const favoriteTemplateIds = viewer.favoriteTemplates.map((template) => template.id)
  const isFavorite = favoriteTemplateIds.includes(templateId)
  const tooltipCopy = isFavorite ? 'Remove from favorites' : 'Add to favorites'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    ToggleFavoriteTemplateMutation(atmosphere, {templateId}, {onError, onCompleted})
  }

  return (
    <Tooltip>
      <div
        className={clsx(
          className,
          `flex h-10 w-10 items-center justify-center rounded-full bg-white`
        )}
      >
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className='flex h-full w-full cursor-pointer items-center justify-center bg-transparent'
          >
            <Favorite className={isFavorite ? 'text-rose-600' : 'text-slate-600'} />
          </button>
        </TooltipTrigger>
      </div>
      <TooltipContent side='bottom' align='center' sideOffset={20}>
        {tooltipCopy}
      </TooltipContent>
    </Tooltip>
  )
}

export default ActivityCardFavorite
