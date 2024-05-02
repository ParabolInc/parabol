import {Favorite} from '@mui/icons-material'
import clsx from 'clsx'
import React, {useState} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import ToggleFavoriteTemplateMutation from '../../mutations/ToggleFavoriteTemplateMutation'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

type Props = {
  className?: string
  templateId: string
}

const ActivityCardFavorite = (props: Props) => {
  const {className, templateId} = props
  const atmosphere = useAtmosphere()
  const [isSelected, setIsSelected] = useState(false)
  const tooltipCopy = isSelected ? 'Remove from favorites' : 'Add to favorites'
  const {onError, onCompleted} = useMutationProps()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsSelected((prev) => !prev)

    ToggleFavoriteTemplateMutation(atmosphere, {templateId}, {onError, onCompleted})
  }

  return (
    <Tooltip>
      <div
        className={clsx(
          className,
          `z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white`
        )}
      >
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className='flex h-full w-full cursor-pointer items-center justify-center bg-transparent'
          >
            <Favorite className={isSelected ? 'text-rose-600' : 'text-slate-600'} />
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
