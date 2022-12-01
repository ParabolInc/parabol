import styled from '@emotion/styled'
import {ExpandMore, Search} from '@mui/icons-material'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'
import ScopingSearchHistoryMenu, {SearchQueries} from './ScopingSearchHistoryMenu'

const StyledIcon = styled(Search)({
  color: PALETTE.SLATE_600,
  margin: '3px 15px 3px 3px'
})

const DropdownIcon = styled(ExpandMore)({
  color: PALETTE.SLATE_700,
  height: 18,
  width: 18,
  marginLeft: -8
})

const StyledIconDropdown = styled(Search)({
  color: PALETTE.SLATE_600
})

const Toggle = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: 8
})

interface Props {
  searchQueries?: SearchQueries[]
}

const ScopingSearchHistoryToggle = (props: Props) => {
  const {searchQueries} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    loadingWidth: 200,
    noClose: true
  })

  if (!searchQueries) {
    return <StyledIcon />
  }

  return (
    <>
      <Toggle onClick={togglePortal} ref={originRef}>
        <StyledIconDropdown />
        <DropdownIcon />
      </Toggle>

      {menuPortal(<ScopingSearchHistoryMenu searchQueries={searchQueries} menuProps={menuProps} />)}
    </>
  )
}

export default ScopingSearchHistoryToggle
