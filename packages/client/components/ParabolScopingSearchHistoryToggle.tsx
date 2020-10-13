import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24,
  marginRight: 12,
})

const ParabolScopingSearchHistoryToggle = () => {
  return (
    <SearchIcon>search</SearchIcon>
  )
}

export default ParabolScopingSearchHistoryToggle
