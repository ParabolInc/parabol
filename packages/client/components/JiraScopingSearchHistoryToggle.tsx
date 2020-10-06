import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchHistoryToggle_meeting} from '../__generated__/JiraScopingSearchHistoryToggle_meeting.graphql'
import React from 'react'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import styled from '@emotion/styled'
import PlainButton from './PlainButton/PlainButton'

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
  meeting: JiraScopingSearchHistoryToggle_meeting
}

const JiraScopingSearchHistoryToggle = (_props: Props) => {
  // const {meeting} = props
  return (
    <Toggle>
      <SearchIcon>search</SearchIcon>
      <DropdownIcon>expand_more</DropdownIcon>
    </Toggle>
  )
}

export default createFragmentContainer(JiraScopingSearchHistoryToggle, {
  meeting: graphql`
    fragment JiraScopingSearchHistoryToggle_meeting on PokerMeeting {
      id
    }
  `
})
