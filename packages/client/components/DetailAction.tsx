import type * as React from 'react'
import {ContentCopy, Delete, Edit} from '~/ui/icons'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import FlatButton from './FlatButton'

interface Props {
  disabled?: boolean
  onClick: React.MouseEventHandler
  tooltip: string
  //FIXME 6062: change to React.ComponentType
  icon: string
}

const DetailAction = (props: Props) => {
  const {disabled, tooltip, icon, onClick} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <FlatButton
        ref={originRef}
        onClick={disabled ? openTooltip : onClick}
        size='small'
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
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
      </FlatButton>
      {tooltipPortal(<div>{tooltip}</div>)}
    </>
  )
}

export default DetailAction
