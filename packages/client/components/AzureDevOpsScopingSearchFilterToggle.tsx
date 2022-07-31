import styled from '@emotion/styled'
import FilterList from '@mui/icons-material/FilterList'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import {AzureDevOpsScopingSearchFilterToggle_meeting} from '../__generated__/AzureDevOpsScopingSearchFilterToggle_meeting.graphql'
import AzureDevOpsScopingSearchFilterMenu from './AzureDevOpsScopingSearchFilterMenu'
import FlatButton from './FlatButton'

const StyledButton = styled(FlatButton)({
  height: 24,
  marginLeft: 4,
  padding: 0,
  width: 24,
  background: PALETTE.SKY_500,
  '&:hover': {
    background: PALETTE.SKY_500
  }
})

const FilterIcon = styled(FilterList)({
  color: PALETTE.WHITE,
  width: 18,
  height: 18
})

interface Props {
  meeting: AzureDevOpsScopingSearchFilterToggle_meeting
}

const AzureDevOpsScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    loadingWidth: 200,
    noClose: true
  })
  return (
    <>
      <StyledButton onClick={togglePortal} ref={originRef}>
        <FilterIcon />
      </StyledButton>
      {menuPortal(<AzureDevOpsScopingSearchFilterMenu meeting={meeting} menuProps={menuProps} />)}
    </>
  )
}

export default createFragmentContainer(AzureDevOpsScopingSearchFilterToggle, {
  meeting: graphql`
    fragment AzureDevOpsScopingSearchFilterToggle_meeting on PokerMeeting {
      id
      ...AzureDevOpsScopingSearchFilterMenu_meeting
    }
  `
})
