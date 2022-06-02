import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'
import ScopingSearchHistoryMenu, {SearchQueries} from './ScopingSearchHistoryMenu'

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  padding: 3,
  marginRight: 12
})

const DropdownIcon = styled(Icon)({
  color: PALETTE.SLATE_700,
  fontSize: ICON_SIZE.MD18,
  marginLeft: -8
})

const StyledIconDroprown = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
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
    return <StyledIcon>search</StyledIcon>
  }

  return (
    <>
      <Toggle onClick={togglePortal} ref={originRef}>
        <StyledIconDroprown>search</StyledIconDroprown>
        <DropdownIcon>expand_more</DropdownIcon>
      </Toggle>

      {menuPortal(<ScopingSearchHistoryMenu searchQueries={searchQueries} menuProps={menuProps} />)}
    </>
  )
}

export default ScopingSearchHistoryToggle
