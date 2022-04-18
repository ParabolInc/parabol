import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import {AzureDevOpsScopingSearchFilterToggle_meeting} from '../__generated__/AzureDevOpsScopingSearchFilterToggle_meeting.graphql'
import AzureDevOpsScopingSearchFilterMenu from './AzureDevOpsScopingSearchFilterMenu'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const FilterIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24
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
      <PlainButton onClick={togglePortal} ref={originRef}>
        <FilterIcon>filter_list</FilterIcon>
      </PlainButton>
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
