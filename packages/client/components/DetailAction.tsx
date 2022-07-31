import styled from '@emotion/styled'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Delete from '@mui/icons-material/Delete'
import Edit from '@mui/icons-material/Edit'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {PALETTE} from '../styles/paletteV3'
import FlatButton from './FlatButton'

const Button = styled(FlatButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32
})

const ActionButton = styled('div')({
  height: 18,
  width: 18
})

interface Props {
  disabled?: boolean
  onClick: React.MouseEventHandler
  tooltip: string
  icon: string
}

const DetailAction = (props: Props) => {
  const {disabled, tooltip, icon, onClick} = props
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLButtonElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <Button
        ref={originRef}
        onClick={disabled ? openTooltip : onClick}
        size='small'
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <ActionButton>
          {
            {
              content_copy: <ContentCopy />,
              delete: <Delete />,
              edit: <Edit />
            }[icon]
          }
        </ActionButton>
      </Button>
      {tooltipPortal(<div>{tooltip}</div>)}
    </>
  )
}

export default DetailAction
