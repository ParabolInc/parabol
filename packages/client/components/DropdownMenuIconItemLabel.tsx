import styled from '@emotion/styled'
import {Business, Group, Public} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const Label = styled('span')({
  alignItems: 'center',
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontSize: 15,
  lineHeight: '32px',
  padding: `0 12px`,
  width: '100%'
})

const StyledIcon = styled('div')({
  color: PALETTE.SLATE_600,
  height: 24,
  width: 24,
  marginRight: 12
})

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  label: string
}

const DropdownMenuIconItemLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <Label>
      <StyledIcon>
        {
          {
            group: <Group />,
            business: <Business />,
            public: <Public />
          }[icon]
        }
      </StyledIcon>
      {label}
    </Label>
  )
}
export default DropdownMenuIconItemLabel
