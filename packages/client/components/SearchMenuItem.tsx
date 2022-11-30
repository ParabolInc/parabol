import styled from '@emotion/styled'
import {Search} from '@mui/icons-material'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import MenuSearch from './MenuSearch'

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
})

const SearchIcon = styled(Search)({
  height: 18,
  width: 18,
  color: PALETTE.SLATE_600
})

interface Props {
  placeholder: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  value: string
}

export const SearchMenuItem = forwardRef((props: Props, ref: any) => {
  const {placeholder, onChange, value} = props
  return (
    <SearchItem ref={ref}>
      <StyledMenuItemIcon>
        <SearchIcon />
      </StyledMenuItemIcon>
      <MenuSearch placeholder={placeholder} onChange={onChange} value={value} />
    </SearchItem>
  )
})
