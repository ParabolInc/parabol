import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchHistoryToggle_meeting} from '../__generated__/ParabolScopingSearchHistoryToggle_meeting.graphql'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24
})

const DropdownIcon = styled(Icon)({
  color: PALETTE.TEXT_MAIN,
  fontSize: ICON_SIZE.MD18,
  marginLeft: -8
})

const Toggle = styled(PlainButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingRight: 8
})

interface Props {
  meeting: ParabolScopingSearchHistoryToggle_meeting
}

const ParabolScopingSearchHistoryToggle = (props: Props) => {
  const {meeting} = props
  console.log(meeting.id)
  return (
    <Toggle>
      <SearchIcon>search</SearchIcon>
      <DropdownIcon>expand_more</DropdownIcon>
    </Toggle>
  )
}

export default createFragmentContainer(ParabolScopingSearchHistoryToggle, {
  meeting: graphql`
    fragment ParabolScopingSearchHistoryToggle_meeting on PokerMeeting {
      id
    }
  `
})
