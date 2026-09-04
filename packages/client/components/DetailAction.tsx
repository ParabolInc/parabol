import type * as React from 'react'
import {ContentCopy, Delete, Edit} from '~/ui/icons'
import {Button} from '../ui/Button/Button'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'

interface Props {
  disabled?: boolean
  onClick: React.MouseEventHandler
  tooltip: string
  //FIXME 6062: change to React.ComponentType
  icon: string
}

const DetailAction = (props: Props) => {
  const {disabled, tooltip, icon, onClick} = props
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='flat'
          onClick={disabled ? undefined : onClick}
          size='sm'
          className='h-8 w-8 items-center justify-center p-0 text-fg-secondary'
        >
          <div className='h-[18px] w-[18px] [&_svg]:text-[18px]'>
            {
              {
                content_copy: <ContentCopy />,
                delete: <Delete />,
                edit: <Edit />
              }[icon]
            }
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default DetailAction
