import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ParabolScopingSearchFilterMenu_meeting} from '../__generated__/ParabolScopingSearchFilterMenu_meeting.graphql'
import {MenuProps} from '../hooks/useMenu'

interface Props {
  menuProps: MenuProps
  meeting: ParabolScopingSearchFilterMenu_meeting
}

const ParabolScopingSearchFilterMenu = (props: Props) => {
  const {meeting} = props
  console.log(meeting.id)
  return <div>filter menu</div>
}

export default createFragmentContainer(ParabolScopingSearchFilterMenu, {
  meeting: graphql`
    fragment ParabolScopingSearchFilterMenu_meeting on PokerMeeting {
      id
      parabolSearchQuery {
        queryString
        statusFilters
      }
    }
  `
})
