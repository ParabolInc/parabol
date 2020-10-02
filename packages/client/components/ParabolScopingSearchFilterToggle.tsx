import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchFilterToggle_meeting} from '../__generated__/ParabolScopingSearchFilterToggle_meeting.graphql'
import PlainButton from './PlainButton/PlainButton'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '~/styles/paletteV2'
import {ICON_SIZE} from '~/styles/typographyV2'

const FilterIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24
})

interface Props {
  meeting: ParabolScopingSearchFilterToggle_meeting
}

const ParabolScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  console.log(meeting.id)
  return (
    <PlainButton>
      <FilterIcon>filter_list</FilterIcon>
    </PlainButton>
  )
}

export default createFragmentContainer(ParabolScopingSearchFilterToggle, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterToggle_meeting on PokerMeeting {
      id
    }
  `
})
