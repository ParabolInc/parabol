import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchFilterToggle_meeting} from '../__generated__/JiraScopingSearchFilterToggle_meeting.graphql'
import React from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import PlainButton from './PlainButton/PlainButton'

const FilterIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24
})
interface Props {
  meeting: JiraScopingSearchFilterToggle_meeting
}

const JiraScopingSearchFilterToggle = (props: Props) => {
  const {meeting} = props
  return (
    <PlainButton>
      <FilterIcon>filter_list</FilterIcon>
    </PlainButton>
  )
}

export default createFragmentContainer(JiraScopingSearchFilterToggle, {
  meeting: graphql`
    fragment JiraScopingSearchFilterToggle_meeting on PokerMeeting {
      viewerMeetingMember {
        teamMember {
          atlassianAuth {
            isActive
          }
        }
      }
    }
  `
})
